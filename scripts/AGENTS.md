# AGENTS.md

## Overview & Core Philosophy

This repository and project value **clarity, grounded facts, and a calm, conversational tone**.

A recurring problem with LLM-generated text is breathless, cinematic hyperbole—treating routine technical or physical mechanics like a scene from an action thriller (e.g., *"the slightest tilt causes the implement to twist violently out of the lifter's fingers"*).

Agents working in this repo must avoid unnecessary drama, melodrama, and exaggerated stakes. Write like a knowledgeable, practical engineer or coach talking to a peer: calm, direct, and factual.

---

## Guiding Principles

### 1. The "Bro, Chill" Rule (Cut the Drama)
- **Do not** describe ordinary physical or digital events with apocalyptic language.
- Things rarely "shatter into a million pieces," "twist violently," "wreak catastrophic havoc," or "completely paralyze the system."
- State the mechanical reality: what happens, why it happens, and what the fix is.

### 2. Adjective & Adverb Diet
Aggressively eliminate or downscale intensifying adverbs and dramatic adjectives:
- ❌ *Violently, catastrophically, monumentally, breathtakingly, desperately, utterly.*
- ❌ *Tectonic shift, insurmountable hurdle, lethal flaw, existential breakdown.*
- ✔️ *Unevenly, breaks, fails to build, slips, causes an error, adds friction.*

### 3. Factual & Measured Over Sensational
- Focus on quantifiable, observable behavior.
- If an edge case causes a null pointer exception, say: `"If input is null, it throws a NullPointerException."`
- Do not say: `"Feeding invalid data unleashes an unchecked cascade of silent corruption that destroys state integrity."`

### 4. Natural & Casual, Not Robotic or Pretentious
- Use natural phrasing: `"If the grip angle is off, the handle rolls out of your hand."`
- Avoid stiff academic fluff or marketing jargon: `"Leveraging synergistic kinetic pathways to mitigate biomechanical divergence."`
- Keep sentences punchy and easy to scan.

---

## Before & After Reference Table

| Context | ❌ Hyperbolic / Extreme | ✔️ Grounded & Factual |
| :--- | :--- | :--- |
| **Physical / Biomechanics** | "The slightest tilt causes the implement to twist violently out of the lifter's fingers, risking catastrophic tendon tear." | "If you tilt the implement, the off-center load will roll the handle out of your fingers." |
| **Bug / Exception** | "A missing semicolon plunges the entire asynchronous runtime into a death spiral." | "A missing semicolon causes a syntax error and stops the build." |
| **Performance** | "This bottleneck utterly cripples throughput, reducing performance to a crawl." | "This query is unindexed, which adds about 200ms of latency under load." |
| **API Failure** | "The endpoint violently rejects malformed payloads with lethal 400 responses." | "The endpoint validates the schema and returns a 400 status code for malformed payloads." |
| **Product / Feature** | "An unprecedented, game-changing paradigm shift in user engagement." | "A simplified navigation bar that makes it easier to find settings." |

---

## Practical Writing Checklist for Agents

When generating documentation, PR descriptions, comments, or explanations:

- [ ] **Check the intensity:** Did I describe a minor friction point as a disaster?
- [ ] **Strip movie-trailer prose:** Remove phrases like "unleash," "harness," "bulletproof," and "fatal."
- [ ] **Be descriptive, not dramatic:** Explain *how* something happens instead of how *terrible* it feels.
- [ ] **Keep technical docs pragmatic:** Give steps, trade-offs, and failure conditions neutrally.
- [ ] **Respect the user's intelligence:** State the point once without pounding the table.