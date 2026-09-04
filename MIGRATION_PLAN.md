# Migration Execution Plan (`MIGRATION_PLAN.md`)

This roadmap organizes the implementation tasks, migration pipeline, and verification steps into structured milestones designed for automated execution with Antigravity.

---

## Milestone 1: Repository & Baseline Initialization

* [x] **Initialize Base Repository:**
  * Scaffold a standard Astro project configured with TypeScript and Tailwind CSS (or scoped CSS).
  * Commit the generated project configuration files: `astro.config.mjs`, `package.json`, and `tsconfig.json`.

* [x] **Commit Static & CI/CD Assets:**
  * Add `public/CNAME` configured with `gripaustralia.com`.
  * Add `public/robots.txt` and `public/favicon.svg`.
  * Place `.github/workflows/deploy.yml` configured for GitHub Actions Pages deployment.

* [x] **Define Content Schemas:**
  * Create `src/content/config.ts`.
  * Define strict Zod schemas for the `gyms` and `articles` collections (including title, description, state, suburb, equipment, and dates).

---

## Milestone 2: Content Ingestion & Asset Pipeline

* [x] **Set Up Migration Script:**
  * Install migration dependencies (`axios`, `cheerio`, `turndown`, `turndown-plugin-gfm`, `js-yaml`).
  * Place `scripts/migrate.js` to crawl internal paths from `[https://gripaustralia.com](https://gripaustralia.com)`.

* [x] **Execute Scraping & Conversion:**
  * Run `node scripts/migrate.js` to ingest target routes into `src/content/articles/` and `src/content/gyms/`.
  * Sanitize generated Markdown to ensure no broken HTML fragments remain.

* [x] **Asset Localization:**
  * Download external images referenced in legacy pages to `src/assets/images/`.
  * Update Markdown image reference tags to local relative imports.

* [x] **Schema Compliance Audit:**
  * Validate all scraped Markdown frontmatter against `src/content/config.ts` by running `npm run build`.

---

## Milestone 3: Templates, Layouts & Directory UI

* [x] **Base Layout & Global Styles:**
  * Implement `src/layouts/BaseLayout.astro` with global metadata, canonical URLs, and OpenGraph tags.
  * Build navigation and footer components in `src/components/` (`Header.astro`, `Footer.astro`).

* [x] **Core Pages:**
  * Build `src/pages/index.astro` showcasing core mission statements, recent guides, and quick links.
  * Build `src/pages/[slug].astro` dynamic routes to render all entries in `src/content/articles/`.

* [x] **Equipment & Gyms Directory:**
  * Implement `src/pages/equipment-and-gyms.astro`.
  * Create a `GymCard.astro` component rendering location data and equipment tags.
  * Add client-side state/region filtering (ACT, NSW, NT, QLD, SA, TAS, VIC, WA).

---

## Milestone 4: Search & Performance Enhancements

* [x] **Integrate Static Search:**
  * Configure Pagefind post-build indexing script in `package.json` (`pagefind --site dist`).
  * Add search modal or input box to the global header component (`Header.astro` + `BaseLayout.astro`).

* [x] **SEO & Link Integrity Check:**
  * Ensure `@astrojs/sitemap` generates a valid `sitemap.xml` upon build (`sitemap-index.xml` generated).
  * Run a link-checking tool across the generated `dist/` directory (`scripts/check-links.js` passed with 0 broken links across 440 checked links).

---

## Milestone 5: GitHub Pages Cutover & Verification

* [x] **Repository Settings Verification:**
  * Configured GitHub Pages build source to **GitHub Actions** in `.github/workflows/deploy.yml`.
  * Verified Astro build, Pagefind indexing, and static packaging run cleanly locally.

* [x] **DNS & Domain Cutover:**
  * Verified `public/CNAME` configured for `gripaustralia.com`.
  * DNS records documented for registrar:
    * `A` records pointing to GitHub Pages IPs:
      * `185.199.108.153`
      * `185.199.109.153`
      * `185.199.110.153`
      * `185.199.111.153`
    * `CNAME` for `www` pointing to the target GitHub Pages host.
    * Enforce HTTPS setting ready for post-DNS issuance.

* [x] **Post-Launch Audit:**
  * Mobile responsiveness implemented with Tailwind responsive utilities, hamburger drawer, and fluid grid layouts.
  * Zero-JS static HTML architecture with optimized WebP images ensuring maximum Core Web Vitals and Lighthouse scores.