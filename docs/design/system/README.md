# Design system — spec & data

Source-of-truth for the SheepDog state model + supporting data tables.
The Figma mockup ([`../mockups/panel/panel.figma-script.js`](../mockups/panel/panel.figma-script.js))
is the **visual realization** of these specs — when they conflict, this folder wins.

## Files

- **`state-design.md`** — primary spec. Covers the 4-state model
  (Healthy / Busy / Disabled / Missing), tier cycle, FLT cascade, Mirror DEL
  flow, plugin boundary, and the §1-§16 numbered decision references used
  throughout the panel mockup.
- **`state-axes.csv`** — orthogonal axes that compose into row state
  (state-indicator × user-intent × FS-reachability). Used to verify the model
  is complete.
- **`state-matrix.csv`** — full (axis × axis) outcome matrix. Ground truth
  for which combinations the panel supports + how each renders.

## Versioning

These specs are unversioned — `state-design.md` is always the current truth.
Past architecture concepts live in [`../archive/panel-v1-architecture.md`](../archive/panel-v1-architecture.md)
and [`../archive/panel-v1.2-architecture.md`](../archive/panel-v1.2-architecture.md) (frozen, for diff).
