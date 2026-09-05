#!/usr/bin/env python3
"""
Shared utilities for Grip Sport International (GSI) scraping and data processing.
Provides HTTP session configuration, DuckDB helpers, text normalization, and slugification.
"""

import html
import re
from pathlib import Path
from typing import Optional
import duckdb
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "https://www.gripsport.org"
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_DB_PATH = SCRIPT_DIR / "gripsport.duckdb"
DEFAULT_RECORDS_JSON = REPO_ROOT / "src" / "data" / "records.json"
DEFAULT_MANDREL_JSON = REPO_ROOT / "src" / "data" / "mandrel_records.json"


def get_http_session(
    user_agent: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) GripSportResearch/1.0",
    total_retries: int = 4,
    backoff_factor: float = 1.5,
) -> requests.Session:
    """Returns a requests Session pre-configured with retries and standard headers."""
    session = requests.Session()
    retries = Retry(
        total=total_retries,
        backoff_factor=backoff_factor,
        status_forcelist=[429, 500, 502, 503, 504],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update(
        {
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
    )
    return session


def get_db_connection(db_path: Optional[Path] = None) -> duckdb.DuckDBPyConnection:
    """Connects to the DuckDB database at db_path or the default location."""
    path = db_path or DEFAULT_DB_PATH
    return duckdb.connect(str(path))


def clean_text(text: Optional[str]) -> str:
    """Cleans up raw HTML text, normalizes whitespace and entities."""
    if not text:
        return ""
    unescaped = html.unescape(text)
    # Replace non-breaking spaces and collapse multiple spaces
    normalized = re.sub(r"[\s\xa0]+", " ", unescaped).strip()
    return normalized


def slugify(text: str) -> str:
    """Converts a string to a clean, lowercase URL-friendly slug."""
    text = clean_text(text).lower()
    # Replace quotes, inch marks, fractions
    text = text.replace('"', "in").replace("'", "").replace("/", "-")
    # Replace non-alphanumeric chars with hyphen
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def parse_weight_kg(result_text: str) -> tuple[Optional[float], str]:
    """
    Parses a result string such as '112.70 kg' or '14.00 sec'.
    Returns (numeric_value, unit).
    """
    cleaned = clean_text(result_text)
    match_sec = re.search(r"([\d.]+)\s*(?:sec|s|seconds?)", cleaned, re.IGNORECASE)
    if match_sec:
        try:
            return float(match_sec.group(1)), "sec"
        except ValueError:
            return None, "sec"

    match_kg = re.search(r"([\d.]+)\s*(?:kg|kilos?)?", cleaned, re.IGNORECASE)
    if match_kg:
        try:
            return float(match_kg.group(1)), "kg"
        except ValueError:
            return None, "kg"

    return None, "unknown"


def build_gsi_url(path: str) -> str:
    """Constructs a full GripSport.org URL from a relative path."""
    if not path:
        return ""
    if path.startswith("http://") or path.startswith("https://"):
        return path
    return f"{BASE_URL.rstrip('/')}/{path.lstrip('/')}"
