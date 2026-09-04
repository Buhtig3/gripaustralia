# Grip Australia — Alternative Design & Theming Suite

Welcome to the **Grip Australia Alternative Themes** directory. Based on athlete and organizer feedback, this curated collection combines our highest-rated dark/heritage designs (**Heritage Gold** and **Outback Ochre**) with two brand-new **warm, sunlit light options with lighter backgrounds** (**Sandstone & Coastal Iron** and **Vintage Archival Gazette**), plus the hardcore foundry archetype (**Raw Iron & Mag Chalk**).

---

## 🎨 The Top 5 Alternative Themes at a Glance

| # | Theme Name | Tone & Archetype | Dominant Palette | Typography Pairing | Vibe / Identity |
| :- | :--- | :--- | :--- | :--- | :--- |
| **01** | [Raw Iron & Mag Chalk](./01-raw-iron-chalk.md) | **Dark** — Heavy Foundry & Gym | Obsidian (`#0e1013`), Forge Orange (`#ff5500`), Chalk White (`#f4f4f6`) | **Syne** + **Barlow Condensed** + **Plus Jakarta Sans** | Gritty, tactile, knurled steel, chalk dust mist |
| **02** | [Outback Ochre & Terra](./02-outback-ochre.md) | **Dark/Warm** — Rugged Bush Strength ⭐ | Charred Bark (`#141110`), Red Centre Ochre (`#e05a2b`), Gold Sand (`#e59b3c`), Sage (`#5d7a68`) | **Bebas Neue** + **Space Grotesk** + **DM Sans** | Uniquely Australian, sunbaked earth, rugged perseverance |
| **03** | [Sandstone & Coastal Iron](./03-sandstone-coastal-iron.md) | **Light** — Sunlit Coastal Strength ☀️ | Sunbleached Sandstone (`#f7f4ed`), Pure White (`#ffffff`), Coastal Gold (`#d97706`), Deep Pacific Ink (`#0f2942`) | **Outfit** + **Barlow Condensed** + **Plus Jakarta Sans** | Bright daylight, Bondi oceanfront iron, warm Australian limestone |
| **04** | [Heritage Gold & Club](./04-heritage-gold-athletic.md) | **Dark/Prestige** — Vintage Club ⭐ | Midnight Evergreen (`#08130f`), Championship Gold (`#d4af37`), Parchment (`#fcf9f2`) | **Cinzel** + **Outfit** + **Plus Jakarta Sans** | Historic Apollon/Inch lineage, trophy pedigree, elite honor |
| **05** | [Vintage Archival Gazette](./05-vintage-archival-gazette.md) | **Light** — Championship Broadsheet 📜 | Archival Ivory (`#faf6ee`), Pure Vellum (`#ffffff`), Medal Gold (`#b4832c`), Foundry Ink (`#1c1a17`) | **Cinzel** + **Cinzel Decorative** + **Plus Jakarta Sans** | Historical sporting broadside, gold medal seals, museum scorecard |

> ⭐ *Highlighted as top dark/warm options; ☀️ and 📜 represent the new high-readability daylight options.*

---

## 🚀 Live Interactive Snapshot & Static Index

We have updated the interactive **Static Index / Snapshot Page** located at:
👉 **[`index.html`](./index.html)**

*(Also mirrored at [`public/themes/index.html`](../public/themes/index.html) so it can be previewed directly via `http://localhost:4321/themes/` during local Astro dev!)*

### What the Static Index Page Includes:
1. **Interactive Theme Switcher Bar:** Switch seamlessly between all 5 themes (including the 2 new daylight options) with 1 click. The entire simulated site adjusts its background, text colors, card borders, shadows, CTA buttons, and typography stacks in real time.
2. **Side-by-Side Snapshot Gallery View:** Toggle between "Live Interactive" and "Snapshot Gallery" to compare all 5 themes side-by-side.
3. **Full Content Simulation:** Sticky navigation bar, hero media reel container, dual prominent CTA buttons (*Strongfest IV Sign-up* and *2026 Nationals Results*), mission statement, core discipline pillars, championship archive cards, and knowledge base resources.
4. **Docked Token Inspector:** Live bottom dock displaying active font pairings, aesthetic mood notes, and palette swatches with click-to-copy HEX codes.

---

## 📁 Directory Structure

```text
alternative-themes/
├── README.md                          # Master directory guide & comparison matrix
├── 01-raw-iron-chalk.md               # Theme 01: Heavy Foundry (Dark)
├── 02-outback-ochre.md                # Theme 02: Outback Ochre & Terra (Warm Dark)
├── 03-sandstone-coastal-iron.md       # Theme 03: Sandstone & Coastal Iron (Light)
├── 04-heritage-gold-athletic.md       # Theme 04: Heritage Gold & Athletic Club (Dark/Prestige)
├── 05-vintage-archival-gazette.md      # Theme 05: Vintage Archival Gazette (Light)
└── index.html                         # Live interactive snapshot & theme switcher
```

---

## 🛠️ Implementing Any Theme in Astro & Tailwind

1. **Include Google Fonts:** Add the font links from the corresponding markdown file to `src/layouts/BaseLayout.astro`.
2. **Update Tokens in `tailwind.config.mjs`:** Paste the color object and font families from your chosen theme into your Tailwind configuration.
3. **Apply Palette Variables:** Use the provided CSS variables (`--color-bg-base`, `--color-accent`, etc.) or Tailwind classes to effortlessly switch the site between dark and light modes.
