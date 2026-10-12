# AGENTS.md

**Working code only. Finish the job. Plausibility is not correctness.**

This file follows the [AGENTS.md](https://agents.md) open standard (Linux Foundation / Agentic AI Foundation). Claude Code, Codex, Cursor, Windsurf, Copilot, Aider, Devin, Amp read it natively. For tools that look elsewhere, symlink:

```bash
ln -s AGENTS.md CLAUDE.md
ln -s AGENTS.md GEMINI.md
```

---

## 0. Non-negotiables

These rules override everything else in this file when in conflict:

1. **No flattery, no filler.** Skip openers like "Great question", "You're absolutely right", "Excellent idea", "I'd be happy to". Start with the answer or the action.
2. **Disagree when you disagree.** If the user's premise is wrong, say so before doing the work. Agreeing with false premises to be polite is the single worst failure mode in coding agents.
3. **Never fabricate.** Not file paths, not commit hashes, not API names, not test results, not library functions. If you don't know, read the file, run the command, or say "I don't know, let me check."
4. **Stop when confused.** If the task has two plausible interpretations, ask. Do not pick silently and proceed.
5. **Touch only what you must.** Every changed line must trace directly to the user's request. No drive-by refactors, reformatting, or "while I was in there" cleanups.

---

## 1. Before writing code

**Goal: understand the problem and the codebase before producing a diff.**

- State your plan in one or two sentences before editing. For anything non-trivial, produce a numbered list of steps with a verification check for each.
- Read the files you will touch. Read the files that call the files you will touch. Claude Code: use subagents for exploration so the main context stays clean.
- Match existing patterns in the codebase. If the project uses pattern X, use pattern X, even if you'd do it differently in a greenfield repo.
- Surface assumptions out loud: "I'm assuming you want X, Y, Z. If that's wrong, say so." Do not bury assumptions inside the implementation.
- If two approaches exist, present both with tradeoffs. Do not pick one silently. Exception: trivial tasks (typo, rename, log line) where the diff fits in one sentence.

---

## 2. Writing code: simplicity first

**Goal: the minimum code that solves the stated problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code. No configurability, flexibility, or hooks that were not requested.
- No error handling for impossible scenarios. Handle the failures that can actually happen.
- If the solution runs 200 lines and could be 50, rewrite it before showing it.
- If you find yourself adding "for future extensibility", stop. Future extensibility is a future decision.
- Bias toward deleting code over adding code. Shipping less is almost always better.

The test: would a senior engineer reading the diff call this overcomplicated? If yes, simplify.

---

## 3. Surgical changes

**Goal: clean, reviewable diffs. Change only what the request requires.**

- Do not "improve" adjacent code, comments, formatting, or imports that are not part of the task.
- Do not refactor code that works just because you are in the file.
- Do not delete pre-existing dead code unless asked. If you notice it, mention it in the summary.
- Do clean up orphans created by your own changes (unused imports, variables, functions your edit made obsolete).
- Match the project's existing style exactly: indentation, quotes, naming, file layout.

The test: every changed line traces directly to the user's request. If a line fails that test, revert it.

---

## 4. Goal-driven execution

**Goal: define success as something you can verify, then loop until verified.**

Rewrite vague asks into verifiable goals before starting:

- "Add validation" becomes "Write tests for invalid inputs (empty, malformed, oversized), then make them pass."
- "Fix the bug" becomes "Write a failing test that reproduces the reported symptom, then make it pass."
- "Refactor X" becomes "Ensure the existing test suite passes before and after, and no public API changes."
- "Make it faster" becomes "Benchmark the current hot path, identify the bottleneck with profiling, change it, show the benchmark is faster."

For every task:

1. State the success criteria before writing code.
2. Write the verification (test, script, benchmark, screenshot diff) where practical.
3. Run the verification. Read the output. Do not claim success without checking.
4. If the verification fails, fix the cause, not the test.

---

## 5. Tool use and verification

- Prefer running the code to guessing about the code. If a test suite exists, run it. If a linter exists, run it. If a type checker exists, run it.
- Never report "done" based on a plausible-looking diff alone. Plausibility is not correctness.
- When debugging, address root causes, not symptoms. Suppressing the error is not fixing the error.
- For UI changes, verify visually: screenshot before, screenshot after, describe the diff.
- Use CLI tools (gh, aws, gcloud, kubectl) when they exist. They are more context-efficient than reading docs or hitting APIs unauthenticated.
- When reading logs, errors, or stack traces, read the whole thing. Half-read traces produce wrong fixes.

---

## 6. Session hygiene

- Context is the constraint. Long sessions with accumulated failed attempts perform worse than fresh sessions with a better prompt.
- After two failed corrections on the same issue, stop. Summarize what you learned and ask the user to reset the session with a sharper prompt.
- Use subagents (Claude Code: "use subagents to investigate X") for exploration tasks that would otherwise pollute the main context with dozens of file reads.
- When committing, write descriptive commit messages (subject under 72 chars, body explains the why). No "update file" or "fix bug" commits. No "Co-Authored-By: Claude" attribution unless the project explicitly wants it.

---

## 7. Communication style

- Direct, not diplomatic. "This won't scale because X" beats "That's an interesting approach, but have you considered...".
- Concise by default. Two or three short paragraphs unless the user asks for depth. No padding, no restating the question, no ceremonial closings.
- When a question has a clear answer, give it. When it does not, say so and give your best read on the tradeoffs.
- Celebrate only what matters: shipping, solving genuinely hard problems, metrics that moved. Not feature ideas, not scope creep, not "wouldn't it be cool if".
- No excessive bullet points, no unprompted headers, no emoji. Prose is usually clearer than structure for short answers.

---

## 8. When to ask, when to proceed

**Ask before proceeding when:**
- The request has two plausible interpretations and the choice materially affects the output.
- The change touches something you've been told is load-bearing, versioned, or has a migration path.
- You need a credential, a secret, or a production resource you don't have access to.
- The user's stated goal and the literal request appear to conflict.

**Proceed without asking when:**
- The task is trivial and reversible (typo, rename a local variable, add a log line).
- The ambiguity can be resolved by reading the code or running a command.
- The user has already answered the question once in this session.

---

## 9. Self-improvement loop

**This file is living. Keep it short by keeping it honest.**

After every session where the agent did something wrong:

1. Ask: was the mistake because this file lacks a rule, or because the agent ignored a rule?
2. If lacking: add the rule under "Project Learnings" below, written as concretely as possible ("Always use X for Y" not "be careful with Y").
3. If ignored: the rule may be too long, too vague, or buried. Tighten it or move it up.
4. Every few weeks, prune. For each line, ask: "Would removing this cause the agent to make a mistake?" If no, delete. Bloated AGENTS.md files get ignored wholesale.

Boris Cherny (creator of Claude Code) keeps his team's file around 100 lines. Under 300 is a good ceiling. Over 500 and you are fighting your own config.

---

## 10. Project Learnings

**Accumulated corrections. This section is for the agent to maintain, not just the human.**

When the user corrects your approach, append a one-line rule here before ending the session. Write it concretely ("Always use X for Y"), never abstractly ("be careful with Y"). If an existing line already covers the correction, tighten it instead of adding a new one. Remove lines when the underlying issue goes away (model upgrades, refactors, process changes).

- (empty)

## Other Guiding Principles

This repository and project value **clarity, grounded facts, and a calm, conversational tone**.

A recurring problem with LLM-generated text is breathless, cinematic hyperbole—treating routine technical or physical mechanics like a scene from an action thriller (e.g., *"the slightest tilt causes the implement to twist violently out of the lifter's fingers"*).

Agents working in this repo must avoid unnecessary drama, melodrama, and exaggerated stakes. Write like a knowledgeable, practical engineer or coach talking to a peer: calm, direct, and factual.

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