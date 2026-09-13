# Archived: Australian Grip Records Table & Ingestion Snapshot

> **Archive Notice:** This document archives the interactive records table, data methodology, and component structure originally published at `/records` on Grip Australia.

---

## Data Methodology & Assumptions

- **Dual Gender Ingestion:** Sourced from `gripsport.org/records?country=5&measurement=0&weightclass=all`. Both Men (`gender=1`) and Women (`gender=2`) datasets were indexed to ensure complete representation.
- **Metrics Standardisation:** All records stored as numerical values in kilograms (`weightKg`) with imperial conversions (`lbs = kg × 2.20462`).
- **Timed Holds:** Timed endurance events (Silver Bullet holds, Inch holds) calibrated in seconds (`sec`).
- **Mandrel Separation:** Separate tracking for Henry Mullett's Mandrel wrist wrench implement.

---

## Component Architecture Snapshot (`GripRecordsTable.astro`)

The interactive table provided:
- Gender filtering (`All`, `Men`, `Women`)
- Category tabs (`All`, `Crush`, `Pinch`, `Thick Bar`, `Vertical Bar`, `Historic Feats`)
- Metric switch (`KG` / `LBS`)
- Search input across event, holder name, division, and location
- Visual status badges (`GSI Record`, `Championship Mark`, `Historical Feat`)

```astro
<!-- GripRecordsTable.astro Original Interface Schema -->
<GripRecordsTable records={records} />
```

---

## Source Data File Reference
The full verified JSON dataset resides in `src/data/records.json` and sync metadata in `src/data/records_meta.json`. Official international benchmarks continue to be published and maintained at [Grip Sport International (gripsport.org)](https://gripsport.org/records).
