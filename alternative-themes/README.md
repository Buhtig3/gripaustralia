# Grip Australia — Alternative Design & Theming Suite

Welcome to the **Grip Australia Alternative Themes** directory. This directory provides 5 distinct, production-ready design archetypes tailored specifically for Grip Sport in Australia—spanning hardcore industrial iron, Australian outback heritage, biometric sports science, prestige federation luxury, and high-impact neo-brutalism.

---

## 🎨 The Top 5 Alternative Themes at a Glance

| # | Theme Name | Archetype | Dominant Palette | Typography Pairing | Vibe / Identity |
| :- | :--- | :--- | :--- | :--- | :--- |
| **01** | [Raw Iron & Mag Chalk](./01-raw-iron-chalk.md) | Heavy Foundry & Gym | Obsidian (`#0e1013`), Forge Orange (`#ff5500`), Chalk White (`#f4f4f6`) | **Syne** + **Barlow Condensed** + **Plus Jakarta Sans** | Gritty, tactile, knurled steel, chalk dust mist |
| **02** | [Outback Ochre & Terra](./02-outback-ochre.md) | Rugged Bush Strength | Charred Bark (`#141110`), Red Centre Ochre (`#e05a2b`), Gold Sand (`#e59b3c`), Sage (`#5d7a68`) | **Bebas Neue** + **Space Grotesk** + **DM Sans** | Uniquely Australian, sunbaked earth, rugged perseverance |
| **03** | [Cyber Grip Telemetry](./03-cyber-grip-telemetry.md) | Sports Science / Load Cells | Void Black (`#08090d`), Laser Cyan (`#00f0ff`), Kinetic Volt (`#ccff00`) | **Chakra Petch** + **JetBrains Mono** + **Inter** | RGC calibration, precision biomechanics, electronic HUD |
| **04** | [Heritage Gold & Club](./04-heritage-gold-athletic.md) | Vintage Federation Club | Midnight Evergreen (`#08130f`), Championship Gold (`#d4af37`), Parchment (`#fcf9f2`) | **Cinzel** + **Outfit** + **Plus Jakarta Sans** | Historic Apollon/Inch lineage, trophy pedigree, elite honor |
| **05** | [Brutalist Mono-Grit](./05-brutalist-mono-grit.md) | Neo-Brutalist Powerhouse | Pitch Black (`#000000`), Stark White (`#ffffff`), Caution Yellow (`#ffe600`) | **Archivo Black** + **Space Mono** + **IBM Plex Sans** | 2px solid borders, hard offset shadows, underground intensity |

---

## 🚀 Live Interactive Snapshot & Static Index

We have created an interactive **Static Index / Snapshot Page** located at:
👉 **[`index.html`](./index.html)**

### What the Static Index Page Includes:
1. **Interactive Theme Switcher Bar:** Switch between all 5 themes with 1 click. Watch the entire Grip Australia homepage transform instantly (fonts, backgrounds, colors, cards, CTA buttons, badges).
2. **Side-by-Side Snapshot Gallery View:** Toggle between "Live Interactive Preview" and "5-Theme Snapshot Gallery" to compare all designs at once.
3. **Real Grip Australia Content Simulated:**
   - Sticky Header with navigation & search button
   - Hero video placeholder & dual high-conversion CTA buttons (*Strongfest IV Sign-up* & *2026 Nationals Results*)
   - Mission Statement & GSI Sanctioning banner (*"Forging Australian Grip Strength"*)
   - Three Pillars Grid (*Understanding Grip Sport*, *Competition Calendar*, *Australian Feats*)
   - Championship History Archive (*2026, 2025, 2024 Nationals cards*)
   - Knowledge Base Guide cards (*Mullett's Mandrel, Gripper Rating Service, etc.*)
   - Themed Footer with copyright and quicklinks
4. **Theme Token Inspector:** Live panel displaying the active theme's font stack, background CSS, and color swatches with click-to-copy hex codes.

To view it:
Simply open `alternative-themes/index.html` in your web browser, or use a local preview server (e.g. `npx serve alternative-themes` or live preview in the IDE).

---

## 📁 Directory Structure

```text
alternative-themes/
├── README.md                     # This master documentation file
├── 01-raw-iron-chalk.md          # Full spec for Theme 1 (Raw Iron & Chalk)
├── 02-outback-ochre.md           # Full spec for Theme 2 (Outback Ochre)
├── 03-cyber-grip-telemetry.md    # Full spec for Theme 3 (Cyber Telemetry)
├── 04-heritage-gold-athletic.md  # Full spec for Theme 4 (Heritage Gold)
├── 05-brutalist-mono-grit.md     # Full spec for Theme 5 (Brutalist Mono-Grit)
└── index.html                    # Static snapshot & interactive prototype page
```

---

## 🛠️ How to Implement Any Theme into the Main Astro Site

Each theme is engineered with standard CSS Custom Properties that drop directly into `src/layouts/BaseLayout.astro` and `tailwind.config.mjs`.

### Step 1: Add Google Fonts
Add the selected theme's font link inside `src/layouts/BaseLayout.astro` within the `<head>`:
```html
<!-- Example for Theme 1: Raw Iron -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
```

### Step 2: Extend Tailwind Configuration
In `tailwind.config.mjs`, register the color tokens and font families provided in the markdown spec:
```javascript
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Drop in tokens from the chosen theme markdown file
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        accent: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    }
  }
}
```

### Step 3: Apply Theme Classes
The layout components (`Header.astro`, `Footer.astro`, `index.astro`) can either use CSS variables (`var(--color-bg-base)`, etc.) or Tailwind utility classes (`bg-iron-950`, `font-display`, etc.).
