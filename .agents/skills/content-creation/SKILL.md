---
name: content-creation
description: >-
  Guides the creation, editing, and fact-checking of informational articles, guides,
  and documentation for Grip Australia. Use when writing or updating content in
  src/content/articles/ or informational pages, ensuring grounded facts, calm tone,
  schema compliance, and rigorous verification.
---

# Content Creation & Fact-Checking Skill

This skill provides step-by-step procedures for writing and updating informational content for Grip Australia ([gripaustralia.com](https://gripaustralia.com)).

The primary standard for all content in this project is **grounded, verifiable facts presented in a calm, informative, conversational tone**. We avoid melodrama, marketing fluff, and unverified assertions.

---

## Workflow Overview

```
1. Research & Fact Sourcing ➔ 2. Draft with Calm Tone ➔ 3. Schema & Link Check ➔ 4. Automated Validation
```

---

## 1. Research & Source Verification

Before writing a single sentence, identify and verify your source data.

### Internal Data Sources
Always verify names, weights, dates, and contest results against local datasets:
- **National Records:** [`src/data/records.json`](file:///c:/Users/Cam.Chimera/Code/gripaustralia/src/data/records.json)
- **Wrist Wrench Records:** [`src/data/mandrel_records.json`](file:///c:/Users/Cam.Chimera/Code/gripaustralia/src/data/mandrel_records.json)
- **Championship Results:** [`src/data/results.json`](file:///c:/Users/Cam.Chimera/Code/gripaustralia/src/data/results.json)
- **Competitions:** [`src/data/competitions.json`](file:///c:/Users/Cam.Chimera/Code/gripaustralia/src/data/competitions.json) and [`src/data/completed_competitions.json`](file:///c:/Users/Cam.Chimera/Code/gripaustralia/src/data/completed_competitions.json)

### External Governing Standards
- **Grip Sport International (GSI):** [gripsport.org](http://www.gripsport.org/) for official rules, sanctioning standards, and international record comparisons.
- **Implement Specifications:** Verify exact implement dimensions and calibration standards (e.g. IronMind, Cannon PowerWorks RGC, David Horne / World of Grip).

> [!IMPORTANT]
> Consult the [Fact-Checking Checklist](./references/fact-checking-checklist.md) for detailed verification rules on athlete names, weight classes, implement measurements, and rules. Never estimate or guess a record or measurement.

---

## 2. Drafting & Tone Guidelines

All content must adhere to the editorial principles set in `AGENTS.md`.

### Core Rules
1. **The "Bro, Chill" Rule:** Explain mechanical reality without dramatic or apocalyptic phrasing. Handle slips, friction loss, or technical fouls matter-of-factly.
2. **Adjective & Adverb Diet:** Eliminate intensifiers (`violently`, `catastrophically`, `utterly`, `monumentally`).
3. **No Unwarranted Absolutes or Superlatives:** Avoid phrases flagged by the content validator such as `the official`, `governs all`, `universal standard`, or `world's most`.
4. **Informational & Practical:** Write like a knowledgeable coach or engineer talking to an informed peer.

See the [Tone & Style Guide](./references/tone-and-style-guide.md) for a list of banned dramatic phrasing and practical before/after examples.

---

## 3. Article Structure & Frontmatter Schema

Articles reside in `src/content/articles/<slug>.md`.

### Frontmatter Requirements (Astro Collection)
Frontmatter is strictly validated by `src/content/config.ts`. Every article must include:

```yaml
---
title: "Descriptive, Factual Title"
description: >-
  Concise, factual summary of the article contents (1-2 sentences).
author: "Grip Australia"
publishDate: 2026-09-15
tags:
  - equipment
  - training
  - beginners
featured: false
sourceName: "Grip Australia Technical Guide"
sourceUrl: "https://gripaustralia.com/useful-resources"
verifiedAt: "2026-09-15"
contentStatus: "verified"
---
```

> [!TIP]
> Use the [Article Scaffolding Template](./resources/article-template.md) to start new articles quickly with valid frontmatter, image callouts, and clean markdown structure.

### Key Frontmatter Rules
- `sourceName` or `sourceUrl`: **Required** by `scripts/check-content.js` to establish factual provenance.
- `verifiedAt`: Always record the date (`YYYY-MM-DD`) when facts and records were cross-checked.
- `contentStatus`: Set to `'verified'` for finished articles, `'draft'` for works in progress, or `'archived'` for retired material.
- `tags`: Use lowercase, kebab-case or single-word strings (e.g. `crush`, `pinch`, `thick-bar`, `rules`, `equipment`).

---

## 4. Markdown & Asset Standards

- **Images:** Store article hero and supporting images in `src/assets/images/`. In markdown, reference them relatively:
  ```markdown
  ![Descriptive alt text explaining the scene](../../assets/images/example-image.jpg)
  ```
- **Internal Links:** Use relative paths (e.g. `[What is Grip Sport?](/what-is-grip-sport)` or `[National Championships](/championships)`). Never hardcode `http://localhost:4321` or temporary deployment URLs.
- **GitHub Callouts:** Highlight useful tips or notes using standard callout syntax:
  ```markdown
  > [!NOTE]
  > Background context or additional reference details.

  > [!TIP]
  > Practical training tip or recommended implement specification.
  ```
- **Tables:** Use markdown tables for data summaries, starter kits, or implement comparisons to ensure readability.

---

## 5. Pre-Publication QA & Validation

Before considering any content change complete, run the automated validation suite:

```bash
# 1. Audit content governance, dates, duplicate URLs, and high-risk tone patterns
npm run check:content

# 2. Validate JSON data schema conformity (if records/results/competitions were touched)
npm run validate

# 3. Build the site and test internal link integrity
npm run build
npm run check:links
```

### Validation Checklist
- [ ] No `[ERROR]` or `[WARN]` outputs from `npm run check:content`.
- [ ] All athlete names match official records in `src/data/records.json`.
- [ ] All measurements (dimensions, kg/lbs) are verified and converted accurately.
- [ ] Frontmatter contains `sourceName` or `sourceUrl` and valid `verifiedAt` date.
- [ ] `npm run check:links` confirms no broken internal links.
