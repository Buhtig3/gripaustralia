# Theme 05: Brutalist Mono-Grit

> **Aesthetic Archetype:** Underground Powerhouse / Neo-Brutalist High-Impact  
> **Core Mood:** Aggressive, raw, stark, loud, industrial warning tape, zero-BS.

---

## 1. Design Concept & Philosophy

No soft blur gradients. No delicate corporate curves. **Brutalist Mono-Grit** is built like an underground powerlifting basement: harsh contrast, 2px thick black-and-white borders, hard drop shadows with 0px blur, aggressive hazard caution yellow accents, and bold monospaced utility typography.

It's punchy, hyper-modern, and instantly grabs attention. It speaks directly to athletes who lift heavy iron, value honesty over polish, and treat hand strength with serious intensity.

---

## 2. Color Palette & Token Specifications

| Token Name | Hex Code | Semantic Role | Usage Description |
| :--- | :--- | :--- | :--- |
| `--color-bg-base` | `#000000` | Void Pitch Black | Base background canvas |
| `--color-bg-surface` | `#111111` | Brutalist Concrete Dark| Component cards, panel bodies |
| `--color-border-hard`  | `#ffffff` | Stark White Solid Border| 2px solid containment borders |
| `--color-accent-hazard`| `#ffe600` | Caution Hazard Yellow | High-impact CTA buttons, warning tags |
| `--color-accent-amber` | `#ff3b30` | Redline Indicator | Danger badges, record break alerts |
| `--color-text-primary` | `#ffffff` | Pure High-Contrast White| Primary headlines, body text |
| `--color-text-muted`   | `#a1a1aa` | Zinc 400 | Secondary text, footnotes |
| `--color-shadow-hard`  | `#ffe600` | Offset Cast Shadow | 4px-6px hard offset drop shadow (0 blur) |

### Tailwind CSS Color Configuration
```javascript
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      brutal: {
        black: '#000000',
        card: '#111111',
        yellow: '#ffe600',
        red: '#ff3b30',
        zinc: '#a1a1aa',
      }
    },
    boxShadow: {
      'brutal-yellow': '4px 4px 0px 0px #ffe600',
      'brutal-white': '4px 4px 0px 0px #ffffff',
      'brutal-lg': '6px 6px 0px 0px #ffe600',
    }
  }
}
```

---

## 3. Typography Hierarchy

- **Display & Headings:** `Archivo Black` or `Druk Wide` (Weight: 900 / Ultra Black, Uppercase)
  - Tremendous physical mass in each letter. Maximum impact.
- **Accents & Subheads:** `Space Mono` (Weight: 700 / Bold, Uppercase)
  - Industrial label-maker feel. Stamped warning placards.
- **Body & Copy:** `Geist Sans` or `IBM Plex Sans` (Weight: 500 Medium)
  - Sharp, geometric, high-density legibility.

```css
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

:root {
  --font-display: 'Archivo Black', sans-serif;
  --font-mono: 'Space Mono', monospace;
  --font-body: 'IBM Plex Sans', sans-serif;
}
```

---

## 4. Background & Texture Treatment

- **Hazard Stripe Warning Accents:** 45-degree diagonal warning striping on headers or card borders:
  ```css
  background: repeating-linear-gradient(
    -45deg,
    #ffe600,
    #ffe600 10px,
    #000000 10px,
    #000000 20px
  );
  ```
- **Halftone Dot Pattern:** High-contrast retro halftone dot background across sections.
- **Hard Edge Shadows:** No gaussian blurs:
  ```css
  box-shadow: 5px 5px 0px #ffe600;
  border: 2px solid #ffffff;
  ```

---

## 5. Key UI Component Styling

### Hero Action Buttons
- Hazard Yellow (`#ffe600`) background with 2px solid white or pitch black border.
- Offset hard shadow: `box-shadow: 4px 4px 0px #ffffff`.
- Active state: transforms `translate(2px, 2px)` with shadow reducing to `2px 2px 0px`.

### National Championship Archive Cards
- Pitch black background (`#000000`) with 2px solid white border.
- Offset hard yellow shadow `4px 4px 0px #ffe600`.
- Bold stencil badge: `[2026 // NAT_CHAMPIONSHIP]`.

---

## 6. Why This Fits Grip Australia
Grip Sport is about sheer physical resilience—pinching thick blocks, ripping steel grippers shut. Neo-brutalism matches that raw, unfiltered energy. It stands out dramatically from the ocean of generic boilerplate fitness templates.
