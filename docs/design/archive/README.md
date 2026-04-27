# Archive — frozen Figma scripts

Superseded versions of the panel mockup + experimental sandboxes. Read-only
in spirit: kept for historical reference, **not** for editing.

If you need a feature from one of these — port it forward into the active
[`mockups/panel/panel.figma-script.js`](../mockups/panel/panel.figma-script.js)
rather than reviving the archive file.

## Frozen

| File | Topic | Why archived |
|---|---|---|
| `panel-v1.figma-script.js` | First panel concept (state showcase, basic columns) | Superseded by v1.2 |
| `panel-v1.2.figma-script.js` | + FLT + safety cover + Sort + Settings + DEL | Superseded by v2 (state model rewrite) |
| `states-experiment.figma-script.js` | New state model + LED palette + Simplified mode | Merged into v2 |
| `tier-cycle-experiment.figma-script.js` | 3-click cycle + Root constraint + bulk grammar | Merged into v2 |
| `cols-experiment.figma-script.js` | Column architecture sandbox (STATE→ST, flex spacer) | Lifted into v2 |
| `checkbox-variants-experiment.figma-script.js` | Visual variants for checkbox tier system | Lifted into v2 §REF taxonomy |

## Why keep them

- **Decision history** — comments in v2 reference these by name (`// merged from
  states-v1.js, etc.`). Removing them breaks those references.
- **Recovery path** — if v2 collapses on a section, can diff against archive
  to find the working pattern.
- **Independent reference** — some experiments diverged and are usable as
  standalone docs (e.g. `tier-cycle-experiment.figma-script.js` has the
  cleanest visualization of the 3-click cycle).
