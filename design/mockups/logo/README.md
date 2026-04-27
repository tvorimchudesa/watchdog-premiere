# SheepDog logo

8-bit pixel-art sheep mark. Used in `panel.figma-script.js` header (replaces the
original blue "S" dot via `sheepLogoNode(targetH)` helper).

## Files

- **`logo.svg`** — canonical asset. svgo-merged, 5 paths by fill, 2.2 KB.
  Native 168×144 (aspect 7:6). Drop into Figma / inline into JS / export to PNG.
- **`logo-pixel.figma-script.js`** — sandbox: 5 pixel-art concepts × 5 scales
  (1×/2×/4×/12× dark + 12× light) on one canvas. Used to pick a direction.
- **`logo-ascii.figma-script.js`** — sandbox: typographic mark inspired by
  [8-bit-sheep.com](https://8-bit-sheep.com). Glyphs: ⁐ + ︵ + ︶ + ө + λ +
  backticks/acutes + NBSP. Source-of-truth verified against site's `js/utils.js`.
- **`source/8bit-sheep-face.figma-export.svg`** — original Figma export (7.5 KB,
  168 paths). Pre-optimization, kept for reference / re-export if SVG paths
  need tweaking.

## Palette

5 fills:

| Token | Hex | Role |
|---|---|---|
| outline | `#2e2e36` | dark frame + ramка |
| wool | `#ededf2` | main body fill |
| ears | `#f5b3c7` | pink ear blocks |
| eyes | `#1a1a21` | pupil dots |
| nose | `#eb8ca6` | snout center |

## Asset pipeline

`source/8bit-sheep-face.figma-export.svg` (7.5 KB, 168 rect)
→ `npx svgo --multipass` (rect→path, merge adjacent)
→ manual merge per fill (5 paths total)
→ final `npx svgo` pass
→ `logo.svg` (2.2 KB, 71% reduction)

Reproducible — re-run if Figma export changes.
