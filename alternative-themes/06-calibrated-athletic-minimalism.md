# Theme 06: Calibrated Athletic Minimalism (Deep Eucalyptus & Wattle Gold)

> **Aesthetic Archetype:** Calibrated National Federation & Technical Scoreboard  
> **Core Mood:** Authoritative, industrial, precise, grassroots strength, technical record-keeping.

---

## 1. Brand Identity & Visual Positioning

- **Core Essence:** Industrial, precise, grassroots strength, and authoritative record-keeping.
- **Design Philosophy:** Avoid overly stylized, aggressive "hardcore gym" tropes (e.g., grungy distressed fonts, neon green accents). Instead, lean toward **calibrated athletic minimalism**—mirroring competition-grade steel plates, knurled bars, and technical scoreboards.

---

## 2. Color Palette System

The palette takes inspiration from classic Australian athletic identities (green and gold), grounded by raw steel and chalk neutrals for data readability.

| Role | Color Name | Hex Code | Purpose / Application |
| :--- | :--- | :--- | :--- |
| **Primary Base** | Deep Eucalyptus | `#143024` | Main navbar, primary buttons, hero headers, footer. |
| **Secondary Base** | Iron Ore / Charcoal | `#18181B` | High-contrast backgrounds, record card borders, dark-mode surfaces. |
| **National Accent** | Wattle Gold | `#E5A93C` | National Record (AR) badges, hover states, active category tabs. |
| **Supporting Accent** | Calibrated Ochre | `#B87333` | Historical notes, record verification tags, minor callouts. |
| **Surface / Light** | Chalk Off-White | `#F8F9FA` | Main page background, record table zebra-striping, data cards. |
| **Surface Muted** | Cold Steel | `#F1F3F5` | Table header rows, filter chip backgrounds, dividers. |
| **Text Primary** | Cast Iron | `#0F172A` | Primary body text, lifter names, weights. |
| **Text Muted** | Slag Grey | `#64748B` | Secondary imperial units (`lbs`), dates, contest locations. |
| **Border / Rule** | Cold Steel Wire | `#E2E8F0` | Knurled card borders, table dividers. |

### Tailwind CSS Color Configuration
```javascript
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      eucalyptus: {
        950: '#0d2018',
        900: '#143024',
        800: '#1c4534',
        700: '#275e47',
      },
      wattle: {
        500: '#e5a93c',
        600: '#cc922b',
        glow: '#f5be58',
      },
      calibratedOchre: '#b87333',
      chalkBg: '#f8f9fa',
      coldSteel: '#f1f3f5',
      castIron: '#0f172a',
      slagGrey: '#64748b',
    }
  }
}
```

---

## 3. Typography Hierarchy

The typography pairs a **condensed, high-impact athletic display font** for headers and branding with a **highly legible, tabular-friendly UI sans-serif** for data grids and body text.

### Font Selections
- **Display / Brand Family:** `Barlow Condensed` (Google Fonts)
  - *Weights:* 600 (Semi-Bold), 700 (Bold), 800 (Extra-Bold)
  - *Characteristics:* Tall, compact, and architectural. Allows multi-word implement names (e.g., *Two-Hand Pinch Deadlift*) to stay on one line on mobile.
- **Body / Tabular Data Family:** `Inter` (Google Fonts)
  - *Weights:* 400 (Regular), 500 (Medium), 600 (Semi-Bold)
  - *Characteristics:* Exceptional micro-legibility and full OpenType feature support (`font-variant-numeric: tabular-nums`) for numeric alignment.

### Typographic Scale & Application

| Level | Font Family | Size / Line-Height | Weight | Tracking / CSS Details |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Page Title)** | Barlow Condensed | 48px / 1.1 | 800 | `uppercase`, letter-spacing: `0.04em` |
| **H2 (Discipline Group)** | Barlow Condensed | 32px / 1.2 | 700 | `uppercase`, letter-spacing: `0.03em` |
| **H3 (Implement Name)** | Barlow Condensed | 24px / 1.2 | 600 | `uppercase`, letter-spacing: `0.02em` |
| **Metric Figure (kg)** | Inter | 16px / 1.4 | 600 | `font-variant-numeric: tabular-nums;` |
| **Secondary Metric (lbs)** | Inter | 13px / 1.4 | 400 | `font-variant-numeric: tabular-nums; color: #64748B;` |
| **Table Headings** | Barlow Condensed | 14px / 1.0 | 700 | `uppercase`, letter-spacing: `0.06em`, `color: #475569;` |
| **Body / Explanatory** | Inter | 15px / 1.6 | 400 | Standard sentence case |
| **Badge / Status Tag** | Barlow Condensed | 12px / 1.0 | 700 | `uppercase`, letter-spacing: `0.08em` |

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --ga-green-deep: #143024;
  --ga-green-dark: #0d2018;
  --ga-gold-accent: #e5a93c;
  --ga-steel-dark: #18181b;
  --ga-steel-light: #f1f3f5;
  --ga-bg-chalk: #f8f9fa;
  --ga-text-main: #0f172a;
  --ga-text-muted: #64748b;
  --ga-border: #e2e8f0;

  --font-display: 'Barlow Condensed', sans-serif;
  --font-accent: 'Barlow Condensed', sans-serif;
  --font-body: 'Inter', sans-serif;
}

.tabular-nums {
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

.heading-display {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
}
```

---

## 4. UI Components & Visual Tokens

- **Badges & Record Indicators:**
  - **Australian Record (AR):** Solid `#E5A93C` wattle gold background with `#143024` eucalyptus bold text.
  - **All-Comers Record:** Outline badge with `#64748B` border and subtle grey fill.
- **Category Tabs & Selectors:**
  - Pill-style tabs with flat borders (`#E2E8F0`).
  - Active state fills with Deep Eucalyptus (`#143024`) and crisp white text.
- **Knurling & Divider Motifs:**
  - Subtle 1px dotted or dashed borders (`#CBD5E1`) separating implement cards, evocative of barbell knurling lines rather than aggressive graphics.
- **Data Row Spacing:**
  - Strict 44px–48px row height on tables for comfortable tap targets on mobile devices at local meets.

---

## 5. Why This Fits Grip Australia

This theme offers the ideal blend of national sporting pride and scientific rigor:
1. **Official National Colors:** Deep Eucalyptus and Wattle Gold immediately establish the site as Australia's official national sanctioning body.
2. **Tabular Data Precision:** Built specifically for scoresheets, gripper calibrations (RGC ratings), and national record leaderboards.
3. **Calibrated Minimalism:** Clean, light, and approachable without looking like an overly sterile corporate template or a grungy garage flyer.
