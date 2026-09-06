# Grip Australia: GitHub Automations, Scripts & No-Backend Operational Architecture

This guide details the complete automation ecosystem, scraping toolchain, and git-based workflows designed to keep **Grip Australia** ([gripaustralia.com](https://gripaustralia.com)) 100% self-sustaining without a dynamic backend, server, or proprietary database.

---

## Table of Contents

1. [Architectural Overview: The No-Backend Philosophy](#architectural-overview-the-no-backend-philosophy)
2. [Documenting Existing Scripts & Scraping Pipelines](#documenting-existing-scripts--scraping-pipelines)
   - [`scripts/scrape_records.py`](#1-scriptsscrape_recordspy)
   - [`scripts/extract_results.js`](#2-scriptsextract_resultsjs)
   - [`scripts/check_placements.py`](#3-scriptscheck_placementspy)
   - [`scripts/utils.py`](#4-scriptsutilspy)
   - [`scripts/validate-data.js`](#5-scriptsvalidate-datajs)
   - [`scripts/check-links.js`](#6-scriptscheck-linksjs)
   - [`scripts/postbuild.js`](#7-scriptspostbuildjs)
   - [`scripts/build_notebook.py`](#8-scriptsbuild_notebookpy)
   - [`scripts/migrate.js`](#9-scriptsmigratejs)
3. [Implemented GitHub Issue Forms & Workflows](#implemented-github-issue-forms--workflows)
   - [Record & Feat Verification Issue Form](#record--feat-verification-issue-form)
   - [Gym & Training Group Directory Form](#gym--training-group-directory-form)
   - [Championship & Meet Scorecard Form](#championship--meet-scorecard-form)
   - [Automated GitHub Actions (`validate.yml` & `process-submission.yml`)](#automated-github-actions)
4. [Catalog of Possible GitHub Automations](#catalog-of-possible-github-automations)
5. [Git Flows & Step-by-Step Operational Instructions](#git-flows--step-by-step-operational-instructions)
   - [Workflow A: Reviewing & Merging a Record / Feat Verification](#workflow-a-reviewing--merging-a-record--feat-verification)
   - [Workflow B: Reviewing & Adding a Gym / Training Group](#workflow-b-reviewing--adding-a-gym--training-group)
   - [Workflow C: Running the GripSport.org Scraper](#workflow-c-running-the-gripsportorg-scraper)
   - [Workflow D: Publishing New Championship Results](#workflow-d-publishing-new-championship-results)

---

## Architectural Overview: The No-Backend Philosophy

Traditional sports association websites rely on dynamic CMS platforms (WordPress, Drupal) paired with MySQL databases. These incur hosting costs, maintenance overhead, security vulnerability patches, and slow page performance.

Grip Australia operates on a **GitOps / Flat-File Static Engine**:
- **Source of Truth:** Clean, schema-validated JSON files (`src/data/records.json`, `src/data/results.json`, `src/data/mandrel_records.json`) and Markdown Content Collections (`src/content/articles/`).
- **Data Warehousing & Analytics:** Embedded [DuckDB](https://duckdb.org) (`scripts/gripsport.duckdb`) and [Quarto](https://quarto.org) notebooks (`analysis/`).
- **User Submissions:** Structured GitHub Issue Forms (`.github/ISSUE_TEMPLATE/`) serving as self-serve contribution portals.
- **Continuous Deployment:** GitHub Actions automatically tests, builds, verifies links, indexes search via Pagefind, and deploys to GitHub Pages on commit to `main`.

---

## Documenting Existing Scripts & Scraping Pipelines

The repository includes a suite of Python and Node.js utilities in `scripts/`:

### 1. `scripts/scrape_records.py`
* **Language & Runtime:** Python 3.11+ (PEP 723 inline script dependencies: `uv run`, `beautifulsoup4`, `duckdb`, `requests`).
* **Purpose:** The primary pipeline for crawling official Australian national grip records from Grip Sport International ([gripsport.org](https://www.gripsport.org)).
* **Target URLs:**
  - Men: `https://www.gripsport.org/records?country=5&measurement=0&weightclass=all`
  - Women: `https://www.gripsport.org/records?country=5&measurement=0&gender=2&weightclass=all`
* **Data Flow & Processing:**
  1. **Scraping:** Fetches records table HTML across both Men and Women divisions using `utils.get_http_session()` with exponential backoff and retry handling.
  2. **Normalization:** Cleans text entities, parses weights/durations (`parse_weight_kg`), formats dates, classifies disciplines (`CATEGORY_MAP`), and generates unique slugs.
  3. **Metadata Enrichment:** For each unique contest ID (e.g. `contest/415`), crawls the contest page to extract exact event date, venue, city, and state.
  4. **Dataset Integration:**
     - Integrates calibrated Mullett's Mandrel top lifts (Henry Mullett 133.55kg, Sarah Rodwell 53.80kg).
     - Merges Australian historic benchmarks (`HISTORIC_FEATS`: Bruce White 1995 Inch Dumbbell, Joseph Hodgson Mega-Inch & Blobzilla, Will Fuggle Fatman Blob & Crushed-to-Dust, Jermiah Merciconah CoC #3, Isaac Pitt Crushed-to-Dust).
  5. **Storage & JSON Export:**
     - Inserts normalized records into DuckDB table `australian_records` and `mandrel_records`.
     - Exports `src/data/records.json` (consumed by `/records`).
     - Exports `src/data/mandrel_records.json` (consumed by `/mulletts-mandrel`).
     - Exports `src/data/records_meta.json` (record counts, timestamps, and origin metadata).
* **CLI Usage:**
  ```bash
  uv run scripts/scrape_records.py
  # Or with standard python:
  python scripts/scrape_records.py --db-path scripts/gripsport.duckdb --records-json src/data/records.json
  ```

---

### 2. `scripts/extract_results.js`
* **Language & Runtime:** Node.js (ES Module, `cheerio`, `axios`, `fs`).
* **Purpose:** Ingests official Grip Sport International championship meet scorecards from `https://www.gripsport.org/contest/<id>`, parses athlete attempts, event points, and overall champions, and produces the unified `src/data/results.json`.
* **Data Structure Output:**
  ```json
  {
    "2026": {
      "year": 2026,
      "contestId": 483,
      "title": "2026 Australian Grip Sport Championship",
      "venue": "Iron Revolution Gym, Melbourne, VIC",
      "date": "June 27, 2026",
      "promoter": "Isaac Pitt",
      "champions": {
        "mensOverall": "Declan Wright",
        "womensOverall": "Megan Galvin",
        "mensP4P": "Isaac Pitt",
        "womensP4P": "Sarah Rodwell"
      },
      "eventNames": ["Napalm's Nightmare 2.375\"", "Saxon Bar 3\"x4\"", "Silver Bullet", "2\" FBBC Vertical Bar"],
      "athletes": [...]
    }
  }
  ```
* **Features:**
  - Automated HTTP fetching with user-agent spoofing and timeout safeguards.
  - Local caching in `scripts/debug_html/` to prevent redundant network requests.
* **CLI Usage:**
  ```bash
  npm run extract:results
  # Or:
  node scripts/extract_results.js
  ```

---

### 3. `scripts/check_placements.py`
* **Language & Runtime:** Python 3.11+ (`uv run`, `beautifulsoup4`, `duckdb`, `requests`).
* **Purpose:** Deep investigative crawler that tracks 1st-place class finishes across all historical GSI events, candidate exploration, and competitive ranking statistics.
* **Database Tables:**
  - `candidates`: Queue of discovered athlete profiles.
  - `tracked_events`: Unique meet disciplines processed.
  - `athlete_first_places`: Aggregated counts of 1st-place class and overall finishes.
* **Exports:** Produces `scripts/athlete_first_placements.csv`.
* **CLI Usage:**
  ```bash
  uv run scripts/check_placements.py --max-athletes 50
  ```

---

### 4. `scripts/utils.py`
* **Language & Runtime:** Python 3.
* **Purpose:** Shared library providing:
  - `get_http_session()`: Configured `requests.Session` with `HTTPAdapter` and `Retry` for status codes 429, 500, 502, 503, 504.
  - `clean_text(text)`: HTML entity unescaping, whitespace collapsing, and non-breaking space replacement.
  - `slugify(text)`: Generates clean URL and identifier slugs.
  - `parse_weight_kg(result_text)`: Extracts numeric float values and identifies units (`kg` vs `sec`).
  - `get_db_connection(db_path)`: Connects to DuckDB.

---

### 5. `scripts/validate-data.js`
* **Language & Runtime:** Node.js.
* **Purpose:** Automated schema validator ensuring that `src/data/records.json` and `src/data/results.json` strictly conform to the expected format.
* **Validations:**
  - Ensures all 13 required fields are present (`id`, `event`, `category`, `gender`, `division`, `weightClass`, `weightKg`, `unit`, `holder`, `date`, `year`, `location`, `status`).
  - Restricts `category` to valid values (`crush`, `pinch`, `thick-bar`, `vertical-lift`, `historical-feat`, `endurance`).
  - Validates `gender` (`men`, `women`), numerical ranges, and championship athlete structures.
* **CLI Usage:**
  ```bash
  npm run validate
  # Validate an arbitrary snippet from an Issue submission:
  node scripts/validate-data.js path/to/snippet.json
  ```

---

### 6. `scripts/check-links.js`
* **Language & Runtime:** Node.js (`cheerio`).
* **Purpose:** Pre-deployment link auditor. Crawls all generated HTML files in `dist/` and verifies that every relative link and anchor resolves to an existing file or route.
* **CLI Usage:**
  ```bash
  npm run check:links
  ```

---

### 7. `scripts/postbuild.js`
* **Language & Runtime:** Node.js.
* **Purpose:** Executes [Pagefind](https://pagefind.app) against `dist/` following Astro's static build, indexing all pages and copying generated search indexes to `public/pagefind/` for local previewing.
* **CLI Usage:**
  ```bash
  node scripts/postbuild.js
  ```

---

### 8. `scripts/build_notebook.py`
* **Language & Runtime:** Python 3.
* **Purpose:** Generates interactive Jupyter / Quarto notebooks (`analysis/gripsport_analysis.ipynb` / `analysis/gripsport_analysis.qmd`) by querying `scripts/gripsport.duckdb`, rendering exploratory charts and tables for Australian strength statistics.

---

### 9. `scripts/migrate.js`
* **Language & Runtime:** Node.js (`turndown`, `turndown-plugin-gfm`, `cheerio`, `axios`).
* **Purpose:** Legacy archival scraper used to extract raw HTML from legacy CMS pages and convert them into structured Astro Markdown with YAML frontmatter.

---

## Implemented GitHub Issue Forms & Workflows

To allow athletes, contest directors, and gym owners to submit information without writing code or touching git, three issue forms have been created under `.github/ISSUE_TEMPLATE/`:

### Record & Feat Verification Issue Form
* **File:** [`.github/ISSUE_TEMPLATE/submit-record-feat.yml`](file:///.github/ISSUE_TEMPLATE/submit-record-feat.yml)
* **Labels:** `record-submission`, `needs-review`
* **Fields:**
  - Lifter Name & GSI Athlete ID (if available)
  - Event / Implement (e.g. 2.25" Crusher, 50lb Blob, CoC #3)
  - Discipline Category (`crush`, `pinch`, `thick-bar`, `vertical-lift`, `historical-feat`)
  - Gender & Weight Class
  - Weight Lifted / Result with unit (`kg`, `sec`)
  - Performance Date & Venue Location
  - Verification Video Link (YouTube, Vimeo, Instagram Reel)
  - Implement & Scale Calibration Notes
  - Optional Pre-formatted JSON snippet for 1-click merge
  - Checkboxes verifying unedited video and Australian residency/soil criteria

### Gym & Training Group Directory Form
* **File:** [`.github/ISSUE_TEMPLATE/add-gym-group.yml`](file:///.github/ISSUE_TEMPLATE/add-gym-group.yml)
* **Labels:** `gym-directory`, `needs-review`
* **Fields:**
  - Gym or Syndicate Name
  - State / Territory (`VIC`, `NSW`, `QLD`, `ACT`, `TAS`, `WA`, `SA`, `NT`)
  - Suburb, City & Physical Address
  - Contact Person & Instagram Handle
  - Website URL
  - Classification Tag (e.g. *Championship Host Gym*, *Dedicated Strength Facility*, *Regional Syndicate*)
  - Equipment & Implement Roster (Saxon bars, pinch blocks, blobs, calibrated plates)
  - Visiting Policy / Training Schedule
  - Pre-formatted JS object for `src/pages/get-involved.astro`

### Championship & Meet Scorecard Form
* **File:** [`.github/ISSUE_TEMPLATE/submit-championship-results.yml`](file:///.github/ISSUE_TEMPLATE/submit-championship-results.yml)
* **Labels:** `contest-results`, `needs-review`
* **Fields:** Meet Name, Year, Date, Venue, Promoter, GripSport.org Contest URL, Champions roster (Men/Women Overall & P4P), Event List, CSV/Spreadsheet Scorecard data, Media/Livestream links.

### Automated GitHub Actions
1. **`.github/workflows/validate.yml`**:
   - Runs on every Pull Request and push to `main`.
   - Executes `npm ci` -> `npm run validate` (verifies JSON integrity) -> `npm run build` (verifies Astro compilation & Pagefind indexing) -> `npm run check:links` (verifies all 950+ links).
2. **`.github/workflows/process-submission.yml`**:
   - Triggers when issues are opened or labeled with submission tags.
   - Automatically posts an acknowledgment comment detailing review criteria and next steps.

---

## Catalog of Possible GitHub Automations

Below is a roadmap of recommended automations that can be activated as community volume grows:

| Automation | Trigger | Mechanism | Value |
| :--- | :--- | :--- | :--- |
| **1. Issue-to-PR Auto-Generator** | Issue opened with `record-submission` | GitHub Actions workflow parses issue YAML/JSON, creates a git branch, appends record to `src/data/records.json`, and opens a ready-to-merge PR. | Reduces maintainer work to clicking "Merge PR" after reviewing video. |
| **2. Scheduled GripSport Sync** | Cron (`0 0 1 * *` - 1st of each month) | GitHub Actions runs `scrape_records.py`. If `git status` shows diffs in `records.json`, opens a PR: `"chore: update GSI Australian records for [Month]"`. | Zero manual work to keep GSI national records current. |
| **3. Automated Broken Media & Video Audit** | Cron (`0 12 * * 0` - Weekly) | Workflow checks HTTP status of all external video URLs (YouTube, Vimeo, Instagram) in `records.json` and flags private/deleted videos in an issue. | Keeps the historical video archive intact over years. |
| **4. Calendar Meet Archival** | Cron (Daily) | Checks dates in `/competition-calendar`. Moves past dates to "Past Events Archive" automatically. | Prevents calendar from showing outdated competitions. |
| **5. Contest Scorecard Importer** | Workflow Dispatch (input: `contest_id`) | Maintainer types contest ID into GitHub Actions UI. Action runs `scripts/extract_results.js`, downloads contest page, parses scores, commits to branch, and opens PR. | Instant post-meet results publication. |
| **6. Quarto / DuckDB Build & Export** | Push to `scripts/*.duckdb` or data files | Runs Quarto action to render `analysis/gripsport_analysis.html` and commit updated charts to static docs. | Live statistical research without manual notebook re-runs. |

---

## Git Flows & Step-by-Step Operational Instructions

### Workflow A: Reviewing & Merging a Record / Feat Verification

When an athlete or meet director submits an issue:

1. **Review the Issue:**
   - Click the video link in the issue. Verify that the lift is continuous, reaches full lockout, pauses for the down command/control, and is returned to the floor without dropping.
   - Verify weight class and scale calibration notes.
2. **Prepare the Record JSON:**
   - Copy the pre-formatted JSON from the issue (or create an entry matching the format below):
   ```json
   {
     "id": "2-375in-napalms-nightmare-men-93kg",
     "event": "2.375\" Napalm's Nightmare Rolling Handle",
     "category": "thick-bar",
     "gender": "men",
     "division": "Open",
     "weightClass": "93kg",
     "weightKg": 97.5,
     "unit": "kg",
     "holder": "Athlete Name",
     "athleteId": 2450,
     "gsiAthleteUrl": "https://www.gripsport.org/athlete/2450",
     "date": "2026-06-27",
     "year": 2026,
     "contest": "2026 Australian Grip Sport Championship",
     "contestId": 483,
     "contestUrl": "https://www.gripsport.org/contest/483",
     "location": "Melbourne, VIC",
     "sanctioned": true,
     "sanctioningBody": "GSI",
     "verificationUrl": "https://www.youtube.com/watch?v=...",
     "status": "current",
     "notes": "Set at AGSC 2026 on calibrated implement."
   }
   ```
3. **Add to `src/data/records.json`:**
   - Insert the object into `src/data/records.json`.
4. **Validate & Deploy:**
   ```bash
   npm run validate
   git checkout -b feat/add-record-athlete-name
   git add src/data/records.json
   git commit -m "feat(records): add Athlete Name 97.5kg Napalm's Nightmare record"
   git push origin feat/add-record-athlete-name
   ```
   - Open PR -> `validate.yml` runs automatically -> Merge -> Site deploys to GitHub Pages in ~60 seconds!
   - Close the issue with a comment: *"Verified and published to gripaustralia.com/records!"*

---

### Workflow B: Reviewing & Adding a Gym / Training Group

1. **Review Gym Submission:**
   - Check the physical address, equipment list, and Instagram profile.
2. **Update Directory:**
   - Open `src/pages/get-involved.astro`.
   - Locate the `states` array matching the gym's state (e.g., `VIC`, `NSW`, `QLD`, etc.).
   - Append the anchor object to `anchors`:
   ```javascript
   {
     name: "Coburg Grip Syndicate",
     location: "Melbourne (Coburg)",
     focus: "Weekly group training on Saxon bars, rolling handles, and gripper rating.",
     link: "https://instagram.com/coburg_grip",
     linkText: "Visit Instagram",
     tag: "Regional Training Syndicate"
   }
   ```
3. **Build Check & Deploy:**
   ```bash
   npm run build
   git commit -am "feat(gyms): add Coburg Grip Syndicate to VIC directory"
   git push origin main
   ```

---

### Workflow C: Running the GripSport.org Scraper

To pull the latest official records from gripsport.org across Australia:

```bash
# 1. Run the scraper pipeline
python scripts/scrape_records.py

# 2. Validate the exported records and championship results
npm run validate

# 3. Test build and link integrity
npm run build
npm run check:links

# 4. Commit and push
git commit -am "chore(data): sync Australian GSI records from gripsport.org"
git push origin main
```

---

### Workflow D: Publishing New Championship Results

When an annual Australian Championship concludes:

1. **Verify GripSport.org Contest Page:**
   - Locate the official contest URL (e.g. `https://www.gripsport.org/contest/483`).
2. **Update `scripts/extract_results.js`:**
   - Add the new contest metadata entry to `DEFAULT_CONTESTS`:
   ```javascript
   {
     year: 2027,
     contestId: 520,
     gsiUrl: 'https://www.gripsport.org/contest/520',
     title: '2027 Australian Grip Sport Championship',
     venue: 'Venue Name, City, State',
     date: 'June 26, 2027',
     promoter: 'Promoter Name',
     abbreviation: 'AGSC27',
     champions: {
       mensOverall: '...',
       womensOverall: '...',
       mensP4P: '...',
       womensP4P: '...'
     }
   }
   ```
3. **Run Extraction:**
   ```bash
   npm run extract:results
   npm run validate
   ```
4. **Create Championship Page:**
   - Copy `src/pages/2026-championship.astro` to `src/pages/2027-championship.astro`.
   - Update contest details, photos, and ensure `results[2027]` is referenced.
   - Add link to `src/pages/championships.astro` and `src/components/Footer.astro`.
5. **Build and Deploy:**
   ```bash
   npm run build && npm run check:links
   git commit -am "feat(championships): publish 2027 Australian Championship scorecards"
   git push origin main
   ```
