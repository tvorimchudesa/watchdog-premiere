// SheepDog — ASCII glyph logo · Figma Scripter sandbox
// Direction: text-mark made of Unicode glyphs. Reference: 8-bit-sheep.com
// (verified against source /js/utils.js, charSet below is canon).
//
// Canonical art (final state of typewriter animation):
//    ︵  ︵                  (2× ︵ FE35 with NBSPs around)
//   ⁐(ө`` | ´´ө)⁐           (line 59 of utils.js, no indent)
//   \ |    | /               (line 68: 2 legs + 4 NBSPs gap + 2 legs)
//   λ                        (CSS .lambda class centers it visually)
//                            (blank)
//   ︶                       (CSS .customLine2 centers it)
//
// Glyphs (from utils.js source):
//   ⁐ U+2050 REVERSED TILDE      (charCloseup, NOT ⌒ U+2312 — common misread)
//   ︵ U+FE35  / ︶ U+FE36        (charFrown / charSmile)
//   ` ` (backtick × 2)           (charDoubleQuotesLeft, NOT ¨)
//   ´ ´ (acute × 2)              (charDoubleQuotesRight, NOT ¨)
//   ө U+04E9 (eyes), λ U+03BB    (lambda — middle leg)
//   \xa0 NBSP everywhere         (NOT regular space — preserves alignment)
//
// SheepDog = pack of sheep + a watchdog. The mirrored PAIR fits this metaphor
// (a flock); single-sheep variants below cover narrower contexts.

async function main() {
  // Load font candidates with fallback chain — monospace preferred but Inter
  // is the only universally guaranteed face in Figma. Try several monos first.
  async function tryLoad(family, style) {
    try { await figma.loadFontAsync({ family, style }); return { family, style }; }
    catch (e) { return null; }
  }
  async function loadFirstAvailable(candidates) {
    for (const c of candidates) {
      const f = await tryLoad(c.family, c.style);
      if (f) return f;
    }
    throw new Error("No fonts loaded — check Figma font availability");
  }

  // Always need Inter (UI labels). Mono font = primary glyph face.
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  const MONO_REGULAR = await loadFirstAvailable([
    { family: "JetBrains Mono", style: "Regular" },
    { family: "Roboto Mono",    style: "Regular" },
    { family: "IBM Plex Mono",  style: "Regular" },
    { family: "Source Code Pro",style: "Regular" },
    { family: "Menlo",          style: "Regular" },
    { family: "Consolas",       style: "Regular" },
    { family: "Courier New",    style: "Regular" },
    { family: "Inter",          style: "Regular" },  // last resort, proportional
  ]);
  const MONO_BOLD = await loadFirstAvailable([
    { family: MONO_REGULAR.family, style: "Bold" },
    { family: MONO_REGULAR.family, style: "Medium" },
    { family: MONO_REGULAR.family, style: "Regular" },
  ]);

  const DOC_W = 1200;
  const PAD = 40;
  const CARD_W = DOC_W - 2 * PAD;

  const C = {
    canvas:     { r: 0.08,  g: 0.08,  b: 0.09  },
    panel:      { r: 0.145, g: 0.145, b: 0.157 },
    panelLight: { r: 0.95,  g: 0.95,  b: 0.96  },
    border:     { r: 0.30,  g: 0.30,  b: 0.32  },
    text:       { r: 0.93,  g: 0.93,  b: 0.95  },
    textDim:    { r: 0.60,  g: 0.60,  b: 0.63  },
    ink:        { r: 0.10,  g: 0.10,  b: 0.13  },
    accent:     { r: 0.078, g: 0.471, b: 0.949 },
  };
  const F = {
    r: { family: "Inter", style: "Regular"   },
    m: { family: "Inter", style: "Medium"    },
    s: { family: "Inter", style: "Semi Bold" },
    b: { family: "Inter", style: "Bold"      },
  };

  // ---------- AL helpers ----------
  function vSec(w) {
    const f = figma.createFrame();
    f.fills = []; f.resize(w, 10);
    f.layoutMode = "VERTICAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "HUG";
    return f;
  }
  function hSec(w) {
    const f = figma.createFrame();
    f.fills = []; f.resize(w, 10);
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "HUG";
    return f;
  }
  function hHug() {
    const f = figma.createFrame();
    f.fills = []; f.resize(40, 20);
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "HUG";
    f.layoutSizingVertical = "HUG";
    return f;
  }
  function vHug() {
    const f = figma.createFrame();
    f.fills = []; f.resize(20, 40);
    f.layoutMode = "VERTICAL";
    f.layoutSizingHorizontal = "HUG";
    f.layoutSizingVertical = "HUG";
    return f;
  }
  function txt(chars, font, size, color, lh) {
    const t = figma.createText();
    t.fontName = font; t.characters = chars; t.fontSize = size;
    t.fills = [{ type: "SOLID", color }];
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    if (lh) t.lineHeight = { value: lh, unit: "PIXELS" };
    return t;
  }
  function txtW(chars, font, size, color, w, lh) {
    const t = figma.createText();
    t.fontName = font; t.characters = chars; t.fontSize = size;
    t.fills = [{ type: "SOLID", color }];
    t.resize(w, 10); t.textAutoResize = "HEIGHT";
    if (lh) t.lineHeight = { value: lh, unit: "PIXELS" };
    return t;
  }
  function divider(w, color, opacity) {
    const r = figma.createRectangle();
    r.resize(w, 1);
    r.fills = [{ type: "SOLID", color, opacity: opacity != null ? opacity : 1 }];
    return r;
  }
  function setFill(node, color, opacity) {
    node.fills = [{ type: "SOLID", color, opacity: opacity != null ? opacity : 1 }];
  }
  function setStroke(node, color, opacity, weight) {
    node.strokes = [{ type: "SOLID", color, opacity: opacity != null ? opacity : 1 }];
    node.strokeWeight = weight != null ? weight : 1;
  }

  // ---------- ASCII rendering ----------
  // Text node with multi-line, monospace, lineHeight-locked to glyph height.
  function asciiGlyph(text, fontSize, color, weight) {
    const font = (weight === "bold") ? MONO_BOLD : MONO_REGULAR;
    const t = figma.createText();
    t.fontName = font;
    t.characters = text;
    t.fontSize = fontSize;
    t.fills = [{ type: "SOLID", color }];
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    // Lock lineHeight close to fontSize for tighter vertical spacing
    // (default leading ~1.4 leaves too much air between rows of art).
    t.lineHeight = { value: Math.round(fontSize * 1.05), unit: "PIXELS" };
    return t;
  }

  // labeledGlyph — glyph wrapped in bg swatch (Premiere panel sim or marketing white)
  function labeledGlyph(text, fontSize, label, bgColor, fgColor, weight) {
    const v = vHug();
    v.itemSpacing = 6;
    v.counterAxisAlignItems = "CENTER";

    const pad = fontSize >= 32 ? 24 : (fontSize >= 18 ? 16 : 10);
    const bg = figma.createFrame();
    bg.layoutMode = "HORIZONTAL";
    bg.layoutSizingHorizontal = "HUG";
    bg.layoutSizingVertical = "HUG";
    bg.primaryAxisAlignItems = "CENTER";
    bg.counterAxisAlignItems = "CENTER";
    bg.paddingTop = pad; bg.paddingBottom = pad;
    bg.paddingLeft = pad * 1.4; bg.paddingRight = pad * 1.4;
    bg.cornerRadius = fontSize >= 32 ? 12 : 6;
    bg.fills = [{ type: "SOLID", color: bgColor, opacity: 1 }];
    bg.appendChild(asciiGlyph(text, fontSize, fgColor, weight));
    v.appendChild(bg);

    const labelDim = (bgColor === C.panelLight) ? { r: 0.4, g: 0.4, b: 0.43 } : C.textDim;
    v.appendChild(txt(label, F.r, 10, labelDim));
    return v;
  }

  // showcaseRow — same glyph at 4 sizes on dark + 1 on light
  function showcaseRow(text, weight) {
    const wrap = hHug();
    wrap.itemSpacing = 20;
    wrap.counterAxisAlignItems = "MAX";
    wrap.appendChild(labeledGlyph(text, 12, "12pt panel", C.panel,      C.text, weight));
    wrap.appendChild(labeledGlyph(text, 18, "18pt",       C.panel,      C.text, weight));
    wrap.appendChild(labeledGlyph(text, 32, "32pt",       C.panel,      C.text, weight));
    wrap.appendChild(labeledGlyph(text, 64, "64pt show",  C.panel,      C.text, weight));
    wrap.appendChild(labeledGlyph(text, 64, "64pt light", C.panelLight, C.ink,  weight));
    return wrap;
  }

  // Card wrapping a single ASCII variant
  function variantCard(title, subtitle, text, weight) {
    const card = vSec(CARD_W);
    card.cornerRadius = 12;
    setFill(card, C.panel, 1);
    setStroke(card, C.border, 0.5, 1);
    card.paddingTop = 24; card.paddingBottom = 24;
    card.paddingLeft = 28; card.paddingRight = 28;
    card.itemSpacing = 16;

    card.appendChild(txt(title, F.b, 18, C.text, 24));
    if (subtitle) card.appendChild(txtW(subtitle, F.r, 12, C.textDim, CARD_W - 56, 18));
    card.appendChild(showcaseRow(text, weight));
    return card;
  }

  // ---------- ASCII variants ----------
  // NBSP shorthand — source uses \xa0 everywhere, not regular space.
  const NB = " ";

  // Canonical PAIR — exact char-for-char match with 8-bit-sheep.com utils.js
  // Row 1: charFrownCustom × 2 = (NB ︵ NB)(NB ︵ NB) → NB ︵ NB NB ︵ NB
  // Row 2: line 59 of source verbatim
  // Row 3: line 68 of source verbatim (\ NB | NB NB NB NB | NB /)
  // Row 4: λ (line 77 — CSS centers it; we add visual indent)
  // Row 5: blank
  // Row 6: ︶ (line 79 — CSS centers it; we add visual indent)
  const PAIR =
    NB + "︵" + NB + NB + "︵" + NB + "\n" +
    "⁐(ө``" + NB + "|" + NB + "´´ө)⁐" + "\n" +
    "\\" + NB + "|" + NB + NB + NB + NB + "|" + NB + "/" + "\n" +
    NB + NB + NB + NB + NB + "λ" + "\n" +
    "\n" +
    NB + NB + NB + NB + NB + "︶";

  // Single sheep — left half only (eye + brow + bracket + body curl)
  const SINGLE_LEFT =
    NB + "︵" + "\n" +
    "⁐(ө``" + "\n" +
    "\\" + NB + "|" + "\n" +
    NB + NB + "λ";

  // Single sheep — right half (mirror reading direction)
  const SINGLE_RIGHT =
    NB + NB + NB + NB + "︵" + "\n" +
    NB + "´´ө)⁐" + "\n" +
    NB + NB + NB + "|" + NB + "/";

  // Compact one-liner — face only (no legs), ultra-minimal mark for tiny sizes
  const ONELINER = "⁐(ө``" + NB + "´´ө)⁐";

  // ---------- Build root ----------
  const root = figma.createFrame();
  root.name = "SheepDog — ASCII glyph logo v1";
  root.resize(DOC_W, 10);
  root.layoutMode = "VERTICAL";
  root.layoutSizingHorizontal = "FIXED";
  root.layoutSizingVertical = "HUG";
  setFill(root, C.canvas, 1);
  root.paddingTop = PAD; root.paddingBottom = PAD;
  root.paddingLeft = PAD; root.paddingRight = PAD;
  root.itemSpacing = 32;

  // Title
  const titleSec = vSec(CARD_W);
  titleSec.itemSpacing = 8;
  titleSec.appendChild(txt("SheepDog — ASCII glyph logo", F.b, 32, C.text, 40));
  titleSec.appendChild(txtW(
    "Typographic text-mark, reference: 8-bit-sheep.com (verified against /js/utils.js). Glyphs: " +
    "⁐ (reversed tilde U+2050) body curls, ︵ ︶ (CJK U+FE35/FE36) ears+back, " +
    "` ` and ´ ´ (backticks + acutes) brow marks, ө (cyrillic O-bar U+04E9) eyes, " +
    "λ (greek lambda U+03BB) middle leg. NBSP (U+00A0) used throughout per source — " +
    "not regular space. Best in monospace; falls back to Inter. Active: " + MONO_REGULAR.family + ".",
    F.r, 13, C.textDim, CARD_W, 19
  ));
  titleSec.appendChild(divider(CARD_W, C.text, 0.08));
  root.appendChild(titleSec);

  // Variants
  root.appendChild(variantCard(
    "1 · Pair (mirrored) — original",
    "Two sheep facing each other. Reads as a flock — fits SheepDog (pack watched by one shepherd).",
    PAIR, "regular"
  ));

  root.appendChild(variantCard(
    "1b · Pair — bold weight",
    "Same composition rendered with bold mono. Heavier strokes carry better at small sizes.",
    PAIR, "bold"
  ));

  root.appendChild(variantCard(
    "2 · Single sheep — left-facing",
    "Just the left half. Compact, one-character-wide stem. Use for app icon / favicon style mark.",
    SINGLE_LEFT, "regular"
  ));

  root.appendChild(variantCard(
    "3 · Single sheep — right-facing",
    "Mirror of variant 2. Useful when logo sits on the right side of a wordmark or paired with text.",
    SINGLE_RIGHT, "regular"
  ));

  root.appendChild(variantCard(
    "4 · One-liner — ultra-minimal",
    "Face only, no body or legs. Smallest readable form — works at 10pt in monospace contexts (status bars, README badges).",
    ONELINER, "regular"
  ));

  // Footer
  const footer = vSec(CARD_W);
  footer.cornerRadius = 8;
  setFill(footer, C.panel, 0.6);
  setStroke(footer, C.border, 0.4, 1);
  footer.paddingTop = 16; footer.paddingBottom = 16;
  footer.paddingLeft = 20; footer.paddingRight = 20;
  footer.itemSpacing = 8;
  footer.appendChild(txt("Notes", F.s, 12, C.text));
  function noteLine(text) {
    const line = hSec(CARD_W - 40);
    line.itemSpacing = 8;
    line.counterAxisAlignItems = "MIN";
    line.appendChild(txt("•", F.b, 11, C.accent));
    line.appendChild(txtW(text, F.r, 11, C.textDim, CARD_W - 60, 16));
    return line;
  }
  footer.appendChild(noteLine("Monospace gives consistent character widths so the symmetrical mirror reads cleanly. In proportional fonts (Inter) the spacing breaks and `︵  ︵` won't align with `⁐(ө…)⁐`."));
  footer.appendChild(noteLine("Source verified — utils.js charset is ⁐ + backticks/acutes + ︵︶ + ө + λ + NBSP, NOT ⌒ + diaereses + regular space. Don't trust low-res screenshots; ⁐ reads as ⌒ at iPhone resolution."));
  footer.appendChild(noteLine("︵ ︶ are CJK Compatibility Forms (East Asian Wide) — in some monospace fonts they render double-width and break alignment. Test in active font; if broken, swap to ‿ (U+203F) or ⌣ (U+2323) as fallback."));
  footer.appendChild(noteLine("If exporting to Premiere CEP icon: this is text → render to PNG/SVG via Figma export. Anti-aliasing ON (it's typography, not pixel art)."));
  footer.appendChild(noteLine("Site uses CSS classes (.lambda, .customLine2) to center λ and ︶ horizontally. Here we fake it with NBSP indents — adjust per actual font metrics in Scripter."));
  footer.appendChild(noteLine("Brand decor on site: orange ∞ below ︶. Skipped here — it's 8-bit-sheep brand element, not part of the sheep glyph itself."));
  root.appendChild(footer);

  root.x = 100;
  root.y = 100;
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("ASCII glyph logo v1 — using " + MONO_REGULAR.family);
}

main();
