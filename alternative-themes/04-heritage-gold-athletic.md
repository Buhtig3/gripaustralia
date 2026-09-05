# Theme 04: Heritage Gold & Athletic Club

> **Aesthetic Archetype:** Vintage Strongman Revival / Prestige Federation  
> **Core Mood:** Prestigious, timeless, honorable, historic, championship pedigree.

---

## 1. Design Concept & Philosophy

Grip strength is one of the oldest feats of human athletics, dating back to 19th-century strongmen like Thomas Inch, Apollon, Louis Cyr, and Australian pioneer strength champions. **Heritage Gold & Athletic Club** frames Grip Australia as a storied, prestigious athletic institution.

Instead of modern neon or stark grays, this theme channels deep Australian racing green and midnight navy velvet, antique championship gold leaf, warm bone parchment, and refined serif typography. It feels like an Olympic hall of fame or an exclusive federation clubhouse.

---

## 2. Color Palette & Token Specifications

| Token Name | Hex Code | Semantic Role | Usage Description |
| :--- | :--- | :--- | :--- |
| `--color-bg-base` | `#08130f` | Midnight Evergreen | Deep heritage green-black canvas |
| `--color-bg-surface` | `#0f221b` | Federation Green Slate | Cards, championship rosters, navigation header |
| `--color-bg-elevated` | `#162f26` | Clubroom Laurel | Active states, hover surfaces, modal dialogues |
| `--color-border-prestige`| `#254a3c` | Antique Laurel Border | Subtle framed borders, ornate dividers |
| `--color-accent-gold`  | `#d4af37` | Championship Gold Leaf | Primary CTA buttons, trophies, records, medals |
| `--color-accent-bronze`| `#9e782f` | Aged Bronze | Secondary highlights, subtle borders |
| `--color-parchment`    | `#fcf9f2` | Archival Parchment | Headings, hero display copy, crisp typography |
| `--color-parchment-dim`| `#a3b5ab` | Weathered Sage Bone | Secondary text, historical notes, metadata |

### Tailwind CSS Color Configuration
```javascript
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      federation: {
        950: '#08130f',
        900: '#0f221b',
        800: '#162f26',
        700: '#254a3c',
      },
      gold: {
        500: '#d4af37',
        600: '#b89428',
        glow: '#f3cf5f',
      },
      parchment: {
        50: '#fcf9f2',
        200: '#a3b5ab',
      }
    }
  }
}
```

---

## 3. Typography Hierarchy

- **Display & Headings:** `Cinzel` or `Playfair Display` (Weight: 700 / Bold, Small-caps optional)
  - Classical, dignified, reminiscent of engraved trophy plates and Olympic medal engravings.
- **Subheadings & Accents:** `Cinzel Decorative` or `Outfit` (Weight: 600 / Semi-Bold)
  - Architectural authority, clean balance.
- **Body & Editorial:** `Plus Jakarta Sans` or `Source Serif 4` (Weight: 400 Regular / 500 Medium)
  - Warm, graceful readability that keeps long-form articles, rules, and record sheets legible.

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --font-display: 'Cinzel', serif;
  --font-heading: 'Cinzel', serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 4. Background & Texture Treatment

- **Heritage Gold Radiant Gradient:** A warm central golden ambient glow on deep evergreen:
  ```css
  background: radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.12) 0%, transparent 60%),
              radial-gradient(circle at 10% 80%, rgba(22, 47, 38, 0.4) 0%, transparent 50%),
              #08130f;
  ```
- **Fine Framed Filigree:** Subtle 1px gold hairline borders (`border: 1px solid rgba(212, 175, 55, 0.25)`) with framed corner tick marks.
- **Vintage Archival Texture:** Smooth velvet finish that looks prestigious on high-resolution displays.

---

## 5. Key UI Component Styling

### Hero Action Buttons
- Radiant Championship Gold (`#d4af37`) with obsidian lettering (`#08130f`).
- Refined micro-radius (`border-radius: 4px`), elegant border stroke (`1px solid #f3cf5f`).
- Box shadow: `0 8px 24px rgba(212, 175, 55, 0.25)`.

### National Championship Archive Cards
- Federation slate (`#0f221b`) framed by a subtle 1px gold trim.
- Laurel wreath or Roman numeral icons (`MMXXVI`, `MMXXV`).
- On hover, border warms to `#d4af37` with soft golden candlelight underglow.

---

## 6. Why This Fits Grip Australia
Grip Sport features legendary feats with deep history (e.g. lifting the 172 lb Thomas Inch Dumbbell or 50 lb Blob). This theme elevates the sport into a gentleman's/gentlewoman's craft of historic valor and national championship prestige.
