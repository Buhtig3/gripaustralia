# Grip Australia: Static Site Migration & Architecture

This repository contains the source code, content collections, and CI/CD deployment pipeline for the **Grip Australia** website, migrated from a legacy dynamic/hosted CMS to a high-performance, static site powered by [Astro](https://astro.build) and hosted on [GitHub Pages](https://pages.github.com).

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Content Migration Workflow](#content-migration-workflow)
- [Content Management & Schemas](#content-management--schemas)
- [Deployment & GitHub Actions](#deployment--github-actions)
- [Custom Domain & DNS Configuration](#custom-domain--dns-configuration)
- [Contributing & Style Guide](#contributing--style-guide)

---

## Overview & Architecture

- **Framework:** Astro 4.x / 5.x (Zero-JS by default, component-driven)
- **Content Engine:** Astro Content Collections with strict [Zod](https://zod.dev) schema validation
- **Markdown Processing:** GFM (GitHub Flavored Markdown) with Turndown migration pipeline
- **Hosting & CI/CD:** GitHub Pages via GitHub Actions workflow (`actions/deploy-pages`)
- **DNS / Custom Domain:** Apex domain routing configured via root `CNAME`
- **Search (Optional / Planned):** Static indexed client-side search via [Pagefind](https://pagefind.app)

---

## Repository Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated build & deploy to GitHub Pages
├── public/
│   ├── CNAME                   # Production domain (gripaustralia.com)
│   ├── favicon.svg             # Site favicon
│   └── robots.txt              # Crawler directives
├── scripts/
│   └── migrate.js              # Cheerio & Turndown migration/scraper script
├── src/
│   ├── assets/                 # Optimized local images (processed by Astro)
│   │   ├── branding/
│   │   └── gyms/
│   ├── components/             # Reusable Astro/UI components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── GymCard.astro
│   ├── content/                # Content Collections (Markdown + Frontmatter)
│   │   ├── config.ts           # Zod schema definitions
│   │   ├── articles/           # Guides, history, informational posts
│   │   └── gyms/               # Directory of affiliated clubs & training gyms
│   ├── layouts/
│   │   └── BaseLayout.astro    # Master HTML shell, meta tags, and global styles
│   └── pages/
│       ├── index.astro         # Homepage
│       ├── equipment-and-gyms.astro # Directory listing with filtering
│       └── [slug].astro        # Dynamic route for articles
├── astro.config.mjs            # Astro build & integration settings
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript compiler config
```

---

## Prerequisites

- **Node.js:** v18.17.0 or v20+ (Node 20 LTS recommended)
- **Package Manager:** `npm` (v9+) or `pnpm`
- **Git:** Installed and configured locally

---

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/grip-australia/grip-australia.github.io.git
   cd grip-australia.github.io
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:4321` in your browser to inspect the site with Hot Module Replacement (HMR).

4. **Run build check and type validation:**
   ```bash
   npm run build
   ```

---

## Content Migration Workflow

To scrape legacy pages from the existing live site and convert them into structured Markdown:

1. **Install migration utilities (if running stand-alone):**
   ```bash
   npm install axios cheerio turndown turndown-plugin-gfm js-yaml
   ```

2. **Execute the scraper:**
   ```bash
   node scripts/migrate.js
   ```

3. **Review Extracted Content:**
   - Scraped articles are stored in `src/content/articles/`.
   - Gym directories and equipment guides are routed to `src/content/gyms/`.
   - Verify frontmatter values and replace remote image URLs with local imports from `src/assets/`.

---

## Content Management & Schemas

All content entries are validated against TypeScript / Zod schemas defined in `src/content/config.ts`. If an entry has missing or malformed metadata, the build will fail immediately with clear diagnostic logs.

### Gym Entry Example (`src/content/gyms/betapark.md`)

```markdown
---
name: "Betapark"
state: "TAS"
suburb: "Hobart"
equipment:
  - "IronMind Grippers (Guide to #4)"
  - "Loading Pin & 2-inch Rolling Handle"
  - "Rogue Anvil"
  - "Pinch Blocks"
website: "https://betapark.example.com"
featured: true
---

Betapark is a climbing gym offering a dedicated grip training setup for members.
```

### Article Entry Example (`src/content/articles/what-is-grip-sport.md`)

```markdown
---
title: "What is Grip Sport?"
description: "An introduction to competitive grip strength events, disciplines, and training in Australia."
author: "Grip Australia"
publishDate: 2026-01-15
tags:
  - "fundamentals"
  - "competition"
  - "training"
---

Grip sport is a strength athletics discipline focused specifically on hand, wrist, and forearm power...
```

---

## Deployment & GitHub Actions

The site builds and deploys automatically upon any push or merge to the `main` branch via `.github/workflows/deploy.yml`.

### Manual Trigger
You can also trigger a deployment manually from GitHub:
1. Navigate to **Actions** in the GitHub repository.
2. Select **Deploy Astro to GitHub Pages**.
3. Click **Run workflow** on branch `main`.

---

## Custom Domain & DNS Configuration

The static build includes `public/CNAME` configured for `gripaustralia.com`.

### DNS Settings (Domain Registrar)
Ensure the following DNS records are active:

| Record Type | Host | Value |
| :--- | :--- | :--- |
| **A** | `@` | `185.199.108.153` |
| **A** | `@` | `185.199.109.153` |
| **A** | `@` | `185.199.110.153` |
| **A** | `@` | `185.199.111.153` |
| **CNAME** | `www` | `<org-or-username>.github.io` |

*After DNS propagation, verify that **Enforce HTTPS** is checked under **Settings > Pages**.*

---

## Contributing & Style Guide

1. Create a feature branch (`git checkout -b feature/new-article`).
2. Follow semantic commit messages (`feat: add south australia gym listings`, `fix: update header nav`).
3. Ensure schema compliance prior to pushing:
   ```bash
   npm run build
   ```
4. Open a Pull Request against `main` for review.
