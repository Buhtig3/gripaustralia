# Grip Australia — Alternative Design & Theming Suite

Welcome to the **Grip Australia Alternative Themes** directory. This curated collection features our official primary **Light/Dark Mode system** paired together:
- **Light Mode:** [Theme 06: Calibrated Athletic Minimalism](./06-calibrated-athletic-minimalism.md) (Deep Eucalyptus `#143024` & Wattle Gold `#E5A93C`)
- **Dark Mode:** [Theme 02: Outback Ochre & Terra](./02-outback-ochre.md) (Charred Bark `#141110` & Red Centre Ochre `#E05A2B`)
- **Switch Trigger:** The small grip logo in the header acts as an interactive switch, physically animating a gripper crush on click.

---

## 🎨 Alternative Themes at a Glance

| # | Theme Name | Tone & Archetype | Dominant Palette | Typography Pairing | Vibe / Identity |
| :- | :--- | :--- | :--- | :--- | :--- |
| **06** | [Calibrated Athletic Minimalism](./06-calibrated-athletic-minimalism.md) | **Light Mode (Primary Default)** ☀️ | Deep Eucalyptus (`#143024`), Wattle Gold (`#e5a93c`), Chalk Off-White (`#f8f9fa`), Cast Iron (`#0f172a`) | **Barlow Condensed** + **Inter (tabular-nums)** | Calibrated minimalism, competition steel, knurled bars & record sheets |
| **02** | [Outback Ochre & Terra](./02-outback-ochre.md) | **Dark Mode (Primary Switch)** 🌙 | Charred Bark (`#141110`), Red Centre Ochre (`#e05a2b`), Gold Sand (`#e59b3c`), Sage (`#5d7a68`) | **Bebas Neue** + **Space Grotesk** + **DM Sans** | Uniquely Australian, sunbaked earth, rugged perseverance |
| **00** | [Classic Slate & Forge Orange](./00-legacy-slate-orange.md) | **Archived Launch Theme** 🏛️ | Dark Slate (`#020617`), Surface Slate (`#0f172a`), Forge Orange (`#ea580c`/`#f97316`) | **Inter** (Display & Body) | Original benchmark launch styling, hardcore dark iron gym look |
| **04** | [Heritage Gold & Club](./04-heritage-gold-athletic.md) | **Dark/Prestige** — Vintage Club ⭐ | Midnight Evergreen (`#08130f`), Championship Gold (`#d4af37`), Parchment (`#fcf9f2`) | **Cinzel** + **Outfit** + **Plus Jakarta Sans** | Historic Apollon/Inch lineage, trophy pedigree, elite honor |
| **03** | [Sandstone & Coastal Iron](./03-sandstone-coastal-iron.md) | **Light** — Sunlit Coastal Strength ☀️ | Sunbleached Sandstone (`#f7f4ed`), Pure White (`#ffffff`), Coastal Gold (`#d97706`), Deep Pacific Ink (`#0f2942`) | **Outfit** + **Barlow Condensed** + **Plus Jakarta Sans** | Bright daylight, Bondi oceanfront iron, warm Australian limestone |
| **05** | [Vintage Archival Gazette](./05-vintage-archival-gazette.md) | **Light** — Championship Broadsheet 📜 | Archival Ivory (`#faf6ee`), Pure Vellum (`#ffffff`), Medal Gold (`#b4832c`), Foundry Ink (`#1c1a17`) | **Cinzel** + **Cinzel Decorative** + **Plus Jakarta Sans** | Historical sporting broadside, gold medal seals, museum scorecard |
| **01** | [Raw Iron & Mag Chalk](./01-raw-iron-chalk.md) | **Dark** — Heavy Foundry & Gym | Obsidian (`#0e1013`), Forge Orange (`#ff5500`), Chalk White (`#f4f4f6`) | **Syne** + **Barlow Condensed** + **Plus Jakarta Sans** | Gritty, tactile, knurled steel, chalk dust mist |

---

## ⚡ Gripper Logo Light/Dark Switcher

The live showcase implements the requested **Grip Logo Theme Switcher**:
1. **Interactive Grip Logo:** In the header (and footer), the small square brand icon containing the hand gripper SVG is a tactile switch button.
2. **Gripper Crush Animation:** When clicked, the SVG handles physically compress inward (14° rotation) simulating closing a heavy torsion spring gripper, then spring back open.
3. **Smooth Mode Flipping:** Instantly flips the interface between:
   - ☀️ **Calibrated Athletic Minimalism** (Light)
   - 🌙 **Outback Ochre & Terra** (Dark)
4. **Visual Indicator Badge:** A dynamic badge next to *"Just Grip It"* indicates `☀️ LIGHT (CALIBRATED)` or `🌙 DARK (OUTBACK)`.
5. **State Persistence:** Preserves user preference in `localStorage`.

---

## 🚀 Live Interactive Snapshot & Static Index

Experience the interactive showcase at:
👉 **[`index.html`](./index.html)**

*(Also mirrored at [`public/themes/index.html`](../public/themes/index.html) for local preview via `http://localhost:4321/themes/` during Astro development!)*

---

## 📁 Directory Structure

```text
alternative-themes/
├── README.md                              # Master directory guide & comparison matrix
├── 00-legacy-slate-orange.md              # Theme 00: Classic Slate & Forge Orange (Original Launch Theme)
├── 01-raw-iron-chalk.md                   # Theme 01: Heavy Foundry (Dark)
├── 02-outback-ochre.md                    # Theme 02: Outback Ochre & Terra (Primary Dark Mode)
├── 03-sandstone-coastal-iron.md           # Theme 03: Sandstone & Coastal Iron (Light)
├── 04-heritage-gold-athletic.md           # Theme 04: Heritage Gold & Athletic Club (Dark/Prestige)
├── 05-vintage-archival-gazette.md          # Theme 05: Vintage Archival Gazette (Light)
├── 06-calibrated-athletic-minimalism.md   # Theme 06: Calibrated Athletic Minimalism (Primary Light Mode Default)
└── index.html                             # Live interactive snapshot & theme switcher
```
