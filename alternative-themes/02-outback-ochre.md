# Theme 02: Outback Ochre & Sunbaked Terra

> **Aesthetic Archetype:** Australian Rugged Earth / Bush Iron Heritage  
> **Core Mood:** Grounded, distinctly Australian, warm, sunbaked, resilient, organic grit.

---

## 1. Design Concept & Philosophy

Australia's strength culture is inseparable from its landscape—sun-drenched red dirt, weathered eucalyptus, rusted corrugated iron, and relentless heat. **Outback Ochre & Sunbaked Terra** gives Grip Australia a proudly distinct national identity that separates it from generic American or European powerlifting sites.

Instead of cold corporate grays or sterile blues, this theme leverages warm charred ironbark tones, mineral-rich ochre clay, golden sandstone, and subtle hints of spinifex sage.

---

## 2. Color Palette & Token Specifications

| Token Name | Hex Code | Semantic Role | Usage Description |
| :--- | :--- | :--- | :--- |
| `--color-bg-base` | `#141110` | Charred Ironbark | Primary page canvas |
| `--color-bg-surface` | `#1e1917` | Bush Iron Slate | Navigation bar, content cards, article panels |
| `--color-bg-elevated` | `#2a2320` | Weathered Timber | Card hovers, modals, dropdown menus |
| `--color-border-subtle`| `#3d332f` | Terracotta Clay Border | Subtle boundaries, separators |
| `--color-accent-ochre` | `#e05a2b` | Red Centre Ochre | Primary action button, focal highlights |
| `--color-accent-gold`  | `#e59b3c` | Pilbara Golden Dust | Secondary highlights, trophy badges |
| `--color-accent-sage`  | `#5d7a68` | Spinifex Gum Green | Sanctioning badges, verification indicators |
| `--color-text-primary` | `#faf5ee` | Sunbleached Quartz | Headings, high-contrast readable body |
| `--color-text-muted`   | `#ad9e96` | River Sand Stone | Secondary descriptions, timestamps |

### Tailwind CSS Color Configuration
```javascript
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      outback: {
        950: '#141110',
        900: '#1e1917',
        800: '#2a2320',
        700: '#3d332f',
      },
      ochre: {
        500: '#e05a2b',
        600: '#c5461a',
      },
      sand: {
        400: '#e59b3c',
        100: '#faf5ee',
        300: '#ad9e96',
      },
      sage: {
        500: '#5d7a68',
      }
    }
  }
}
```

---

## 3. Typography Hierarchy

- **Display & Headings:** `Bebas Neue` or `Cabinet Grotesk` (Weight: 400 with letter-spacing `0.05em`)
  - Tall, imposing, like towering Australian red gum trunks and desert rock formations.
- **Subheadings & Eyebrows:** `Space Grotesk` (Weight: 600 / Semi-Bold, Uppercase)
  - Geometric yet warm, with architectural character.
- **Body & Editorial:** `DM Sans` or `Public Sans` (Weight: 400 Regular / 500 Medium)
  - Highly humanistic, warm, clean, and legible against deep earthy dark backgrounds.

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@500;700&display=swap');

:root {
  --font-display: 'Bebas Neue', cursive;
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```

---

## 4. Background & Texture Treatment

- **Topographic Contour Vectors:** Delicate, ultra-low opacity (4%) topographical contour lines evoking the Flinders Ranges and Uluru rock contours.
- **Sunbaked Ambient Warmth:** A warm amber/red glow emanating from the top horizon:
  ```css
  background: radial-gradient(circle at 50% -10%, rgba(224, 90, 43, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 100% 60%, rgba(229, 155, 60, 0.06) 0%, transparent 40%),
              #141110;
  ```
- **Warm Textured Paper Grain:** Microscopic noise layer providing tactile earthiness rather than digital coldness.

---

## 5. Key UI Component Styling

### Hero Action Buttons
- Rich ochre red (`#e05a2b`) gradient blending into gold dust (`#c5461a`).
- Rounded corners (`border-radius: 6px`) with warm amber shadow: `0 8px 20px rgba(224, 90, 43, 0.3)`.
- Icon accents in sunbleached quartz white.

### National Championship & Discipline Cards
- Bush Iron slate background (`#1e1917`) with a subtle 1px border (`#3d332f`).
- Golden ochre pill tags with gold borders for status ("Latest Championship", "National Records").
- Warm hover elevation transition that warms the card perimeter to `#e05a2b`.

---

## 6. Why This Fits Grip Australia
It reinforces the **"Australia"** in Grip Australia. Rather than copying generic US strength templates, it carves out an unforgettable brand presence that proudly honors Australian geography, perseverance, and bush toughness.
