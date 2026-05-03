# Design system — spec & data

Source-of-truth for the SheepDog state model + supporting data tables.
The Figma mockup ([`../mockups/panel/panel.figma-script.js`](../mockups/panel/panel.figma-script.js))
is the **visual realization** of these specs — when they conflict, this folder wins.

## Files

### Spec (markdown)

- **`state-design.md`** — primary spec. Three-tier model: **States** (S1–S6
  observable categories) / **Settings** (EYE/SUB/LBL orthogonal) / **Events**
  (verbs that mutate state/settings/flags). Covers tier cycle, FLT cascade,
  Mirror DEL diff-based flow + safety hierarchy, plugin boundary,
  asymmetric ambiguity axiom, and the §1–§16 numbered decision references
  used throughout the panel mockup.
- **`parked-notes.md`** — active contracts + design debt + decision history.
  Holds the contracts that ride on top of the spec but aren't formal axes
  (e.g. eye pause persistence, Source/Bin Name toggle, mirror DEL diff
  hierarchy implementation). Also tracks polish-bucket items deferred
  to v1.1+.
- **`edge-cases-wip.md`** — working doc for open architectural questions.
  Status-marked (🟢 LOCKED / 🟡 LEANING / 🔴 OPEN / ⚫ PARKED). Decisions
  lock here first, then sync into spec/parked-notes/mockup. Once a question
  fully syncs, move to «Closed» section at bottom of the WIP doc.

### Data tables (CSV)

- **`state-axes.csv`** — orthogonal axes that compose into row state
  (path × enabled × busy × sot_parity). Used to verify the model is complete.
- **`state-matrix.csv`** — full (axis × axis) outcome matrix. Ground truth
  for which combinations the panel supports + how each renders.
- **`mirror-decisions.csv`** — 16-case Premiere↔FS violation matrix
  (en SOT). Each row = one event with trigger conditions + consequences +
  recovery paths in both Advanced and Simplified modes. This is essentially
  an event-table — see state-design.md §"Events" section.
- **`mirror-decisions.ru.csv`** — то же по-русски (тождественная структура).

## Versioning

These specs are unversioned — `state-design.md` is always the current truth.
Past architecture concepts live in [`../archive/panel-v1-architecture.md`](../archive/panel-v1-architecture.md)
and [`../archive/panel-v1.2-architecture.md`](../archive/panel-v1.2-architecture.md) (frozen, for diff).
