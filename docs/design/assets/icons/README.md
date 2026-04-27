# Icons

Icon assets used by the panel mockup and (eventually) the production CEP panel.

## `lucide/` — external icon set

Subset of the [Lucide icon library](https://lucide.dev) used in the panel:
arrow-left, chevron-down, chevron-right, eye, eye-closed, funnel-x, magnet,
refresh-ccw, rotate-ccw. Verbatim from upstream — do not edit.

## `custom/` — own glyphs

Project-specific icons:

| File | Role |
|---|---|
| `eye-close.svg` / `eye-open.svg` | Custom eye glyphs (alternate to Lucide's) |
| `magnet.svg` | Custom magnet variant for "Magnet — restore SoT parity" action |
| `refresh.svg` | Manual sync glyph (was `↻.svg` — unicode filename, slug-renamed) |
| `relink.svg` | Relink glyph (was `⌕.svg` — unicode filename, slug-renamed) |
| `disabled-locked.svg` | Disabled+Locked checkbox/eye composite state |
| `locked.svg` | Locked tier (cascade-locked source) |

All filenames are filesystem-friendly slugs — no unicode, no spaces, no special
characters. Glyph reference identity preserved in §REF taxonomy of
[`mockups/panel/panel.figma-script.js`](../../mockups/panel/panel.figma-script.js).
