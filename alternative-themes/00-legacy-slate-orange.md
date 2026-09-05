# Theme 00: Classic Slate & Forge Orange (Original Launch Design)

> **Aesthetic Archetype:** Hardcore Gym & Tactical Dark Slate  
> **Core Mood:** Heavy, industrial, dark mode first, high contrast orange highlights.

---

## 1. Design Concept & Philosophy

This theme represents the initial benchmark launch styling for Grip Australia (`gripaustralia.com`). It prioritizes an imposing, dark slate background reminiscent of heavy iron gym floors, chalk-stained rubber mats, and high-visibility industrial safety orange accents.

---

## 2. Color Palette & Token Specifications

| Token Name | Hex Code | Semantic Role | Usage Description |
| :--- | :--- | :--- | :--- |
| `--color-bg-base` | `#020617` | Slate 950 | Primary dark page background |
| `--color-bg-surface` | `#0f172a` | Slate 900 | Header, footer, cards, and modal backdrops |
| `--color-bg-elevated` | `#1e293b` | Slate 800 | Card borders, secondary buttons, divider rules |
| `--color-border-subtle`| `#334155` | Slate 700 | Input borders, search focus rings |
| `--color-accent-orange`| `#f97316` | Orange 500 / 600 | Primary action button, focal highlights, logo |
| `--color-accent-amber` | `#f59e0b` | Amber 500 | Badge accents, champion callouts |
| `--color-text-primary` | `#f1f5f9` | Slate 100 | Primary body text and headers |
| `--color-text-muted`   | `#94a3b8` | Slate 400 | Secondary descriptions, timestamps, subheadings |

### Tailwind CSS Color Tokens (Original)
```javascript
theme: {
  extend: {
    colors: {
      brand: {
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
      },
      steel: {
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
      }
    }
  }
}
```

---

## 3. Typography Hierarchy

- **Display & Headings:** `Inter` (Font weight: 800/900, tracking tight)
- **Body & Tabular Data:** `Inter` (Font weight: 400/500/600)
- **Code & Timers:** `monospace` (JetBrains Mono / system mono)

```css
:root {
  --font-display: 'Inter', sans-serif;
  --font-accent: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

---

## 4. Key UI Component Styling

### Brand Logo
- **Icon:** Rounded rectangle with orange-to-amber gradient (`from-orange-500 to-amber-600`), containing white two-handled gripper SVG.
- **Wordmark:** `Grip` (white) + `Australia` (orange `#f97316`) + subtitle `Just Grip It` (slate-400).

### Action Buttons
- **Primary:** Orange 600 (`#ea580c`) hover to Orange 500 (`#f97316`) with white text and orange glow shadow (`shadow-orange-600/30`).
- **Secondary:** Slate 900 surface with Slate 700 border, hovering to Slate 800.

### Content Cards
- Slate 900/70 background with Slate 800 1px border.
- Hover transition to `border-orange-500/50` and orange glow shadow.

---

## 5. Restoration Note

To restore this theme across the application at any time, set `data-theme="legacy-slate"` on the root `<html>` element, or select **Theme 00: Classic Slate** from the theme showcase.
