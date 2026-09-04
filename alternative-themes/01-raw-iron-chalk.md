# Theme 01: Raw Iron & Mag Chalk

> **Aesthetic Archetype:** Heavy Foundry / Hardcore Industrial Strength  
> **Core Mood:** Tactile, gritty, powerful, uncompromising, athletic authenticity.

---

## 1. Design Concept & Philosophy

Grip sport is born from cast iron, cold rolled steel, knurled bars, and magnesium carbonate chalk dust. **Raw Iron & Mag Chalk** strips away glossy corporate web design in favor of heavy industrial textures, deep forge charcoal tones, powder-white chalk highlights, and glowing molten amber accents.

This design communicates raw power and benchmark strength. When an athlete visits the site, it feels like stepping into an underground training den smelling of steel and chalk dust.

---

## 2. Color Palette & Token Specifications

| Token Name | Hex Code | Semantic Role | Usage Description |
| :--- | :--- | :--- | :--- |
| `--color-bg-base` | `#0e1013` | Obsidian Cast Iron | Main page canvas background |
| `--color-bg-surface` | `#16191f` | Basalt Plate Slate | Cards, hero containers, navigation bars |
| `--color-bg-elevated` | `#1f232b` | Machined Steel Dark | Hover states, dropdowns, modal windows |
| `--color-border-subtle`| `#2a2f3a` | Wire-cut Steel Edge | Divider rules, container outlines |
| `--color-accent-forge` | `#ff5500` | Molten Forge Orange | Primary CTA buttons, key highlights, badges |
| `--color-accent-glow`  | `#ff7733` | Heated Iron | Hover glow on buttons, focus rings |
| `--color-chalk-pure`   | `#f4f4f6` | Mag Chalk Powder | Primary display headings, prominent text |
| `--color-chalk-mute`   | `#9da5b4` | Weathered Chalk Gray| Body copy, metadata, secondary labels |
| `--color-chalk-ghost`  | `rgba(244, 244, 246, 0.08)` | Chalk Dust Mist | Backdrop glows, subtle badge backgrounds |

### Tailwind CSS Color Configuration
```javascript
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      iron: {
        950: '#0e1013',
        900: '#16191f',
        800: '#1f232b',
        700: '#2a2f3a',
        600: '#3c4352',
      },
      forge: {
        500: '#ff5500',
        600: '#e04a00',
        glow: '#ff7733',
      },
      chalk: {
        pure: '#f4f4f6',
        mute: '#9da5b4',
      }
    }
  }
}
```

---

## 3. Typography Hierarchy

- **Display & Headings:** `Syne` or `Cabinet Grotesk` (Weight: 800 / Extra Bold)
  - Characterized by wide, weighty letterforms that resemble stamped serial numbers on Olympic cast iron plates.
- **Accents & Eyebrows:** `Barlow Condensed` (Weight: 700 / Bold, Uppercase, Tracking: `0.15em`)
  - Tight, mechanical, urgent. Evokes weight-calibrated stamping on steel mandrels and calibrated barbells.
- **Body & Editorial:** `Plus Jakarta Sans` or `Inter` (Weight: 400 Regular / 500 Medium)
  - High legibility on dark backgrounds with crisp geometry.

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

:root {
  --font-display: 'Syne', sans-serif;
  --font-accent: 'Barlow Condensed', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 4. Background & Texture Treatment

- **Knurling Micro-Grid:** A subtle SVG repeating pattern of diamond knurling (`background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)`) at 16px intervals.
- **Chalk Atmospheric Vignette:** Radial gradients in corners with low-opacity white/silver mist simulating chalk dust drifting in the air:
  ```css
  background: radial-gradient(circle at 50% 0%, rgba(255, 85, 0, 0.08) 0%, transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(244, 244, 246, 0.03) 0%, transparent 40%),
              #0e1013;
  ```
- **Borders:** Crisp, razor-thin steel wireframe edges (`1px solid #2a2f3a`) paired with beveled card corners (`clip-path` or chamfered utility).

---

## 5. Key UI Component Styling

### Hero Action Buttons
- Solid molten forge orange (`#ff5500`) with high-contrast pitch text or bright chalk text.
- Beveled/angled corner (`border-radius: 4px`) with a heavy drop shadow: `0 8px 24px rgba(255, 85, 0, 0.25)`.
- On hover: translateY(-2px), expands the amber heat aura.

### Cards (Disciplines & Championships)
- Heavy cast iron background (`#16191f`) with a 1px steel border (`#2a2f3a`).
- Chamfered header tab or industrial badge on top right.
- On hover, border turns to `#ff5500` and the knurled background subtly lights up.

---

## 6. Why This Fits Grip Australia
Grip Sport is an uncompromising, no-gimmicks athletic discipline. The "Raw Iron & Mag Chalk" theme commands immediate respect from powerlifters, armwrestlers, strongmen, and rock climbers alike. It feels authentic, heavy, and battle-tested.
