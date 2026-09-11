# AGENTS.md

## Overview & Core Philosophy

This repository and project value **clarity, grounded facts, and a calm, conversational tone**.

A recurring problem with LLM-generated text is breathless, cinematic hyperbole—treating routine technical or physical mechanics like a scene from an action thriller (e.g., *"the slightest tilt causes the implement to twist violently out of the lifter's fingers"*).

Agents working in this repo must avoid unnecessary drama, melodrama, and exaggerated stakes. Write like a knowledgeable, practical engineer or coach talking to a peer: calm, direct, and factual.

---

## Guiding Principles

### 1. The "Bro, Chill" Rule (Cut the Drama)
- **Do not** describe ordinary physical or digital events with apocalyptic language.
- Things rarely "shatter into a million pieces," "twist violently," "wreak catastrophic havoc," or "completely paralyze the system."
- State the mechanical reality: what happens, why it happens, and what the fix is.

### 2. Adjective & Adverb Diet
Aggressively eliminate or downscale intensifying adverbs and dramatic adjectives:
- ❌ *Violently, catastrophically, monumentally, breathtakingly, desperately, utterly.*
- ❌ *Tectonic shift, insurmountable hurdle, lethal flaw, existential breakdown.*
- ✔️ *Unevenly, breaks, fails to build, slips, causes an error, adds friction.*

### 3. Factual & Measured Over Sensational
- Focus on quantifiable, observable behavior.
- If an edge case causes a null pointer exception, say: `"If input is null, it throws a NullPointerException."`
- Do not say: `"Feeding invalid data unleashes an unchecked cascade of silent corruption that destroys state integrity."`

### 4. Natural & Casual, Not Robotic or Pretentious
- Use natural phrasing: `"If the grip angle is off, the handle rolls out of your hand."`
- Avoid stiff academic fluff or marketing jargon: `"Leveraging synergistic kinetic pathways to mitigate biomechanical divergence."`
- Keep sentences punchy and easy to scan.

---

## Before & After Reference Table

| Context | ❌ Hyperbolic / Extreme | ✔️ Grounded & Factual |
| :--- | :--- | :--- |
| **Physical / Biomechanics** | "The slightest tilt causes the implement to twist violently out of the lifter's fingers, risking catastrophic tendon tear." | "If you tilt the implement, the off-center load will roll the handle out of your fingers." |
| **Bug / Exception** | "A missing semicolon plunges the entire asynchronous runtime into a death spiral." | "A missing semicolon causes a syntax error and stops the build." |
| **Performance** | "This bottleneck utterly cripples throughput, reducing performance to a crawl." | "This query is unindexed, which adds about 200ms of latency under load." |
| **API Failure** | "The endpoint violently rejects malformed payloads with lethal 400 responses." | "The endpoint validates the schema and returns a 400 status code for malformed payloads." |
| **Product / Feature** | "An unprecedented, game-changing paradigm shift in user engagement." | "A simplified navigation bar that makes it easier to find settings." |

---

## Practical Writing Checklist for Agents

When generating documentation, PR descriptions, comments, or explanations:

- [ ] **Check the intensity:** Did I describe a minor friction point as a disaster?
- [ ] **Strip movie-trailer prose:** Remove phrases like "unleash," "harness," "bulletproof," and "fatal."
- [ ] **Be descriptive, not dramatic:** Explain *how* something happens instead of how *terrible* it feels.
- [ ] **Keep technical docs pragmatic:** Give steps, trade-offs, and failure conditions neutrally.
- [ ] **Respect the user's intelligence:** State the point once without pounding the table.

---

## Site Purpose & Scope

**Grip Australia** ([gripaustralia.com](https://gripaustralia.com)) is the central reference site and community hub for Grip Sport in Australia.

### Core Objectives
1. **National Records & Feats:** Maintain verified Australian national records across all disciplines (crush, pinch, thick bar, vertical bar), alongside historical feats (e.g., Inch Dumbbell, Blobs, gripper certifications).
2. **Championship Results & History:** Publish full scorecards, division winners, and athlete rankings for the annual Australian National Grip Sport Championships (2024, 2025, 2026+).
3. **Community & Athlete Resources:** Provide directories for training gyms, sanctioned competitions, equipment buying guides, and gripper rating/calibration services.
4. **Beginner Education:** Explain rules, implement specifications, and training fundamentals in accessible, plain language.

### Operating Philosophy: Zero-Backend GitOps
The site runs without dynamic backend servers or external databases:
- **Data storage:** Flat JSON files in `src/data/` and Markdown files in `src/content/articles/`.
- **Validation:** Strict schema checks via Zod and custom Node.js validation scripts.
- **Submissions:** GitHub Issue templates allow athletes and meet directors to submit records, gym listings, and contest scorecards directly through Git workflows.
- **Hosting:** Static HTML/CSS/JS served via GitHub Pages.

---

## Architecture & Tech Stack

- **Static Site Generator:** [Astro](https://astro.build) (v5.x) configured in static build output mode.
- **Styling:** [Tailwind CSS](https://tailwindcss.com) with semantic design tokens defined in `src/styles/global.css`.
- **Themes:** Dual theme system:
  - `calibrated` (default light mode): Calibrated Athletic Minimalism.
  - `outback` (dark mode): Outback Ochre & Terra.
  - Handled via the interactive hand gripper SVG button in `Header.astro` and persisted in `localStorage`.
- **Search:** Client-side indexed search using [Pagefind](https://pagefind.app), indexed automatically at build time.
- **Data Warehousing & Analysis:** Embedded [DuckDB](https://duckdb.org) (`scripts/gripsport.duckdb`) and [Quarto](https://quarto.org) notebooks (`analysis/`) for parsing and analyzing meet data.
- **Hosting & CI/CD:** GitHub Pages deployed through GitHub Actions (`.github/workflows/deploy.yml`).

---

## Repository & Directory Layout

```text
gripaustralia/
├── .github/
│   ├── ISSUE_TEMPLATE/       # Structured issue forms for record, gym, and results submissions
│   └── workflows/            # GitHub Actions workflows (deploy, validation, issue processing)
├── analysis/                 # Quarto notebooks and data analysis scripts
├── docs/                     # Detailed technical and automation documentation
│   └── AUTOMATIONS_AND_SCRIPTS_GUIDE.md # Comprehensive guide to scrapers and pipelines
├── public/                   # Static assets deployed directly to dist/ (CNAME, favicon, robots.txt)
├── scripts/                  # Data scraping, validation, and post-build automation scripts
│   ├── scrape_records.py     # Crawls gripsport.org for Australian national records
│   ├── extract_results.js    # Parses GSI championship contest scorecards into results.json
│   ├── gsi_results.py        # Imports/exports/validates GSI Excel spreadsheets
│   ├── validate-data.js      # Validates src/data/*.json files against schemas
│   ├── check-links.js        # Internal and external link checker
│   └── postbuild.js          # Runs Pagefind search indexing after Astro build
├── src/
│   ├── assets/               # Optimized local images (processed by Astro)
│   ├── components/           # Reusable UI components
│   │   ├── Header.astro      # Navigation bar, mobile menu, search trigger, and theme toggle
│   │   ├── Footer.astro      # Site footer and links
│   │   └── GripRecordsTable.astro # Interactive records tables with filtering and search
│   ├── content/              # Content collections
│   │   ├── config.ts         # Zod schemas for Markdown content collections
│   │   └── articles/         # Markdown content (guides, history, calendar, feats)
│   ├── data/                 # Flat-file JSON datasets (sources of truth)
│   │   ├── records.json      # Official Australian national records
│   │   ├── mandrel_records.json # Records for Mullett's Mandrel wrist wrench
│   │   ├── results.json      # Championship contest results and scorecards
│   │   └── records_meta.json # Scraper sync timestamps and record metadata
│   ├── layouts/
│   │   └── BaseLayout.astro  # HTML shell, OpenGraph meta tags, theme initialization, Pagefind modal
│   ├── pages/                # File-based routing for Astro
│   │   ├── index.astro       # Homepage
│   │   ├── records.astro     # National records directory with search and filter
│   │   ├── championships.astro # Championship landing page and historical archive
│   │   ├── 2024-championship.astro # 2024 Championship results page
│   │   ├── 2025-championship.astro # 2025 Championship results page
│   │   ├── 2026-championship.astro # 2026 Championship results page
│   │   ├── mulletts-mandrel.astro # Mullett's Mandrel wrist wrench records & rules
│   │   ├── equipment-and-gyms.astro # Gym and equipment directory
│   │   ├── gripper-rating-service.astro # RGC gripper calibration service info
│   │   ├── get-involved.astro # Athlete onboarding, registration, and club finder
│   │   ├── useful-resources.astro # External governing bodies, forums, and shops
│   │   ├── [slug].astro      # Dynamic fallback route rendering articles from src/content/articles/
│   │   └── themes/           # Internal theme exploration preview pages
│   ├── styles/
│   │   └── global.css        # Tailwind base styles and CSS variables for themes
│   └── utils/
│       ├── url.ts            # getUrl helper for base URL prefixing
│       └── rehype-callouts.mjs # Markdown callout plugin
├── astro.config.mjs          # Astro configuration (integrations, base path, build options)
├── package.json              # Dependencies and npm scripts
└── tsconfig.json             # TypeScript compiler settings
```

---

## Data Sources & Schemas

### `src/data/records.json`
- Contains national records for official Grip Sport International (GSI) disciplines and historic feats.
- Key properties: `id`, `event`, `category` (`crush`, `pinch`, `thick-bar`, `vertical-lift`, `historical-feat`, `endurance`), `gender` (`men`, `women`), `division`, `weightClass`, `weightKg`, `holder`, `date`, `year`, `location`, `status`.
- Validated via `npm run validate`.

### `src/data/results.json`
- Stores structured contest scorecards for national championships.
- Grouped by contest year (`"2024"`, `"2025"`, `"2026"`).
- Contains contest metadata (`title`, `venue`, `date`, `promoter`), overall champions (`mensOverall`, `womensOverall`, `mensP4P`, `womensP4P`), event name list, and full athlete attempts/rankings.

### `src/content/articles/`
- Markdown files for editorial content, guides, and event previews.
- Frontmatter is validated by `src/content/config.ts` using Zod:
  - `title`: string
  - `description`: string (optional)
  - `publishDate`: date (optional)
  - `author`: string (defaults to "Grip Australia")
  - `tags`: array of strings
  - `featured`: boolean

---

## Common Agent Instructions & Workflows

### 1. Internal URL Generation
When creating links inside Astro components or pages, **always** use the `getUrl` helper from `src/utils/url.ts`:
```astro
---
import { getUrl } from '../utils/url';
---
<a href={getUrl('/records')}>View Records</a>
```
This ensures paths resolve correctly regardless of whether the site is served from the root domain (`/`) or a subdirectory path.

### 2. Styling & Theme Tokens
When styling new components, use CSS custom properties defined in `src/styles/global.css` (or Tailwind classes referencing them) rather than hardcoded hex colors:
- Backgrounds: `var(--bg-base)`, `var(--bg-surface)`, `var(--bg-elevated)`
- Borders: `var(--border-color)`, `var(--border-subtle)`
- Text: `var(--text-main)`, `var(--text-muted)`, `var(--text-subtle)`
- Accents: `var(--accent)`, `var(--accent-hover)`, `var(--accent-gold)`

This preserves contrast and legibility across both `calibrated` (light) and `outback` (dark) themes.

### 3. Running Common Commands
- `npm run dev`: Start local development server (`localhost:4321`).
- `npm run validate`: Validate JSON datasets (`records.json`, `results.json`, `mandrel_records.json`). Run this before committing any data changes.
- `npm run build`: Run Astro build followed by Pagefind search indexing (`scripts/postbuild.js`).
- `npm run check:links`: Check internal and external links for broken references.
- `uv run scripts/scrape_records.py`: Scrape latest records from gripsport.org into DuckDB and export to `src/data/records.json`.