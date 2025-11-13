# Just Intonation Interval Trainer (Testing Only)

Single-page React web application for practicing tuning musical intervals to **Just Intonation** by ear.  
Target users: professional musicians, instrument tuners, and curious ears.

> **Important:** This software is provided under the **Testing-Only, No-Copy Software License (CTOL v1.0)** by **Eugeniu Casimov**. See the License section below.

---

## Features

- 🚩 **20-round session** for each run.
- 🎯 Intervals drawn from a fixed Just Intonation set (1/1 up to 17 listed JI ratios).
- 🎚 **Randomized tuning slider** – the correct point changes every round and is not visually marked.
- 🎧 Real-time tuning:
  - Continuous pitch changes as the slider moves.
  - Two primary tones (slightly bright) for clear **beating/roughness**.
  - A simulated **Tartini combination tone** that becomes more stable and audible near the exact JI ratio.
- 📈 **Scoring system** (0–100, clamped):
  - Perfect tuning (±1 cent): **+5** points.
  - Fast response (< 6 s): **+3** points.
  - Imperfect tuning (> 1 cent): **−2** points.
  - Slow response (> 12 s): **−5** points.
- ✅ Clear **PASS/FAIL** at the end of 20 rounds (pass ≥ 75).
- 🌓 Dark UI, inspired by macOS-style dark mode:
  - Slightly lighter than pure black.
  - No “hot/cold” slider colouring – you only get information from sound.
- 🧠 On-page explanations:
  - What Just Intonation feels like.
  - How to listen for beats and ghost (Tartini) tones.
  - No heavy math in the visible UI.

---

## How to Run on Playcode.io

1. Go to [playcode.io](https://playcode.io) and create a new project.
2. Choose a **React + TypeScript** (or similar modern React) template.
3. Replace / create files to match this structure:

   ```text
   /
   ├─ index.html
   ├─ src
   │  ├─ main.tsx
   │  ├─ App.tsx
   │  ├─ audio
   │  │  ├─ intervals.ts
   │  │  ├─ dspUtils.ts
   │  │  └─ audioEngine.ts
   │  ├─ components
   │  │  ├─ StatusBar.tsx
   │  │  ├─ ExplanationPanel.tsx
   │  │  └─ LicensePanel.tsx
   │  └─ styles
   │     └─ theme.css
