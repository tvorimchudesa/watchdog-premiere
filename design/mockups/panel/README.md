# SheepDog panel mockup

Active SOT for the SheepDog Premiere Pro panel design. Renders a multi-section
Figma document (~16 sections × 5400 LOC) covering the entire panel concept:
state model, tier cycle, bulk grammar, FLT, safety cover, sort, Mirror DEL,
Magnet+Herder, Settings, plugin boundary, palette taxonomy.

## Files

- **`panel.figma-script.js`** — main Figma Scripter script. Paste into
  [Figma Scripter](https://scripter.rsms.me/) plugin, run main(). Produces a
  ~12 000 px tall canvas with the full design doc.

## Map (panel.figma-script.js sections)

| § | Section | Topic |
|---|---|---|
| 1 | Main panel | State showcase (Healthy / Busy / Disabled / Missing) + 8 annotation cards |
| 2 | Simplified | Tier-A columns (STATE · NAME · LNK · LBL · ×) — default for new users |
| 3 | Tier model | 3-click cycle (pin · toggle · unpin) + Root constraint (2-state) |
| 4 | Bulk grammar | Root cascade, children-only, mixed (follow-as-capable) |
| 5 | Asymmetry tooltips | Educate root-vs-child state-space gap |
| 6 | FLT model | "Double-OFF" cascade + 3 pair demos |
| 7 | Safety cover | Flip-up metaphor + borderCountdown for destructive ops |
| 8 | Sort auto-clear | Drag clears sort + Undo toast |
| 9 | Mirror DEL | Per-row permission + Premiere-triggered OS trash |
| 10 | Progress panel | 4 variants (collapsed / idle / active / mirror-deleting) |
| 11 | Icon legend | Adobe-parity button states |
| 11b | Labels | Host-driven dynamic palette |
| 12 | Settings modal | General / Filters / Behavior / Danger zone / Logs |
| 13 | Plugin boundary | Config / FS / Premiere layer ownership |
| 14 | Magnet + Herder | Structure restoration + side-file safe harbour |
| REF | Palette + taxonomy | 10-token SOT + checkbox/eye/button matrices |

## Spec source

Maps to [`design/system/state-design.md`](../../system/state-design.md) — that
markdown is the spec, this Figma script is the visual realization.

## Logo integration

`panelHeader()` and `panelHeaderSimplified()` use `sheepLogoNode(targetH)` to
render the 8-bit pixel sheep from inline SVG. Source: [`../logo/logo.svg`](../logo/logo.svg).
Native 168×144, scaled to h=18 for panel header (21×18 in production).

## Predecessors

- `archive/panel-v1.figma-script.js` — first concept (states + visual exploration)
- `archive/panel-v1.2.figma-script.js` — added FLT + safety cover + Sort + Settings
- `archive/states-experiment.figma-script.js` — state model exploration (merged into v2)
- `archive/tier-cycle-experiment.figma-script.js` — tier cycle exploration (merged into v2)
- `archive/cols-experiment.figma-script.js` — column architecture sandbox (lifted into v2)
