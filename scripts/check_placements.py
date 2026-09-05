#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "beautifulsoup4>=4.12.0",
#     "duckdb>=1.0.0",
#     "requests>=2.31.0",
# ]
# ///

import logging
import re
import sys
import time
from pathlib import Path
from typing import Set, Tuple
import duckdb
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# --- Configuration & Paths ---
BASE_URL = "https://www.gripsport.org"
DB_PATH = Path("gripsport.duckdb")
CSV_EXPORT_PATH = Path("athlete_first_placements.csv")
DEBUG_DIR = Path("debug_html")
DEBUG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("gripsport")

session = requests.Session()
retries = Retry(
    total=3,
    backoff_factor=1.5,
    status_forcelist=[500, 502, 503, 504],
    raise_on_status=False,
)
session.mount("https://", adapter=HTTPAdapter(max_retries=retries))
session.mount("http://", adapter=HTTPAdapter(max_retries=retries))
session.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) GripSportResearch/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml",
    }
)


def init_db(con: duckdb.DuckDBPyConnection):
    """Creates candidates, tracked_events, and athlete_first_places tables."""
    con.execute("""
        CREATE TABLE IF NOT EXISTS tracked_events (
            event_name VARCHAR PRIMARY KEY,
            discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    con.execute("""
        CREATE TABLE IF NOT EXISTS candidates (
            athlete_id INTEGER PRIMARY KEY,
            name VARCHAR,
            country VARCHAR,
            gender VARCHAR,
            contests INTEGER,
            profile_url VARCHAR,
            status VARCHAR DEFAULT 'pending',
            discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    con.execute("""
        CREATE TABLE IF NOT EXISTS athlete_first_places (
            athlete_id INTEGER PRIMARY KEY,
            name VARCHAR,
            contests INTEGER,
            class_ones_all INTEGER,
            class_ones_tracked INTEGER,
            profile_url VARCHAR,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (athlete_id) REFERENCES candidates(athlete_id)
        );
    """)
    logger.info("DuckDB tables initialized.")


def fetch_tracked_events(con: duckdb.DuckDBPyConnection) -> Set[str]:
    """
    Crawls https://www.gripsport.org/events across all 3 pages
    and stores currently tracked implements into the tracked_events table.
    """
    logger.info("Fetching currently tracked implements from /events...")
    events_found = set()

    for page in range(1, 4):
        url = f"{BASE_URL}/events?page={page}"
        logger.info("Crawling tracked events page %d: %s", page, url)
        try:
            resp = session.get(url, timeout=20)
            if resp.status_code != 200:
                logger.warning("Events page %d returned HTTP %d", page, resp.status_code)
                break
        except requests.RequestException as e:
            logger.error("Error fetching events page %d: %s", page, e)
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        table = soup.find("table")
        if not table:
            break

        rows = table.find_all("tr")[1:]  # skip header
        for row in rows:
            cols = row.find_all("td")
            if cols:
                event_name = cols[0].text.strip()
                # Remove extra spaces or trailing newlines
                event_name = re.sub(r"\s+", " ", event_name)
                if event_name:
                    events_found.add(event_name)
                    con.execute(
                        "INSERT OR IGNORE INTO tracked_events (event_name) VALUES (?)",
                        [event_name],
                    )

        time.sleep(1.0)

    logger.info("Total currently tracked events loaded: %d", len(events_found))
    return events_found


def discover_and_save_candidates(
    con: duckdb.DuckDBPyConnection, min_contests: int = 8, max_pages: int = 66
):
    """Crawls directory pages and discovers candidates with >= min_contests."""
    logger.info("Scanning directory for athletes with >= %d contests...", min_contests)
    total_saved = 0

    for page in range(1, max_pages + 1):
        url = f"{BASE_URL}/athletes?page={page}"
        try:
            resp = session.get(url, timeout=20)
            if resp.status_code != 200:
                logger.warning("Page %d returned HTTP %d. Halting scan.", page, resp.status_code)
                break
        except requests.RequestException as e:
            logger.error("Connection error on page %d: %s", page, e)
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        table = soup.find("table")
        if not table:
            break

        headers = [th.text.strip().lower() for th in table.find_all("th")]
        contest_col_idx = None
        for idx, h in enumerate(headers):
            if "total" in h and "contest" in h:
                contest_col_idx = idx
                break
        if contest_col_idx is None:
            contest_col_idx = 5 if len(headers) >= 6 else -1

        rows = table.find_all("tr")[1:]
        if not rows:
            break

        candidates_on_page = 0
        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 4:
                continue

            link = row.find("a", href=re.compile(r"/athlete/\d+"))
            if not link:
                continue

            athlete_name = link.text.strip()
            href = link["href"].strip()
            match = re.search(r"/athlete/(\d+)", href)
            if not match:
                continue
            athlete_id = int(match.group(1))

            raw_contests = cols[contest_col_idx].text.strip()
            digits = re.sub(r"[^\d]", "", raw_contests)
            contests = int(digits) if digits else 0

            if contests >= min_contests:
                profile_url = href if href.startswith("http") else f"{BASE_URL}{href}"
                country = cols[1].text.strip() if len(cols) > 1 else ""
                gender = cols[2].text.strip() if len(cols) > 2 else ""

                con.execute(
                    """
                    INSERT INTO candidates (athlete_id, name, country, gender, contests, profile_url, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'pending')
                    ON CONFLICT (athlete_id) DO UPDATE SET
                        contests = excluded.contests,
                        profile_url = excluded.profile_url;
                """,
                    [athlete_id, athlete_name, country, gender, contests, profile_url],
                )
                candidates_on_page += 1
                total_saved += 1

        logger.info("Directory page %d/%d: found %d qualifying athletes.", page, max_pages, candidates_on_page)
        time.sleep(1.0)

    pending_count = con.execute("SELECT COUNT(*) FROM candidates WHERE status = 'pending'").fetchone()[0]
    logger.info("Discovery complete. Total pending candidates to inspect: %d", pending_count)


def count_class_ones(profile_url: str, tracked_events: Set[str]) -> Tuple[int, int]:
    """
    Parses the Best Results table on an athlete's profile.
    Returns: (class_ones_all, class_ones_tracked)
    """
    try:
        resp = session.get(profile_url, timeout=20)
        if resp.status_code != 200:
            return 0, 0
    except requests.RequestException:
        return 0, 0

    soup = BeautifulSoup(resp.text, "html.parser")
    best_results_table = None
    class_idx = None
    event_idx = 0  # Event is always column 0 in Best Results

    for table in soup.find_all("table"):
        headers = [th.text.strip().lower() for th in table.find_all("th")]
        if any("class" in h for h in headers) and any("place" in h for h in headers):
            best_results_table = table
            class_idx = next(i for i, h in enumerate(headers) if "class" in h and "place" in h)
            # Find event index if not first column
            for i, h in enumerate(headers):
                if "event" in h:
                    event_idx = i
                    break
            break

    if best_results_table is None:
        return 0, 0

    all_ones = 0
    tracked_ones = 0
    # Clean tracked event lookup set (lowercase, normalized whitespace)
    normalized_tracked = {re.sub(r"\s+", " ", e).strip().lower(): e for e in tracked_events}

    for row in best_results_table.find_all("tr")[1:]:
        cells = row.find_all("td")
        if len(cells) > class_idx:
            val = cells[class_idx].text.strip()
            if val == "1":
                all_ones += 1
                event_name = cells[event_idx].text.strip()
                norm_event = re.sub(r"\s+", " ", event_name).lower()
                if norm_event in normalized_tracked:
                    tracked_ones += 1

    return all_ones, tracked_ones


def process_candidates(con: duckdb.DuckDBPyConnection, tracked_events: Set[str], force_reprocess: bool = False):
    """
    Evaluates candidate profiles.
    Set force_reprocess=True to recalculate athletes already marked 'completed'.
    """
    if force_reprocess:
        con.execute("UPDATE candidates SET status = 'pending'")

    pending = con.execute("""
        SELECT athlete_id, name, contests, profile_url
        FROM candidates
        WHERE status = 'pending'
        ORDER BY contests DESC
    """).fetchall()

    if not pending:
        logger.info("No pending candidates to process.")
        return

    logger.info("Processing %d athletes for tracked vs. non-tracked #1 placements...", len(pending))

    try:
        for idx, (athlete_id, name, contests, url) in enumerate(pending, 1):
            time.sleep(1.3)  # Gentle pacing
            c1_all, c1_tracked = count_class_ones(url, tracked_events)

            con.execute(
                """
                INSERT OR REPLACE INTO athlete_first_places (
                    athlete_id, name, contests, class_ones_all, class_ones_tracked, profile_url
                ) VALUES (?, ?, ?, ?, ?, ?)
            """,
                [athlete_id, name, contests, c1_all, c1_tracked, url],
            )

            con.execute("UPDATE candidates SET status = 'completed' WHERE athlete_id = ?", [athlete_id])

            logger.info(
                "[%d/%d] ID %d: %s (%d contests) -> %d Tracked #1s (out of %d total #1s)",
                idx, len(pending), athlete_id, name, contests, c1_tracked, c1_all,
            )

    except KeyboardInterrupt:
        logger.warning("Process interrupted by user (Ctrl+C). Progress is safely saved.")


def export_and_summarize(con: duckdb.DuckDBPyConnection):
    """Exports both placement metrics to CSV and displays the tracked #1 leaderboard."""
    con.execute(f"""
        COPY (
            SELECT 
                p.athlete_id,
                p.name,
                c.country,
                p.contests,
                p.class_ones_tracked AS tracked_class_ones,
                p.class_ones_all AS total_class_ones,
                p.profile_url,
                p.scraped_at
            FROM athlete_first_places p
            LEFT JOIN candidates c ON p.athlete_id = c.athlete_id
            ORDER BY p.class_ones_tracked DESC, p.class_ones_all DESC, p.contests DESC
        ) TO '{CSV_EXPORT_PATH}' (HEADER, DELIMITER ',');
    """)
    logger.info("Exported leaderboard to '%s'.", CSV_EXPORT_PATH)

    top_tracked = con.execute("""
        SELECT p.name, c.country, p.class_ones_tracked, p.class_ones_all, p.contests
        FROM athlete_first_places p
        LEFT JOIN candidates c ON p.athlete_id = c.athlete_id
        ORDER BY p.class_ones_tracked DESC, p.class_ones_all DESC
        LIMIT 15
    """).fetchall()

    print("\n" + "=" * 70)
    print("     GRIP SPORT LEADERBOARD: #1 PLACEMENTS (CURRENTLY TRACKED)")
    print("=" * 70)
    print(f"{'Rank':<5} {'Athlete Name':<25} {'Country':<10} {'Tracked #1s':<14} {'Total #1s':<12} {'Contests'}")
    print("-" * 70)
    for rank, (name, country, c_tracked, c_all, contests) in enumerate(top_tracked, 1):
        country_str = f"({country})" if country else ""
        print(f"{rank:<5} {name:<25} {country_str:<10} {c_tracked:<14} {c_all:<12} {contests}")
    print("=" * 70 + "\n")


def main():
    con = duckdb.connect(str(DB_PATH))
    init_db(con)

    # 1. Fetch currently tracked events list from gripsport.org/events
    tracked_events = fetch_tracked_events(con)

    # 2. Discover candidates with >= 8 contests across the 65 directory pages
    discover_and_save_candidates(con, min_contests=8)

    # 3. Process candidates (set force_reprocess=True if re-evaluating previously cached runs)
    process_candidates(con, tracked_events, force_reprocess=True)

    # 4. Save results to CSV and print the leaderboard
    export_and_summarize(con)

    con.close()


if __name__ == "__main__":
    main()