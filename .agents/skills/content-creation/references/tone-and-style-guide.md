# Grip Australia Tone & Style Guide

This guide details the writing style required for all content, documentation, and guides in the Grip Australia repository.

---

## Core Philosophy

We write like a **knowledgeable, practical strength coach or engineer talking to an informed peer**.

- **Calm and direct:** Let facts and mechanical reality carry the weight.
- **Informational first:** Focus on what happened, how implements work, and how lifters train.
- **Zero melodrama:** Treat physical lifts and equipment mechanics as everyday athletic disciplines, not life-or-death struggles.

---

## 1. The "Bro, Chill" Rule (Cut the Drama)

Avoid sensational, movie-trailer prose. Downscale high-intensity verbs and catastrophic descriptors.

### Prohibited / High-Risk Phrases (Automated by `scripts/check-content.js`)
The content governance script scans for the following patterns and will issue warnings:

| Pattern / Phrase | Why It Is Flagged | Preferred Alternative |
| :--- | :--- | :--- |
| `"the official"` / `"official national"` | Over-reaching authority claim | `"sanctioned under GSI rules"`, `"Australian national record"` |
| `"governs all"` | Universal governance claim | `"administers GSI-sanctioned events"` |
| `"universal standard"` | Unsubstantiated absolute claim | `"widely adopted contest standard"` |
| `"world's most"` | Unverified superlative | State the specific, measured attribute |
| `"guarantees"` | Absolute promise | `"helps prevent"`, `"promotes"`, `"reduces the chance of"` |
| `"TODO"` / `"FIXME"` / `"TBD"` | Unfinished task marker | Complete the content or omit the placeholder |
| `"Coming Soon"` | Dead placeholder | Add content when ready |

---

## 2. The Adjective & Adverb Diet

Aggressively eliminate breathless intensifiers:

- ❌ **Avoid:** *Violently, catastrophically, monumentally, breathtakingly, desperately, utterly, insanely, vicious.*
- ❌ **Avoid:** *Tectonic shift, insurmountable hurdle, lethal flaw, brutal punishment, unyielding fury.*
- ✔️ **Use:** *Unevenly, breaks, slips, rotates, introduces friction, requires adjustment, fails at lockout.*

---

## 3. Before & After Reference Table

| Context | ❌ Hyperbolic / Sensational | ✔️ Grounded & Factual |
| :--- | :--- | :--- |
| **Grip slip on thick bar** | "The unforgiving revolving axle twists violently out of the lifter's desperate grasp, crashing down in catastrophic failure." | "As fatigue sets in, the thick handle rotates in the lifter's fingers, causing the bar to slip before lockout." |
| **Gripper training** | "Unleash devastating crushing power that will obliterate your genetic limitations." | "Regular torsion-spring gripper work builds crushing grip strength and tendon resilience in the hands and fingers." |
| **Pinch block mechanics** | "The slightest micro-tilt unleashes an unstoppable shear force that rips the implement from your thumb." | "If the pinch block tilts off-axis, the uneven weight distribution will roll the block out of your thumb opposition." |
| **Contest results** | "A blood-pumping, legendary clash of titans that completely shattered the sport's history books." | "Competitors contested four events across multiple weight classes, producing two new national records." |
| **Equipment quality** | "An indestructible, god-tier loading pin engineered to withstand apocalyptic abuse." | "A welded steel Olympic loading pin with a 1.9-inch diameter and a rated eye bolt suitable for heavy working loads." |

---

## 4. Formatting for Readability

- **Punchy Paragraphs:** Keep paragraphs to 2–4 sentences.
- **Descriptive Headings:** Use informative headings (e.g., `## 2. Olympic Loading Pins & Carabiners` instead of `## Pin Magic`).
- **Scannable Lists & Tables:** Present technical specs, gear checklists, and rules in tables or bullet points.
- **Contextual Callouts:** Use `> [!NOTE]` or `> [!TIP]` for secondary tips, preventing inline clutter.
