# Theme 05: Vintage Archival Gazette (Light)

> **Aesthetic Archetype:** Australian Sporting Gazette & Championship Broadsheet  
> **Core Mood:** Prestigious, historical, scholarly, championship pedigree, warm archival paper, timeless honor.

---

## 1. Design Concept & Philosophy

Strength athletics has a legendary written history—the vintage broadsides and sporting gazettes that covered early 20th-century strongmen, gold-inscribed championship certificates, and official federation record ledgers.

**Vintage Archival Gazette** is the light-mode counterpart to *Heritage Gold & Athletic Club*. It brings the rich historical gravity of Australian strength feats into a bright, warm editorial canvas. Built on warm archival ivory parchment, deep letterpress ink, antique gold accents, and crimson seal stamps, it feels like opening an official national hall-of-fame register in daylight.

---

## 2. Color Palette & Token Specifications

| Token Name | Hex Code | Semantic Role | Usage Description |
| :--- | :--- | :--- | :--- |
| `--color-bg-base` | `#faf6ee` | Archival Ivory Parchment | Master canvas background with warm paper tone |
| `--color-bg-surface` | `#ffffff` | Pure Vellum White | Elevated article cards, scorecard panels, navbar |
| `--color-bg-elevated` | `#f1ebe0` | Pressed Archival Linen | Card hover states, dropdown menus |
| `--color-border-subtle`| `#dcd2be` | Antique Brass Rule Line | Delicate 1px hairline rules and card borders |
| `--color-accent-gold`  | `#b4832c` | Medal Gold Leaf | Primary CTA buttons, championship seals, badges |
| `--color-accent-crimson`| `#881337`| Federation Seal Red | Key record break markers, urgent badges |
| `--color-text-main`    | `#1c1a17` | Letterpress Foundry Ink | Display headlines, body copy with optimum contrast |
| `--color-text-muted`   | `#635e55` | Archival Sepia Slate | Secondary summaries, timestamps, card labels |
| `--color-badge-gold`   | `#f7eed8` | Antiqued Gold Foil Tint | Background for federation sanctioning tags |

### Tailwind CSS Color Configuration
```javascript
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      archival: {
        50: '#fdfcf9',
        100: '#faf6ee',
        200: '#f1ebe0',
        300: '#dcd2be',
      },
      ink: {
        900: '#1c1a17',
        800: '#2d2a25',
        600: '#635e55',
      },
      gazetteGold: {
        500: '#b4832c',
        600: '#946a20',
        glow: '#d4a148',
      },
      sealRed: {
        700: '#881337',
      }
    }
  }
}
```

---

## 3. Typography Hierarchy

- **Display & Headings:** `Cinzel` or `Playfair Display` (Weight: 700 Bold / 900 Black)
  - Dignified, sculpted classical letterforms evocative of Olympic monument inscriptions and vintage championship gazettes.
- **Accents & Subtitles:** `Cinzel Decorative` or `Space Grotesk` (Weight: 600 Semi-Bold, Tracking: `0.1em`)
  - Vintage certificate pedigree and clean architectural alignment.
- **Body & Articles:** `Plus Jakarta Sans` or `Source Serif 4` (Weight: 400 Regular / 500 Medium)
  - Balances classical elegance with contemporary legibility and effortless long-form reading.

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --font-display: 'Cinzel', serif;
  --font-accent: 'Cinzel', serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 4. Background & Texture Treatment

- **Archival Paper Radiance:** A subtle, warm center-top amber glow mimicking natural reading light falling on heavy cotton paper:
  ```css
  background: radial-gradient(circle at 50% 0%, rgba(180, 131, 44, 0.08) 0%, transparent 60%),
              radial-gradient(circle at 90% 70%, rgba(136, 19, 55, 0.03) 0%, transparent 50%),
              #faf6ee;
  ```
- **Delicate Brass Borders:** Double-hairline borders (`border: 1px solid #dcd2be`) with framed corner accents evoking vintage certificates.
- **Vellum Card Elevation:** Clean white cards with gentle sepia shadows (`box-shadow: 0 10px 30px -8px rgba(28, 26, 23, 0.07)`).

---

## 5. Key UI Component Styling

### Hero Action Buttons
- Antique Championship Gold (`#b4832c`) with crisp white or dark ink typography.
- Classical micro-radius corners (`border-radius: 4px`) with a refined border stroke: `1px solid #946a20`.
- Warm gold shadow: `0 8px 24px rgba(180, 131, 44, 0.25)`.

### National Championship & Feats Cards
- Pure vellum white background (`#ffffff`) with subtle antique brass hairline borders (`#dcd2be`).
- Roman numeral accents or classic serif badges (`MMXXVI`, `MMXXV`).
- On hover, border warms to `#b4832c` with an elegant gold foil underglow.

---

## 6. Why This Fits Grip Australia
Grip Sport is steeped in benchmark history: lifting century-old Thomas Inch dumbbells, certified RGC gripper ratings, and decades of national championship results.

While *Heritage Gold* captures this in deep midnight evergreen velvet, **Vintage Archival Gazette** presents it as an authoritative, prestigious historical register in broad daylight. It gives the sport genuine intellectual weight, heritage pride, and timeless beauty.
