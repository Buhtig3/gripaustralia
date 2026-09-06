#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "beautifulsoup4>=4.12.0",
#     "duckdb>=1.0.0",
#     "requests>=2.31.0",
# ]
# ///

"""
GripSport Australian Records Scraper & Data Pipeline.
Crawls official Australian grip records from gripsport.org across Men and Women divisions,
enriches contest metadata (exact date and location), integrates Mullet's Mandrel top lifts
and historic Australian benchmark feats, stores the normalized data in DuckDB, and exports
production JSON data files for the Grip Australia website.
"""

import argparse
import json
import logging
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import duckdb
from bs4 import BeautifulSoup

# Import shared utilities from utils.py
from utils import (
    BASE_URL,
    DEFAULT_DB_PATH,
    DEFAULT_MANDREL_JSON,
    DEFAULT_RECORDS_JSON,
    clean_text,
    get_http_session,
    parse_weight_kg,
    slugify,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("scrape_records")

session = get_http_session()

# Broad discipline tag mappings for tabbed navigation
CATEGORY_MAP = {
    # Crush
    "silver bullet 2 (women)": "crush",
    "silver bullet 3 (men)": "crush",
    "silver bullet 3.5 (men)": "crush",
    "silver bullet 4 (men)": "crush",
    "captains of crush no. 3": "crush",
    "captains of crush #3": "crush",
    "crushed-to-dust challenge": "crush",
    # Pinch
    '3/4" crimp plate': "pinch",
    "blockbuster": "pinch",
    "double shallow inch pinch": "pinch",
    "euro 1h": "pinch",
    "euro 2h": "pinch",
    'finnish frame 13"': "pinch",
    "freestyle hub (ironmind)": "pinch",
    'half penny (griptopz) 13"': "pinch",
    "hub (ironmind)": "pinch",
    'levertop (griptopz) 10"': "pinch",
    'moontop (griptopz) 13"': "pinch",
    'napalms nightmare 2 hand pinch (3" blocks)': "pinch",
    'napalms nightmare 2h 2" pinch': "pinch",
    'pocket knife 13"': "pinch",
    'saxon bar 3"x4"': "pinch",
    'shallow hub (griptopz) 13"': "pinch",
    'stub (griptopz) 13"': "pinch",
    "the flask 1h": "pinch",
    "the flask 2h": "pinch",
    'thumb blaster 1 5/8"': "pinch",
    "the york blob": "pinch",
    # Thick-bar
    '2.25" crusher': "thick-bar",
    '2.5" crusher': "thick-bar",
    '2.5" jug': "thick-bar",
    'adjustable thick bar (griptopz) 10"': "thick-bar",
    'andrews axle 2 3/8"': "thick-bar",
    "double overhand axle lockout": "thick-bar",
    "inch dumbbell hold for time (78kg)": "thick-bar",
    'napalms nightmare 1 hand rolling handle (2")': "thick-bar",
    'napalms nightmare 1h 2.375" rolling handle': "thick-bar",
    "napalms nightmare 2": "thick-bar",
    'napalms nightmare 2.375"': "thick-bar",
    'wrist wrench 2 3/8"': "thick-bar",
    "the thomas inch dumbbell": "thick-bar",
    # Vertical-lift
    '2" vertical bar (fbbc)': "vertical-lift",
    'crater 13"': "vertical-lift",
    'finnish ball 13"': "vertical-lift",
    "grab ball": "vertical-lift",
    "grandfather clock / hilt / vertical cannon": "vertical-lift",
    "little big horn": "vertical-lift",
    'mini v-bar 13"': "vertical-lift",
    "tips tester 2h": "vertical-lift",
    "mullett's mandrel": "vertical-lift",
    "mulletts mandrel": "vertical-lift",
}

# Complete Mullet's Mandrel Digitized Leaderboard (from mulletts-mandrel-600ceb8b.png)
MANDREL_DATA: List[Dict[str, Any]] = [
    # Men
    {"rank": 1, "athleteId": 2331, "name": "Henry Mullett", "gender": "men", "weightKg": 133.55, "isRecord": True, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2331", "aliases": []},
    {"rank": 2, "athleteId": 2083, "name": "Isaac Pitt", "gender": "men", "weightKg": 113.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2083", "aliases": []},
    {"rank": 3, "athleteId": 1464, "name": "Glenn Hunter", "gender": "men", "weightKg": 93.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/1464", "aliases": []},
    {"rank": 4, "athleteId": 1625, "name": "Thomas Denmeade", "gender": "men", "weightKg": 93.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/1625", "aliases": ["Tom Denmeade"]},
    {"rank": 5, "athleteId": 1570, "name": "Joseph Hodgson", "gender": "men", "weightKg": 91.30, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/1570", "aliases": []},
    {"rank": 6, "athleteId": 2786, "name": "Jayden Osmialowski", "gender": "men", "weightKg": 88.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2786", "aliases": []},
    {"rank": 7, "athleteId": 2424, "name": "Samuel Vogt", "gender": "men", "weightKg": 88.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2424", "aliases": ["Sam Vogt"]},
    {"rank": 8, "athleteId": 2079, "name": "Mark Boylin", "gender": "men", "weightKg": 79.50, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2079", "aliases": []},
    {"rank": 9, "athleteId": 2785, "name": "Travis Herbert", "gender": "men", "weightKg": 78.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2785", "aliases": []},
    {"rank": 10, "athleteId": 2329, "name": "Dominic Awad", "gender": "men", "weightKg": 73.80, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2329", "aliases": []},
    {"rank": 11, "athleteId": 2423, "name": "Lachlan Simms", "gender": "men", "weightKg": 73.80, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2423", "aliases": []},
    {"rank": 12, "athleteId": 2425, "name": "Mathew Wayling", "gender": "men", "weightKg": 73.80, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2425", "aliases": ["Matt Wayling"]},
    {"rank": 13, "athleteId": 2426, "name": "James Sue", "gender": "men", "weightKg": 68.80, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2426", "aliases": []},
    {"rank": 14, "athleteId": 2082, "name": 'Dejan "Dead" Redzic', "gender": "men", "weightKg": 68.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2082", "aliases": ["Dean Redzic", "Dead Redzic", "Dejan Redzic"]},
    {"rank": 15, "athleteId": 2784, "name": "Sean Magnusson", "gender": "men", "weightKg": 63.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2784", "aliases": []},
    {"rank": 16, "athleteId": 2428, "name": "Thomas Claxton", "gender": "men", "weightKg": 63.80, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2428", "aliases": ["Tom Claxton"]},
    {"rank": 17, "athleteId": 2427, "name": "Joseph Ameer", "gender": "men", "weightKg": 58.80, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2427", "aliases": ["Joe Ameer"]},
    {"rank": 18, "athleteId": 2783, "name": "Andrew Hodge", "gender": "men", "weightKg": 38.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2783", "aliases": []},
    {"rank": 19, "athleteId": 2788, "name": "James Burns", "gender": "men", "weightKg": 38.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2788", "aliases": []},
    # Women
    {"rank": 1, "athleteId": 2078, "name": "Sarah Rodwell", "gender": "women", "weightKg": 53.80, "isRecord": True, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2078", "aliases": []},
    {"rank": 2, "athleteId": 2778, "name": "Megan Galvin", "gender": "women", "weightKg": 53.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2778", "aliases": []},
    {"rank": 3, "athleteId": 2781, "name": "Naomi Denmeade", "gender": "women", "weightKg": 48.55, "isRecord": False, "gsiAthleteUrl": "https://www.gripsport.org/athlete/2781", "aliases": []},
]

# Historic Australian Feat Benchmarks
HISTORIC_FEATS: List[Dict[str, Any]] = [
    {
        "id": "thomas-inch-dumbbell-joseph-hodgson",
        "event": "The Thomas Inch Dumbbell (Mega-Inch)",
        "category": "historical-feat",
        "gender": "men",
        "division": "Open",
        "weightClass": "Heavyweight",
        "weightKg": 104.0,
        "unit": "kg",
        "holder": "Joseph Hodgson",
        "athleteId": 1570,
        "gsiAthleteUrl": "https://gripsport.org/athlete/1570",
        "date": "2022-06-01",
        "year": 2022,
        "contest": "Wallace Challenge / Historic Lift",
        "contestUrl": "https://www.oldmanofthestones.com/blog/wallace-challenge-dumbells",
        "location": "Sydney, NSW",
        "sanctioned": False,
        "sanctioningBody": "Historic Benchmark",
        "verificationUrl": "https://www.instagram.com/reel/CeQJ_U7gXLO/",
        "status": "current",
        "notes": "Deadlifted 104kg Holle Mega-Inch, 95kg SoS Circus Bell, 83kg HK, and 78kg Holle.",
    },
    {
        "id": "thomas-inch-dumbbell-bruce-white",
        "event": "Original Thomas Inch Dumbbell",
        "category": "historical-feat",
        "gender": "men",
        "division": "Open",
        "weightClass": "Open",
        "weightKg": 78.3,
        "unit": "kg",
        "holder": "Bruce White",
        "athleteId": None,
        "gsiAthleteUrl": None,
        "date": "1995-01-01",
        "year": 1995,
        "contest": "Historic Feat Certification",
        "contestUrl": "https://www.oldtimestrongman.com/blog/2015/09/03/bruce-whites-inch-dumbbell/",
        "location": "Melbourne, VIC",
        "sanctioned": False,
        "sanctioningBody": "Historic Benchmark",
        "verificationUrl": "https://www.oldtimestrongman.com/blog/2015/09/03/bruce-whites-inch-dumbbell/",
        "status": "historical",
        "notes": "1st Australian to lift the Original 1906 Thomas Inch 78.3kg Dumbbell.",
    },
    {
        "id": "the-york-blob-blobzilla-joseph-hodgson",
        "event": "The York Blob (Blobzilla)",
        "category": "historical-feat",
        "gender": "men",
        "division": "Open",
        "weightClass": "Open",
        "weightKg": 29.5,
        "unit": "kg",
        "holder": "Joseph Hodgson",
        "athleteId": 1570,
        "gsiAthleteUrl": "https://gripsport.org/athlete/1570",
        "date": "2023-01-01",
        "year": 2023,
        "contest": "Historic Block Weight Lift",
        "contestUrl": None,
        "location": "Sydney, NSW",
        "sanctioned": False,
        "sanctioningBody": "Historic Benchmark",
        "verificationUrl": None,
        "status": "current",
        "notes": "Conquered full progression: 24kg Holle, 30kg Holle, Original Fatman, Legacy 120, and Blobzilla (~29.5kg+).",
    },
    {
        "id": "the-york-blob-fatman-william-fuggle",
        "event": "Original 50 lb York Fatman Blob",
        "category": "historical-feat",
        "gender": "men",
        "division": "Open",
        "weightClass": "Open",
        "weightKg": 22.7,
        "unit": "kg",
        "holder": "Will Fuggle",
        "athleteId": 2163,
        "gsiAthleteUrl": "https://www.gripsport.org/athlete/2163",
        "date": "2023-11-15",
        "year": 2023,
        "contest": "Historic Block Weight Lift",
        "contestUrl": None,
        "location": "Sydney, NSW",
        "sanctioned": False,
        "sanctioningBody": "Historic Benchmark",
        "verificationUrl": "https://vimeo.com/900485203",
        "status": "current",
        "notes": "Lifted 24kg Holle replica and vintage original 50 lb York roundhead half (credited to Will Fuggle / William Fuggle, GSI #2163).",
    },
    {
        "id": "coc-3-jermiah-merciconah",
        "event": "Captains of Crush No. 3 Certification",
        "category": "historical-feat",
        "gender": "men",
        "division": "Open",
        "weightClass": "Open",
        "weightKg": 127.0,
        "unit": "kg",
        "holder": "Jermiah Merciconah",
        "athleteId": 2332,
        "gsiAthleteUrl": "https://www.gripsport.org/athlete/2332",
        "date": "2023-08-10",
        "year": 2023,
        "contest": "IronMind Official Certification",
        "contestUrl": "https://ironmind.com/product-info/certification/captains-of-crush/whos-who-no.-3-coc/",
        "location": "Brisbane, QLD",
        "sanctioned": True,
        "sanctioningBody": "IronMind",
        "verificationUrl": "https://www.youtube.com/watch?v=Fc5NZ1OROWE",
        "status": "current",
        "notes": "Officially certified under strict credit-card set rules.",
    },
    {
        "id": "crushed-to-dust-will-fuggle",
        "event": "IronMind Crushed-to-Dust! Challenge",
        "category": "historical-feat",
        "gender": "men",
        "division": "Open",
        "weightClass": "Open",
        "weightKg": 198.5,
        "unit": "kg",
        "holder": "Will Fuggle",
        "athleteId": 2163,
        "gsiAthleteUrl": "https://www.gripsport.org/athlete/2163",
        "date": "2024-03-02",
        "year": 2024,
        "contest": "IronMind Official Certification",
        "contestUrl": "https://www.ironmind.com/certification/crushed-to-dust-challenge/certification-list/",
        "location": "Sydney, NSW",
        "sanctioned": True,
        "sanctioningBody": "IronMind",
        "verificationUrl": "https://www.youtube.com/watch?v=G_0bfqXlGfc&t=60s",
        "status": "current",
        "notes": "1st Australian to officially certify (CoC #2 + 90kg Rolling Thunder + 20kg Hub in <3 mins).",
    },
    {
        "id": "crushed-to-dust-isaac-pitt",
        "event": "IronMind Crushed-to-Dust! Challenge",
        "category": "historical-feat",
        "gender": "men",
        "division": "Open",
        "weightClass": "Open",
        "weightKg": 198.5,
        "unit": "kg",
        "holder": "Isaac Pitt",
        "athleteId": 2083,
        "gsiAthleteUrl": "https://gripsport.org/athlete/2083",
        "date": "2025-01-20",
        "year": 2025,
        "contest": "IronMind Official Certification",
        "contestUrl": "https://www.ironmind.com/certification/crushed-to-dust-challenge/certification-list/",
        "location": "Hobart, TAS",
        "sanctioned": True,
        "sanctioningBody": "IronMind",
        "verificationUrl": "https://www.youtube.com/watch?v=8BRUsE_1KkA",
        "status": "current",
        "notes": "Officially certified under official IronMind referee verification.",
    },
]


def determine_category(event_name: str) -> str:
    """Classifies an event name into a standardized discipline category tag."""
    norm = clean_text(event_name).lower()
    if norm in CATEGORY_MAP:
        return CATEGORY_MAP[norm]

    # Keyword heuristics
    if any(k in norm for k in ["bullet", "gripper", "crush"]):
        return "crush"
    if any(k in norm for k in ["pinch", "flask", "hub", "block", "crimp", "saxon", "stub"]):
        return "pinch"
    if any(k in norm for k in ["axle", "crusher", "jug", "rolling", "wrench", "thick bar"]):
        return "thick-bar"
    if any(k in norm for k in ["vertical", "v-bar", "cannon", "clock", "horn", "ball", "crater", "mandrel", "tips tester"]):
        return "vertical-lift"

    return "vertical-lift"


def init_db(con: duckdb.DuckDBPyConnection):
    """Initializes DuckDB schema for records, contest cache, and mandrel records."""
    con.execute("""
        CREATE TABLE IF NOT EXISTS australian_records (
            id VARCHAR PRIMARY KEY,
            event VARCHAR,
            category VARCHAR,
            gender VARCHAR,
            division VARCHAR,
            weight_class VARCHAR,
            weight_kg DOUBLE,
            unit VARCHAR,
            holder VARCHAR,
            athlete_id INTEGER,
            gsi_athlete_url VARCHAR,
            date VARCHAR,
            year INTEGER,
            contest VARCHAR,
            contest_id INTEGER,
            contest_url VARCHAR,
            location VARCHAR,
            sanctioned BOOLEAN,
            sanctioning_body VARCHAR,
            verification_url VARCHAR,
            status VARCHAR,
            notes VARCHAR,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    con.execute("""
        CREATE TABLE IF NOT EXISTS contest_cache (
            contest_id INTEGER PRIMARY KEY,
            contest_name VARCHAR,
            contest_date VARCHAR,
            location VARCHAR,
            cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    con.execute("""
        CREATE TABLE IF NOT EXISTS mandrel_records (
            id VARCHAR PRIMARY KEY,
            rank INTEGER,
            name VARCHAR,
            gender VARCHAR,
            weight_kg DOUBLE,
            weight_lbs DOUBLE,
            is_record BOOLEAN
        );
    """)


def fetch_contest_details(con: duckdb.DuckDBPyConnection, contest_id: int, contest_url: str) -> Tuple[Optional[str], Optional[str]]:
    """Fetches and caches exact date and location from contest page."""
    # Check cache
    cached = con.execute(
        "SELECT contest_date, location FROM contest_cache WHERE contest_id = ?",
        [contest_id],
    ).fetchone()
    if cached and (cached[0] or cached[1]):
        return cached[0], cached[1]

    try:
        time.sleep(0.5)  # Gentle polite pacing
        resp = session.get(contest_url, timeout=15)
        if resp.status_code != 200:
            return None, None
    except Exception as e:
        logger.warning("Error fetching contest %d (%s): %s", contest_id, contest_url, e)
        return None, None

    soup = BeautifulSoup(resp.text, "html.parser")
    contest_date = None
    location = None

    # Search for "Date: <value>" and "Location: <value>"
    text_content = soup.get_text(" ", strip=True)
    date_match = re.search(r"Date:\s*([A-Za-z]+ \d{1,2},? \d{4})", text_content)
    if date_match:
        raw_date_str = date_match.group(1).replace(",", "")
        try:
            parsed_date = datetime.strptime(raw_date_str, "%B %d %Y")
            contest_date = parsed_date.strftime("%Y-%m-%d")
        except ValueError:
            contest_date = raw_date_str

    loc_match = re.search(r"Location:\s*([^,\n]+(?:,\s*[^,\n]+)?)", text_content)
    if loc_match:
        loc_str = clean_text(loc_match.group(1))
        # Remove trailing promoter info if present
        loc_str = re.sub(r"Promoter:.*$", "", loc_str).strip()
        location = loc_str

    con.execute(
        """
        INSERT OR REPLACE INTO contest_cache (contest_id, contest_name, contest_date, location)
        VALUES (?, ?, ?, ?)
        """,
        [contest_id, soup.title.text.strip() if soup.title else "", contest_date, location],
    )
    return contest_date, location


def parse_records_table(
    con: duckdb.DuckDBPyConnection,
    gender_code: int,
    gender_label: str,
    country_code: int = 5,
    enrich_contests: bool = True,
) -> List[Dict[str, Any]]:
    """Parses https://gripsport.org/records for a specific gender."""
    url = f"{BASE_URL}/records?gender={gender_code}&country={country_code}&measurement=0&weightclass=all"
    logger.info("Fetching %s records from %s...", gender_label.title(), url)

    try:
        resp = session.get(url, timeout=25)
        if resp.status_code != 200:
            logger.error("Failed to fetch %s records: HTTP %d", gender_label, resp.status_code)
            return []
    except Exception as e:
        logger.error("Exception fetching %s records: %s", gender_label, e)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    table = soup.find("table", id="recordsTable")
    if not table:
        logger.error("recordsTable not found on page!")
        return []

    rows = table.find("tbody").find_all("tr")
    records = []

    for row in rows:
        tds = row.find_all("td")
        if len(tds) < 6:
            continue

        # Event
        event_a = tds[0].find("a")
        event_name = clean_text(tds[0].get_text(strip=True))

        # Athlete
        athlete_a = tds[1].find("a")
        athlete_name = clean_text(tds[1].get_text(strip=True))
        athlete_id = None
        gsi_athlete_url = None
        if athlete_a and "href" in athlete_a.attrs:
            href = athlete_a["href"].strip()
            match = re.search(r"/athlete/(\d+)", href)
            if match:
                athlete_id = int(match.group(1))
                gsi_athlete_url = f"{BASE_URL}/athlete/{athlete_id}"
            else:
                gsi_athlete_url = href if href.startswith("http") else f"{BASE_URL}{href}"

        # Result
        result_raw = clean_text(tds[2].get_text(strip=True))
        weight_kg, unit = parse_weight_kg(result_raw)

        # Weight class & Division
        wc_raw = clean_text(tds[3].get_text(strip=True))
        division = "Open"
        weight_class = wc_raw
        if "masters" in wc_raw.lower():
            m_match = re.search(r"(Masters\s*[\d\-+]+)", wc_raw, re.IGNORECASE)
            division = m_match.group(1) if m_match else "Masters"
        clean_wc_match = re.search(r"(?:Mens|Womens)\s*(\d+)(k|\+)?(\+)?", wc_raw, re.IGNORECASE)
        if clean_wc_match:
            num = clean_wc_match.group(1)
            is_plus = "+" in wc_raw
            weight_class = f"{num}kg+" if is_plus else f"{num}kg"
        elif "open" in wc_raw.lower():
            weight_class = "Open"

        # Contest
        contest_a = tds[4].find("a")
        contest_name = clean_text(tds[4].get_text(strip=True))
        contest_id = None
        contest_url = None
        if contest_a and "href" in contest_a.attrs:
            c_href = contest_a["href"].strip()
            c_match = re.search(r"/contest/(\d+)", c_href)
            if c_match:
                contest_id = int(c_match.group(1))
                contest_url = f"{BASE_URL}/contest/{contest_id}"

        # Year
        year_str = clean_text(tds[5].get_text(strip=True))
        try:
            year_int = int(re.sub(r"[^\d]", "", year_str))
        except ValueError:
            year_int = datetime.now().year

        contest_date = f"{year_int}-01-01"
        location = "Australia"

        if enrich_contests and contest_id and contest_url:
            fetched_date, fetched_loc = fetch_contest_details(con, contest_id, contest_url)
            if fetched_date:
                contest_date = fetched_date
            if fetched_loc:
                location = fetched_loc

        category = determine_category(event_name)
        record_id = f"{slugify(event_name)}-{gender_label}-{slugify(weight_class)}"

        record_entry = {
            "id": record_id,
            "event": event_name,
            "category": category,
            "gender": gender_label,
            "division": division,
            "weightClass": weight_class,
            "weightKg": weight_kg,
            "unit": unit,
            "holder": athlete_name,
            "athleteId": athlete_id,
            "gsiAthleteUrl": gsi_athlete_url,
            "date": contest_date,
            "year": year_int,
            "contest": contest_name,
            "contestId": contest_id,
            "contestUrl": contest_url,
            "location": location,
            "sanctioned": True,
            "sanctioningBody": "GSI",
            "verificationUrl": None,
            "status": "current",
            "notes": None,
        }
        records.append(record_entry)

    logger.info("Found %d records for %s.", len(records), gender_label)
    return records


def save_to_duckdb(con: duckdb.DuckDBPyConnection, records: List[Dict[str, Any]]):
    """Inserts or updates records into DuckDB table australian_records."""
    for r in records:
        con.execute(
            """
            INSERT OR REPLACE INTO australian_records (
                id, event, category, gender, division, weight_class, weight_kg, unit,
                holder, athlete_id, gsi_athlete_url, date, year, contest, contest_id,
                contest_url, location, sanctioned, sanctioning_body, verification_url,
                status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                r["id"],
                r["event"],
                r["category"],
                r["gender"],
                r["division"],
                r["weightClass"],
                r["weightKg"],
                r.get("unit", "kg"),
                r["holder"],
                r.get("athleteId"),
                r.get("gsiAthleteUrl"),
                r["date"],
                r.get("year", int(r["date"][:4]) if r.get("date") else None),
                r["contest"],
                r.get("contestId"),
                r.get("contestUrl"),
                r.get("location"),
                r["sanctioned"],
                r["sanctioningBody"],
                r.get("verificationUrl"),
                r["status"],
                r.get("notes"),
            ],
        )
    logger.info("Saved %d records into DuckDB (australian_records table).", len(records))


def save_mandrel_to_duckdb(con: duckdb.DuckDBPyConnection, mandrel_entries: List[Dict[str, Any]]):
    """Populates the mandrel_records table with full digitized records."""
    for item in mandrel_entries:
        entry_id = f"mandrel-{item['gender']}-rank-{item['rank']}"
        weight_lbs = round(item["weightKg"] * 2.20462, 1)
        con.execute(
            """
            INSERT OR REPLACE INTO mandrel_records (
                id, rank, name, gender, weight_kg, weight_lbs, is_record
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                entry_id,
                item["rank"],
                item["name"],
                item["gender"],
                item["weightKg"],
                weight_lbs,
                item["isRecord"],
            ],
        )
    logger.info("Saved %d Mandrel records into DuckDB (mandrel_records table).", len(mandrel_entries))


def main():
    parser = argparse.ArgumentParser(description="GripSport Australian Records Scraper & Exporter.")
    parser.add_argument("--db-path", type=Path, default=DEFAULT_DB_PATH, help="Path to DuckDB database.")
    parser.add_argument("--records-json", type=Path, default=DEFAULT_RECORDS_JSON, help="Path to output records.json.")
    parser.add_argument("--mandrel-json", type=Path, default=DEFAULT_MANDREL_JSON, help="Path to output mandrel_records.json.")
    parser.add_argument("--no-enrich-contests", action="store_true", help="Skip visiting individual contest pages for date & location.")
    args = parser.parse_args()

    con = duckdb.connect(str(args.db_path))
    init_db(con)

    # 1. Scrape GSI Australian Records for Men and Women
    men_records = parse_records_table(
        con, gender_code=1, gender_label="men", country_code=5, enrich_contests=not args.no_enrich_contests
    )
    women_records = parse_records_table(
        con, gender_code=2, gender_label="women", country_code=5, enrich_contests=not args.no_enrich_contests
    )

    all_scraped_records = men_records + women_records

    # 2. Add Top Class Records for Mullet's Mandrel
    mandrel_top_records = [
        {
            "id": "mulletts-mandrel-mens-open",
            "event": "Mullett's Mandrel",
            "category": "vertical-lift",
            "gender": "men",
            "division": "Open",
            "weightClass": "120kg+",
            "weightKg": 133.55,
            "unit": "kg",
            "holder": "Henry Mullett",
            "athleteId": 2331,
            "gsiAthleteUrl": "https://gripsport.org/athlete/2331",
            "date": "2024-06-01",
            "year": 2024,
            "contest": "Australian Grip Record Benchmark",
            "contestId": None,
            "contestUrl": None,
            "location": "Melbourne, VIC",
            "sanctioned": False,
            "sanctioningBody": "Mullett's Mandrel",
            "verificationUrl": "https://player.vimeo.com/video/1113586899",
            "status": "current",
            "notes": "Henry Mullett all-time record 133.55kg on calibrated mandrel.",
        },
        {
            "id": "mulletts-mandrel-womens-open",
            "event": "Mullett's Mandrel",
            "category": "vertical-lift",
            "gender": "women",
            "division": "Open",
            "weightClass": "Open",
            "weightKg": 53.80,
            "unit": "kg",
            "holder": "Sarah Rodwell",
            "athleteId": 2078,
            "gsiAthleteUrl": "https://www.gripsport.org/athlete/2078",
            "date": "2024-06-01",
            "year": 2024,
            "contest": "Australian Grip Record Benchmark",
            "contestId": None,
            "contestUrl": None,
            "location": "Canberra, ACT",
            "sanctioned": False,
            "sanctioningBody": "Mullett's Mandrel",
            "verificationUrl": None,
            "status": "current",
            "notes": "Sarah Rodwell all-time women's record 53.80kg on calibrated mandrel.",
        },
    ]

    combined_records = all_scraped_records + mandrel_top_records + HISTORIC_FEATS

    # 3. Store in DuckDB
    save_to_duckdb(con, combined_records)

    # 4. Store full Mandrel roster in DuckDB
    save_mandrel_to_duckdb(con, MANDREL_DATA)

    # 5. Export JSON data files for web build
    args.records_json.parent.mkdir(parents=True, exist_ok=True)
    with open(args.records_json, "w", encoding="utf-8") as f:
        json.dump(combined_records, f, indent=2, ensure_ascii=False)
    logger.info("Exported %d records to %s", len(combined_records), args.records_json)

    # Compute imperial pounds for mandrel dataset
    mandrel_export = []
    for item in MANDREL_DATA:
        mandrel_export.append(
            {
                **item,
                "weightLbs": round(item["weightKg"] * 2.20462, 1),
            }
        )
    args.mandrel_json.parent.mkdir(parents=True, exist_ok=True)
    with open(args.mandrel_json, "w", encoding="utf-8") as f:
        json.dump(mandrel_export, f, indent=2, ensure_ascii=False)
    logger.info("Exported %d Mandrel entries to %s", len(mandrel_export), args.mandrel_json)

    # Export metadata
    meta_path = args.records_json.parent / "records_meta.json"
    now = datetime.now()
    metadata = {
        "processedDate": now.strftime("%Y-%m-%d"),
        "processedDisplay": now.strftime("%B %d, %Y"),
        "processedTimestamp": now.isoformat(),
        "sourceOrigin": "gripsport.org (Grip Sport International)",
        "sourceUrl": "https://gripsport.org/records?country=5&measurement=0&weightclass=all",
        "sanctioningBody": "Grip Sport International (GSI)",
        "totalRecords": len(combined_records),
        "menGsiRecords": len(men_records),
        "womenGsiRecords": len(women_records),
        "mandrelRecords": len(mandrel_top_records),
        "historicFeats": len(HISTORIC_FEATS),
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    logger.info("Exported metadata to %s", meta_path)

    con.close()
    print(f"\nSuccessfully generated records: {len(combined_records)} entries ({len(men_records)} Men GSI, {len(women_records)} Women GSI, 2 Mandrel, {len(HISTORIC_FEATS)} Historic Feats).")


if __name__ == "__main__":
    main()
