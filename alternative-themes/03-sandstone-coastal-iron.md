# Theme 03: Sandstone & Coastal Iron (Light)

> **Aesthetic Archetype:** Sunlit Australian Coast & Outdoor Strength Culture  
> **Core Mood:** Bright, organic, warm, sun-bleached, revitalizing, authentic Australian outdoor athleticism.

---

## 1. Design Concept & Philosophy

Australia’s outdoor strength tradition is famous worldwide—training by the sea, ocean-front pull-up bars, sun-bleached sandstone cliffs, and open-air lifting clubs under bright southern skies. **Sandstone & Coastal Iron** brings Grip Australia into the daylight with an organic, sun-warmed light aesthetic.

Instead of gloomy gym basements or dark digital screens, this theme utilizes warm limestone and sun-bleached linen backgrounds, crisp white floating surface cards, deep Pacific navy ink for high-contrast legibility, sunlit golden ochre CTA accents, and subtle eucalyptus green indicators.

---

## 2. Color Palette & Token Specifications

| Token Name | Hex Code | Semantic Role | Usage Description |
| :--- | :--- | :--- | :--- |
| `--color-bg-base` | `#f7f4ed` | Sunbleached Sandstone | Warm, light organic canvas background |
| `--color-bg-surface` | `#ffffff` | Crisp Coastal White | Surface cards, hero action wrappers, navbar |
| `--color-bg-elevated` | `#ede8dc` | Warm Limestone Shading | Subtle card hovers, borders, elevated chips |
| `--color-border-subtle`| `#dfd7c5` | Weathered Sandstone Edge | 1px delicate borders, section dividers |
| `--color-accent-gold`  | `#d97706` | Sunlit Amber / Golden Coast | Primary CTA buttons, key highlight accents |
| `--color-accent-terracotta` | `#c2410c` | Warm Terra Flame | Hover glow, attention tags |
| `--color-text-main`    | `#0f2942` | Pacific Deep Navy Ink | Primary display headlines, high contrast body |
| `--color-text-muted`   | `#5c6f84` | Coastal Mist Slate | Descriptive text, metadata, secondary links |
| `--color-badge-sage`   | `#eef5f1` | Sea-Salt Sage Tint | Background for official sanctioning badges |

### Tailwind CSS Color Configuration
```javascript
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      sandstone: {
        50: '#fdfbf7',
        100: '#f7f4ed',
        200: '#ede8dc',
        300: '#dfd7c5',
      },
      pacific: {
        900: '#0f2942',
        800: '#1a3c5e',
        600: '#5c6f84',
      },
      coastalGold: {
        500: '#d97706',
        600: '#b45309',
        glow: '#f59e0b',
      }
    }
  }
}
```

---

## 3. Typography Hierarchy

- **Display & Headings:** `Outfit` or `Space Grotesk` (Weight: 800 / Extra Bold, Uppercase)
  - Geometric, open, energetic, capturing the sunlit outdoor Australian spirit.
- **Accents & Eyebrows:** `Barlow Condensed` (Weight: 700 / Bold, Tracking: `0.12em`, Uppercase)
  - Athletic, structured, and punchy.
- **Body & Copy:** `Plus Jakarta Sans` or `DM Sans` (Weight: 400 Regular / 500 Medium)
  - Clear, crisp, and comfortable to read on warm light backgrounds.

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --font-display: 'Outfit', sans-serif;
  --font-accent: 'Barlow Condensed', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 4. Background & Texture Treatment

- **Warm Sunlit Ambient Radiance:** A subtle, warm solar radial wash from the top right simulating natural outdoor lighting:
  ```css
  background: radial-gradient(circle at 85% 0%, rgba(217, 119, 6, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 10% 40%, rgba(15, 41, 66, 0.03) 0%, transparent 40%),
              #f7f4ed;
  ```
- **Fine Sandstone Micro-Grid:** Ultra-subtle dot pattern resembling sandstone mineral grains (`background-size: 24px 24px`).
- **Elevated Clean Cards:** Pure white cards with soft limestone borders and warm ambient drop shadows (`box-shadow: 0 10px 30px -10px rgba(15, 41, 66, 0.08)`).

---

## 5. Key UI Component Styling

### Hero Action Buttons
- Radiant Sunlit Amber (`#d97706`) with crisp white lettering.
- Gentle rounded corners (`border-radius: 6px`) with warm amber shadow: `0 8px 24px rgba(217, 119, 6, 0.28)`.
- On hover: warms into `#c2410c` with smooth elevation.

### Championship & Discipline Cards
- Pristine pure white surface (`#ffffff`) framed with warm sandstone border (`#dfd7c5`).
- Deep Pacific navy headings (`#0f2942`) with high legibility.
- Golden badge pills (`background: rgba(217, 119, 6, 0.1); color: #d97706;`).
- Hover elevation brings a soft warm glow around the card frame.

---

## 6. Why This Fits Grip Australia
While most strength sites default to dark, underground aesthetics, **Sandstone & Coastal Iron** showcases Australian grip athletics in bright, natural daylight. It pairs beautifully with the warm earthy tones of *Outback Ochre* while providing an inviting, high-readability light mode that feels premium, outdoor-ready, and uniquely Australian.
