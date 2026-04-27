# Design

Design system + assets + mockups for SheepDog. Single source of truth for all
visual + spec decisions. Code lives in [`../sheepdog/`](../sheepdog/); this
folder defines what that code should look like and how it should behave.

## Layout

```
design/
├── system/      ← canonical spec (state model, palette, taxonomy)
├── mockups/     ← active Figma scripts (panel, logo, roadmap)
├── assets/      ← icons (lucide + custom) + reference images
├── screenshots/ ← PNG snapshots of mockup iterations
└── archive/     ← frozen past versions (read-only in spirit)
```

## Where to start

| You want to … | Open this |
|---|---|
| Understand the state model | [`system/state-design.md`](system/state-design.md) |
| Render the live panel mockup | [`mockups/panel/panel.figma-script.js`](mockups/panel/panel.figma-script.js) → paste into [Figma Scripter](https://scripter.rsms.me/) |
| Pick a logo direction | [`mockups/logo/logo-pixel.figma-script.js`](mockups/logo/logo-pixel.figma-script.js) or [`mockups/logo/logo-ascii.figma-script.js`](mockups/logo/logo-ascii.figma-script.js) |
| Find an icon | [`assets/icons/`](assets/icons/) |
| See what was tried before | [`archive/`](archive/) |
| Browse old PNG mockup snapshots | [`screenshots/`](screenshots/) |

## Conventions

- **Lower-kebab-case** filenames. No spaces, no special chars, no typos.
- **Versionless current state.** `system/state-design.md` is always authoritative.
  Past iterations live in `archive/`, history is in git.
- **No intermediates.** Final assets only — pipeline scratch (`.opt.svg`,
  `_pixel_analysis/`) is `.gitignore`'d.
- **Slug-rename refs.** External reference images renamed to descriptive slugs.
  No UUID filenames.

## Per-folder details

Each folder has its own `README.md` with specifics — open the one closest to
what you're working on.
