# Grip Australia Content Fact-Checking Checklist

Use this checklist during research and prior to publishing or modifying articles in `src/content/articles/` or content pages in `src/pages/`.

---

## 1. Athlete Records & Results Verification

Always cross-reference competitor names, lifts, dates, and divisions against local JSON datasets:

| Data Type | Primary Source File | Key Verification Points |
| :--- | :--- | :--- |
| **National Records** | `src/data/records.json` | Exact spelling of lifter name, weight in kg, event name, division, bodyweight class, date, location. |
| **Mandrel Wrist Wrench** | `src/data/mandrel_records.json` | Exact division, weight in kg, lifter name, date. |
| **Championship Scorecards** | `src/data/results.json` | Contest year (`2024`, `2025`, `2026`), overall winners, pound-for-pound (P4P) winners, event ranks. |
| **Sanctioned Competitions** | `src/data/competitions.json` | Date, venue, city, promoter, registration status (`registration_open`, `completed`). |

### Rules for Record Citations
- **No Estimations:** Never estimate or approximate record weights. If a record is 102.5 kg, state 102.5 kg.
- **Record Status:** Ensure the record is listed as `status: "current"`. If superseded, reference the historical context accurately.
- **Lifter Name Consistency:** Double check name spelling against previous records (e.g., check for hyphenated names or common spelling variations).

---

## 2. Equipment Dimensions & Mechanical Specifications

Ensure all equipment dimensions, tolerances, and calibration ratings are technically accurate:

- **Loading Pins:** Standard Olympic loading pins are **1.9" (48–50 mm)** in diameter to fit 2" Olympic weight plates without excessive wobble.
- **Pinch Implements:**
  - 1-Hand or 2-Hand Pinch Blocks: Typically **2" (50.8 mm)** or **3" (76.2 mm)** flat gripping surface.
  - Euro Pinch: Standard adjustable width apparatus (typically adjusted in 4 mm increments, e.g., 50–62 mm).
- **Thick Bars & Axles:** Standard thick bar handles are **2" (50 mm)** or **2.375" / 2.5" (60–63.5 mm)** in outer diameter (e.g., IronMind Apollon's Axle is 2.0" / 50.8 mm OD).
- **Mullett's Mandrel:** 60 mm diameter wrist wrench with a single-loop nylon strap.
- **Torsion-Spring Grippers:**
  - Resistance is measured by **RGC (Rating by Cannon / Red's Gripper Calibration)** in pounds or kg.
  - Avoid manufacturer nominal ratings (e.g., stating a CoC #2 is "always 195 lbs") without noting that actual RGC calibration typically sits between 100–110 lbs.
- **Chalk:** Pure gymnastic magnesium carbonate ($\text{MgCO}_3$). No tacky resin or rosin unless explicitly permitted by specific event rules.

---

## 3. Unit Conversions & Precision

- **Standard Conversion:** $1\text{ kg} \approx 2.20462\text{ lbs}$ (or $1\text{ lb} \approx 0.45359\text{ kg}$).
- **Precision:** When displaying conversions, match the precision of the original measurement:
  - $50.0\text{ kg} \rightarrow 110.2\text{ lbs}$
  - $100\text{ lbs} \rightarrow 45.4\text{ kg}$
- Do not round rough estimates (e.g., do not call 50 kg "about 120 lbs").

---

## 4. Governing Body & Rules Accuracy

- **Governing Body:** Competitions documented on this site operate primarily under **Grip Sport International (GSI)** sanctioning and rules.
- **Contest Formats:**
  - **Rising Bar:** Implement weight increases monotonically. Once a lifter passes or fails, they cannot take a lighter attempt.
  - **Standard Round:** Competitors receive 3 or 4 attempts per event.
- **Legal Lifts & Lockout:**
  - Lift height is dictated by an approved crossbar or knee/hip lockout depending on event rules.
  - Down signal must be given by the referee; dropping or releasing before the referee signal invalidates the lift.
  - No deliberate contact between the lifting hand/arm and the body (no bracing on the thighs or hips).

---

## 5. Verification Metadata in Articles

Every article in `src/content/articles/` must document its provenance in frontmatter:

```yaml
sourceName: "Grip Australia Technical Guide" # or governing body / dataset name
sourceUrl: "https://gripaustralia.com/useful-resources"
verifiedAt: "2026-09-15" # Date of last fact check
contentStatus: "verified" # 'draft' | 'verified' | 'archived'
```

Running `npm run check:content` enforces that `sourceName` or `sourceUrl` is present.
