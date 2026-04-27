// ─────────────────────────────────────────────────────────────────────────────
// SheepDog — State taxonomy + Safety Cover overlay (checkbox + eye parallels)
//
// Two tables in one doc:
//   1. Checkbox taxonomy — DEL / SUB column glyphs.
//   2. Eye taxonomy     — Eye column glyphs.
// Both share the same base classes — Normal / Inherited / Locked / Disabled
// + compound rows (Disabled+Inherited, Disabled+Locked) — but differ in
// cascade symmetry (see below).
//
// CASCADE SYMMETRY — the defining difference between the two tables:
//
//   Checkbox (SUB) — SYMMETRIC. SUB=OFF on ancestor locks all descendants
//                    (both DEL and SUB columns become Locked regardless of
//                    their stored value). SUB=ON on ancestor lets descendants
//                    Inherit (overridable). So Inherited has both ON and OFF,
//                    and Locked has both ON and OFF.
//
//   Eye             — ASYMMETRIC. Open eye (ON) on ancestor cascades as HARD
//                    LOCK — descendants are forced open, no Inherited ON
//                    possible. Closed eye (OFF) on ancestor cascades as SOFT
//                    INHERIT — descendants echo closed but may individually
//                    override to open. Consequence:
//                      • Inherited has only OFF (no "inherited open" — open
//                        from ancestor always shows as Locked).
//                      • Locked has only ON  (no "locked closed" — closed
//                        doesn't cascade as lock).
//                    Compounds follow the same rule:
//                      • Disabled + Inherited has only OFF.
//                      • Disabled + Locked    has only ON.
//                    N/A cells in the eye table render as a faded em-dash.
//
// COLOR RULE — grey is pure neutral. Only "Normal ON" and "Inherited ON"
// may carry accent. Every OFF + every grey-tier cell is colorless. Visual
// signal in OFF comes from stroke weight, backing, and wrapper chrome.
//
// Glyph-family differences:
//   Checkbox — class signal lives in the 14×14 square itself (fill / stroke /
//              dashPattern / backing on the box). No wrapper.
//   Eye      — NO container chrome, ever. Class signal lives inside the
//              glyph itself via three mechanisms:
//                (1) outline colour on every stroke,
//                (2) optional fill «подложка» on the body path only
//                    (Locked ON / Disabled+Locked ON),
//                (3) optional dashPattern on the body path only
//                    (all four Disabled tiers).
//              Body = outer almond on the open eye (child[0]), or the eyelid
//              arc on the closed eye (child[1]). Pupil and lashes stay solid
//              so the silhouette still reads as an eye — the dashed body
//              alone carries the «Disabled» signal. A 20×20 invisible frame
//              around the 14×14 glyph serves only as an alignment footprint
//              matching the checkbox column. No dashed wrappers, no painted
//              boxes around the glyph.
//
// SAFETY COVER COUNTDOWN — orthogonal overlay, NOT a state class. Applies
// wherever the cell accepts clicks:
//   Checkbox — Normal, Inherited, Disabled, Disabled+Inherited (4 of 6 classes).
//              Excluded from Locked and Disabled+Locked (source owns value).
//   Eye     — same rule on the tiers that EXIST (because of the asymmetry):
//              Normal (both), Inherited OFF, Disabled (both), Disabled+
//              Inherited OFF. Excluded from Locked ON, Disabled+Locked ON.
//
// Disabled accepts clicks and mutates stored state even though the change
// has no real-world effect until the row re-enables — so the cover is still
// relevant, and doubly so as a reminder that the user is touching something
// while the row is dead. First click arms, drains over ~3s, second click
// commits; timeout re-locks. Red fires only during the countdown —
// activation signal, not column color.
//
// Reference image: docs/Archictecture & Development/DesignDocs/Tabel.png
// Winner ports into figma-sheepdog-panel-v1.2.js.
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  // ---------- Fonts ----------
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // ---------- Colors ----------
  // Palette mirrors Tabel.jsx exactly — solid hex values the user picked,
  // not algorithmic flat() mixes. This matters because Locked OFF (for
  // example) needs the same visible grey as Locked ON, not a 18 % crack.
  const C = {
    canvas:       { r: 0.078, g: 0.078, b: 0.090 }, // #141417
    panel:        { r: 0.145, g: 0.145, b: 0.157 }, // #252528  card bg
    border:       { r: 0.302, g: 0.302, b: 0.322 }, // #4D4D52  card border / divider solid
    textLite:     { r: 0.870, g: 0.870, b: 0.878 }, // #DEDEE0  primary text
    textDim:      { r: 0.600, g: 0.600, b: 0.631 }, // #9999A1  secondary text / headers
    textGhost:    { r: 0.420, g: 0.420, b: 0.451 }, // #6B6B73  N/A labels
    borderBright: { r: 0.843, g: 0.843, b: 0.855 }, // #D7D7DA  Normal OFF stroke
    strokeMid:    { r: 0.486, g: 0.486, b: 0.514 }, // #7C7C83  Inherited OFF / Locked / Disabled stroke
    backMid:      { r: 0.294, g: 0.294, b: 0.306 }, // #4B4B4E  Locked fill / Disabled-Inherited stroke
    backDim:      { r: 0.196, g: 0.196, b: 0.206 }, // #323234  Disabled-Locked fill
    accent:       { r: 0.078, g: 0.471, b: 0.949 }, // #1478F2  Normal ON
    accentFill:   { r: 0.122, g: 0.259, b: 0.431 }, // #1F426E  Inherited ON fill
    accentEdge:   { r: 0.118, g: 0.290, b: 0.514 }, // #1E4A83  Inherited ON stroke
    lockedCheck:  { r: 0.686, g: 0.686, b: 0.694 }, // #AFAFB1  check glyph on Locked ON
    danger:       { r: 0.961, g: 0.322, b: 0.380 }, // #F55261  Safety Cover red
    white:        { r: 1, g: 1, b: 1 },
  };
  const F = {
    r: { family: "Inter", style: "Regular" },
    m: { family: "Inter", style: "Medium" },
    s: { family: "Inter", style: "Semi Bold" },
    b: { family: "Inter", style: "Bold" },
  };

  // ---------- SVG icon constants ----------
  const SVG = {
    eye: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeClosed: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-closed-icon lucide-eye-closed"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>',
  };

  // recolor(node, color) — recursive SOLID fill/stroke replacer. Skips FRAME/
  // GROUP containers (their fills are layout chrome, not icon strokes).
  function recolor(node, color) {
    const isContainer = node.type === "FRAME" || node.type === "GROUP";
    if (!isContainer) {
      if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
        node.fills = node.fills.map(function(p) {
          if (p.type === "SOLID") return { type: "SOLID", color: color, opacity: p.opacity != null ? p.opacity : 1 };
          return p;
        });
      }
      if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
        node.strokes = node.strokes.map(function(p) {
          if (p.type === "SOLID") return { type: "SOLID", color: color, opacity: p.opacity != null ? p.opacity : 1 };
          return p;
        });
      }
    }
    if ("children" in node && Array.isArray(node.children)) {
      for (var i = 0; i < node.children.length; i++) recolor(node.children[i], color);
    }
  }

  // Lucide canonical strokeWeight is 2 at viewBox 24. When we shrink the svg
  // we must also shrink strokeWeight proportionally, otherwise strokes look
  // disproportionately thick at small sizes.
  function rescaleStrokes(node, factor) {
    if ("strokeWeight" in node && typeof node.strokeWeight === "number") {
      node.strokeWeight = node.strokeWeight * factor;
    }
    if ("children" in node && Array.isArray(node.children)) {
      for (var i = 0; i < node.children.length; i++) rescaleStrokes(node.children[i], factor);
    }
  }

  function loadIcon(key, color, size) {
    size = size || 14;
    const f = figma.createNodeFromSvg(SVG[key]);
    f.fills = [];
    f.resize(size, size);
    rescaleStrokes(f, size / 24);
    recolor(f, color);
    return f;
  }

  // ---------- Helpers ----------
  function setFill(n, c, o) { n.fills = [{ type: "SOLID", color: c, opacity: o != null ? o : 1 }]; }
  function setStroke(n, c, o, w) {
    n.strokes = [{ type: "SOLID", color: c, opacity: o != null ? o : 1 }];
    n.strokeWeight = w != null ? w : 1;
  }
  function vSec(w) {
    const f = figma.createFrame();
    f.fills = []; f.resize(w, 10);
    f.layoutMode = "VERTICAL"; f.layoutSizingHorizontal = "FIXED"; f.layoutSizingVertical = "HUG";
    return f;
  }
  function hSec(w) {
    const f = figma.createFrame();
    f.fills = []; f.resize(w, 10);
    f.layoutMode = "HORIZONTAL"; f.layoutSizingHorizontal = "FIXED"; f.layoutSizingVertical = "HUG";
    return f;
  }
  function hHug() {
    const f = figma.createFrame();
    f.fills = []; f.resize(40, 20);
    f.layoutMode = "HORIZONTAL"; f.layoutSizingHorizontal = "HUG"; f.layoutSizingVertical = "HUG";
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
  function spacer(w, h) {
    const f = figma.createFrame(); f.resize(w, h); f.fills = []; return f;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // chk(cls, value) — 4-tier "presence" gradient.
  //
  //   Normal             — full accent on ON, bright neutral stroke on OFF.
  //   Inherited          — dim accent fill + darker edge on ON, strokeMid
  //                        stroke on OFF.
  //   Locked             — backMid grey fill on BOTH ON and OFF (real
  //                        «крышечка», not a 18% hint); strokeMid border;
  //                        light lockedCheck glyph on ON only.
  //   Disabled           — empty fill, dashed strokeMid border, strokeMid
  //                        check glyph on ON.
  //   Disabled+Inherited — empty fill, dashed backMid border, backMid ghost
  //                        check (pure grey, NOT accent-tinted).
  //   Disabled+Locked    — backDim near-black fill, dashed backMid border,
  //                        backMid ghost check on ON.
  //
  // Colours come straight from Tabel.jsx — solid hex values, no algorithmic
  // flat() mixing. Locked OFF keeps the SAME visible backMid fill as Locked
  // ON, distinguishing it from Inherited OFF (empty) and Disabled OFF
  // (dashed, empty). Only Normal ON and Inherited ON carry accent hue.
  // ─────────────────────────────────────────────────────────────────────────
  function chk(cls, value) {
    const f = figma.createFrame();
    f.resize(14, 14);
    f.cornerRadius = 3;

    function center() {
      f.layoutMode = "HORIZONTAL";
      f.layoutSizingHorizontal = "FIXED";
      f.layoutSizingVertical = "FIXED";
      f.primaryAxisAlignItems = "CENTER";
      f.counterAxisAlignItems = "CENTER";
    }

    if (cls === "overridden" && value === "on") {
      setFill(f, C.accent, 1); setStroke(f, C.accent, 1, 1);
      center(); f.appendChild(txt("✓", F.b, 10, C.white));
    } else if (cls === "overridden" && value === "off") {
      f.fills = []; setStroke(f, C.borderBright, 1, 1);
    } else if (cls === "inherited" && value === "on") {
      setFill(f, C.accentFill, 1); setStroke(f, C.accentEdge, 1, 1);
      center(); f.appendChild(txt("✓", F.m, 9, C.white));
    } else if (cls === "inherited" && value === "off") {
      f.fills = []; setStroke(f, C.strokeMid, 1, 1);
    } else if (cls === "locked" && value === "on") {
      setFill(f, C.backMid, 1); setStroke(f, C.strokeMid, 1, 1);
      center(); f.appendChild(txt("✓", F.m, 9, C.lockedCheck));
    } else if (cls === "locked" && value === "off") {
      setFill(f, C.backMid, 1); setStroke(f, C.strokeMid, 1, 1);
    } else if (cls === "disabled" && value === "on") {
      f.fills = []; setStroke(f, C.strokeMid, 1, 1);
      f.dashPattern = [2, 2];
      center(); f.appendChild(txt("✓", F.m, 9, C.strokeMid));
    } else if (cls === "disabled" && value === "off") {
      f.fills = []; setStroke(f, C.strokeMid, 1, 1);
      f.dashPattern = [2, 2];
    } else if (cls === "disabled-inherited" && value === "on") {
      f.fills = []; setStroke(f, C.backMid, 1, 1);
      f.dashPattern = [2, 2];
      center(); f.appendChild(txt("✓", F.m, 9, C.backMid));
    } else if (cls === "disabled-inherited" && value === "off") {
      f.fills = []; setStroke(f, C.backMid, 1, 1);
      f.dashPattern = [2, 2];
    } else if (cls === "disabled-locked" && value === "on") {
      setFill(f, C.backDim, 1); setStroke(f, C.backMid, 1, 1);
      f.dashPattern = [2, 2];
      center(); f.appendChild(txt("✓", F.m, 9, C.backMid));
    } else if (cls === "disabled-locked" && value === "off") {
      setFill(f, C.backDim, 1); setStroke(f, C.backMid, 1, 1);
      f.dashPattern = [2, 2];
    }

    return f;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // eye(cls, value) — NO container chrome. Class signal lives in the eye
  // glyph's own stroke colour, plus an optional fill «подложка» painted
  // inside the eye's outer body path (Locked ON, Disabled+Locked ON).
  //
  //   Normal              ON  — eye-open, accent stroke
  //   Normal              OFF — eye-closed, borderBright stroke
  //   Inherited           OFF — eye-closed, strokeMid stroke  (ON is N/A)
  //   Locked              ON  — eye-open, strokeMid stroke + backMid body
  //                             fill (the «крышечка»)        (OFF is N/A)
  //   Disabled            ON  — eye-open, strokeMid stroke
  //   Disabled            OFF — eye-closed, strokeMid stroke
  //   Disabled+Inherited  OFF — eye-closed, backMid stroke    (ON is N/A)
  //   Disabled+Locked     ON  — eye-open, backMid stroke + backDim body
  //                             fill (darker Locked echo)    (OFF is N/A)
  //
  // The 20×20 frame around the 14×14 glyph is an invisible alignment
  // footprint — never painted, never dashed. Tabel.jsx confirms: the eye
  // family never wears a container box. All visual separation comes from
  // outline colour tier + optional body fill backing.
  // ─────────────────────────────────────────────────────────────────────────
  function eye(cls, value) {
    const wrap = figma.createFrame();
    wrap.resize(20, 20);
    wrap.layoutMode = "HORIZONTAL";
    wrap.layoutSizingHorizontal = "FIXED"; wrap.layoutSizingVertical = "FIXED";
    wrap.primaryAxisAlignItems = "CENTER"; wrap.counterAxisAlignItems = "CENTER";
    wrap.fills = [];

    const gs = 14;
    let glyph, color, backing = null, dashed = false;
    if (cls === "overridden" && value === "on") {
      glyph = "eye"; color = C.accent;
    } else if (cls === "overridden" && value === "off") {
      glyph = "eyeClosed"; color = C.borderBright;
    } else if (cls === "inherited" && value === "off") {
      glyph = "eyeClosed"; color = C.strokeMid;
    } else if (cls === "locked" && value === "on") {
      glyph = "eye"; color = C.strokeMid; backing = C.backMid;
    } else if (cls === "disabled" && value === "on") {
      glyph = "eye"; color = C.strokeMid; dashed = true;
    } else if (cls === "disabled" && value === "off") {
      glyph = "eyeClosed"; color = C.strokeMid; dashed = true;
    } else if (cls === "disabled-inherited" && value === "off") {
      glyph = "eyeClosed"; color = C.backMid; dashed = true;
    } else if (cls === "disabled-locked" && value === "on") {
      glyph = "eye"; color = C.backMid; backing = C.backDim; dashed = true;
    }

    const g = loadIcon(glyph, color, gs);
    if (backing) applyBodyBacking(g, glyph, backing);
    if (dashed)  applyBodyDash(g, glyph);
    wrap.appendChild(g);
    return wrap;
  }

  // Return the child index that represents the eye/eyelid body for a given
  // glyph key — the path the user wants stylised (dashed, backed), while
  // pupil + lashes stay untouched.
  //   eye       — child[0] is the outer almond body, child[1] is the pupil
  //   eyeClosed — child[1] is the big eyelid arc, the other 4 children are
  //               lashes (individual short strokes)
  function bodyChildIndex(glyph) {
    return glyph === "eyeClosed" ? 1 : 0;
  }

  // Paint the body path of the lucide eye/eyeClosed SVG with a solid fill —
  // «подложка» under the eye body. Pupil / lashes stay stroke-only.
  function applyBodyBacking(node, glyph, color) {
    if (!("children" in node) || !Array.isArray(node.children)) return;
    const idx = bodyChildIndex(glyph);
    const body = node.children[idx];
    if (body && "fills" in body) {
      body.fills = [{ type: "SOLID", color: color, opacity: 1 }];
    }
  }

  // Dash only the body stroke (outer almond for open eye, eyelid arc for
  // closed eye). Pupil and lashes remain solid so the glyph still reads as
  // an eye — the dashed silhouette just says «this tier is Disabled».
  function applyBodyDash(node, glyph) {
    if (!("children" in node) || !Array.isArray(node.children)) return;
    const idx = bodyChildIndex(glyph);
    const body = node.children[idx];
    if (body && "dashPattern" in body) {
      body.dashPattern = [1.5, 1.5];
    }
  }

  // N/A marker for cells where a (class, value) pair doesn't exist. Used in
  // the eye table for Inherited ON, Locked OFF, Disabled+Inherited ON, and
  // Disabled+Locked OFF — combinations forbidden by the asymmetric cascade.
  // Faded em-dash, not empty space, so the forbidden cells read as an
  // intentional gap rather than a rendering bug.
  function naCell() {
    return txt("—", F.r, 12, C.textGhost);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SAFETY COVER COUNTDOWN — orthogonal overlay, not a state class.
  //
  // First click arms the cover: a single red stroke traces the checkbox
  // perimeter and RETREATS COUNTER-CLOCKWISE as time drains (~3s). Second
  // click within the window commits. Timeout re-locks.
  //
  // The visual model is a TRIMMED PATH LINE, not dashPattern. One continuous
  // segment whose end point walks CCW, shortening as progress goes 1 → 0.
  // At progress=1 the segment is the full perimeter; at progress=0 it's gone.
  //
  // Implementation ported from figma-sheepdog-panel-v1.2.js §3 card 2
  // (borderCountdown). Two nodes: base FRAME with full gray perimeter stroke
  // + Vector overlay with a partial polyline along the perimeter, then
  // horizontally flipped via relativeTransform to invert the CCW sampling
  // into CCW retreat in screen space (end point recedes CCW as time runs out).
  //
  // NB: Sampled polyline + horizontal-flip transform is a FIGMA-SPECIFIC
  // WORKAROUND. Figma's VectorNode has no native trim-path / stroke-dashoffset,
  // so we approximate by truncating the point list and flipping axes. In the
  // real CEP/React implementation this will be one line: a <path> with
  // stroke-dasharray set to perimeter length and stroke-dashoffset animated
  // from 0 → perimeter (CSS). No sampling, no flip — one declarative prop.
  // Keep the Figma mockup honest to the visual model; don't port this trick
  // to production code.
  // ─────────────────────────────────────────────────────────────────────────

  // Sample rounded-rect perimeter into polyline points. Starts top-center,
  // walks CCW (left first). Returns array of [x, y].
  function roundedRectPerimeter(w, h, r, steps) {
    const L1 = w / 2 - r;
    const L2 = Math.PI * r / 2;
    const L3 = h - 2 * r;
    const L4 = Math.PI * r / 2;
    const L5 = w - 2 * r;
    const L6 = Math.PI * r / 2;
    const L7 = h - 2 * r;
    const L8 = Math.PI * r / 2;
    const L9 = w / 2 - r;
    const total = L1 + L2 + L3 + L4 + L5 + L6 + L7 + L8 + L9;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const s = (i / steps) * total;
      let x, y;
      if (s <= L1) {
        x = w / 2 - s; y = 0;
      } else if (s <= L1 + L2) {
        const phi = -Math.PI / 2 - (s - L1) / r;
        x = r + r * Math.cos(phi);
        y = r + r * Math.sin(phi);
      } else if (s <= L1 + L2 + L3) {
        x = 0; y = r + (s - L1 - L2);
      } else if (s <= L1 + L2 + L3 + L4) {
        const phi = Math.PI - (s - L1 - L2 - L3) / r;
        x = r + r * Math.cos(phi);
        y = (h - r) + r * Math.sin(phi);
      } else if (s <= L1 + L2 + L3 + L4 + L5) {
        x = r + (s - L1 - L2 - L3 - L4); y = h;
      } else if (s <= L1 + L2 + L3 + L4 + L5 + L6) {
        const phi = Math.PI / 2 - (s - L1 - L2 - L3 - L4 - L5) / r;
        x = (w - r) + r * Math.cos(phi);
        y = (h - r) + r * Math.sin(phi);
      } else if (s <= L1 + L2 + L3 + L4 + L5 + L6 + L7) {
        x = w; y = (h - r) - (s - L1 - L2 - L3 - L4 - L5 - L6);
      } else if (s <= L1 + L2 + L3 + L4 + L5 + L6 + L7 + L8) {
        const phi = 0 - (s - L1 - L2 - L3 - L4 - L5 - L6 - L7) / r;
        x = (w - r) + r * Math.cos(phi);
        y = r + r * Math.sin(phi);
      } else {
        x = (w - r) - (s - L1 - L2 - L3 - L4 - L5 - L6 - L7 - L8); y = 0;
      }
      pts.push([x, y]);
    }
    return pts;
  }

  function perimeterPathCCW(w, h, r, progress01) {
    const steps = 240;
    const n = Math.max(1, Math.floor(steps * progress01));
    const pts = roundedRectPerimeter(w, h, r, steps);
    let d = "M " + pts[0][0].toFixed(3) + " " + pts[0][1].toFixed(3);
    for (let i = 1; i <= n; i++) {
      d += " L " + pts[i][0].toFixed(3) + " " + pts[i][1].toFixed(3);
    }
    return d;
  }

  // Trim-path countdown. progress01 = 1 → full red perimeter; progress01 = 0
  // → empty (about to re-lock). Base gray stroke stays; red overlay shrinks.
  function covCountdown(progress01) {
    const size = 12, r = 3, sw = 1.25;
    const wrap = figma.createFrame();
    wrap.resize(size, size);
    wrap.fills = [];

    const base = figma.createFrame();
    base.resize(size, size);
    base.cornerRadius = r;
    base.fills = [];
    setStroke(base, C.border, 1, sw);
    base.x = 0; base.y = 0;
    wrap.appendChild(base);

    const inset = 1;
    const inner = size - 2 * inset;
    const overlay = figma.createVector();
    overlay.resize(inner, inner);
    overlay.vectorPaths = [{
      windingRule: "NONE",
      data: perimeterPathCCW(inner, inner, Math.max(1, r - inset), progress01),
    }];
    overlay.strokes = [{ type: "SOLID", color: C.danger }];
    overlay.strokeWeight = sw;
    overlay.strokeCap = "ROUND";
    overlay.strokeJoin = "ROUND";
    overlay.fills = [];
    wrap.appendChild(overlay);
    // Horizontal flip → CCW walk in sampled points becomes CCW retreat in
    // screen space: end point of the trimmed segment recedes CCW over time.
    overlay.relativeTransform = [[-1, 0, inset + inner], [0, 1, inset]];

    return wrap;
  }

  function coverStripCell() {
    const strip = hHug();
    strip.itemSpacing = 4;
    strip.counterAxisAlignItems = "CENTER";
    strip.primaryAxisAlignItems = "CENTER";
    strip.appendChild(covCountdown(0.95));
    strip.appendChild(covCountdown(0.50));
    strip.appendChild(covCountdown(0.15));
    return strip;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Row / Table builders
  // ─────────────────────────────────────────────────────────────────────────
  const W_CELL_COL = 48;
  const W_NAME = 180;
  const W_DESC = 260;
  const COL_W = W_CELL_COL * 2 + W_NAME + W_DESC + 16 /* gaps */;

  function headerRow() {
    const row = hSec(COL_W);
    row.itemSpacing = 16;
    row.paddingTop = 6; row.paddingBottom = 6;
    row.counterAxisAlignItems = "CENTER";

    const onCell = hSec(W_CELL_COL); onCell.primaryAxisAlignItems = "CENTER";
    onCell.appendChild(txt("ON", F.s, 10, C.textDim));
    row.appendChild(onCell);

    const offCell = hSec(W_CELL_COL); offCell.primaryAxisAlignItems = "CENTER";
    offCell.appendChild(txt("OFF", F.s, 10, C.textDim));
    row.appendChild(offCell);

    const nameCell = hSec(W_NAME);
    nameCell.appendChild(txt("CLASS", F.s, 10, C.textDim));
    row.appendChild(nameCell);

    const descCell = hSec(W_DESC);
    descCell.appendChild(txt("MEANING", F.s, 10, C.textDim));
    row.appendChild(descCell);

    return row;
  }

  function legendRow(cellOn, cellOff, name, desc) {
    const row = hSec(COL_W);
    row.itemSpacing = 16;
    row.paddingTop = 10; row.paddingBottom = 10;
    row.counterAxisAlignItems = "CENTER";

    const onCell = hSec(W_CELL_COL);
    onCell.primaryAxisAlignItems = "CENTER";
    onCell.counterAxisAlignItems = "CENTER";
    onCell.appendChild(cellOn);
    row.appendChild(onCell);

    const offCell = hSec(W_CELL_COL);
    offCell.primaryAxisAlignItems = "CENTER";
    offCell.counterAxisAlignItems = "CENTER";
    offCell.appendChild(cellOff);
    row.appendChild(offCell);

    const nameCol = vSec(W_NAME);
    nameCol.appendChild(txt(name, F.s, 12, C.textLite));
    row.appendChild(nameCol);

    const descCol = vSec(W_DESC);
    descCol.appendChild(txtW(desc, F.r, 11, C.textDim, W_DESC, 15));
    row.appendChild(descCol);

    return row;
  }

  function buildTable(title, subtitle, rowSpecs, note) {
    const card = figma.createFrame();
    card.resize(COL_W + 48, 10);
    card.layoutMode = "VERTICAL";
    card.layoutSizingHorizontal = "FIXED";
    card.layoutSizingVertical = "HUG";
    card.paddingTop = 24; card.paddingBottom = 24;
    card.paddingLeft = 24; card.paddingRight = 24;
    card.itemSpacing = 0;
    card.cornerRadius = 12;
    setFill(card, C.panel, 1);
    setStroke(card, C.border, 1, 1);

    const titleT = txt(title, F.b, 16, C.textLite);
    card.appendChild(titleT);
    card.appendChild(spacer(10, 4));
    card.appendChild(txtW(subtitle, F.r, 11, C.textDim, COL_W, 16));
    card.appendChild(spacer(10, 16));

    card.appendChild(headerRow());
    card.appendChild(divider(COL_W, C.border, 1));

    for (var i = 0; i < rowSpecs.length; i++) {
      card.appendChild(rowSpecs[i]);
      if (i < rowSpecs.length - 1) card.appendChild(divider(COL_W, C.border, 0.5));
    }

    if (note) {
      card.appendChild(spacer(10, 16));
      card.appendChild(divider(COL_W, C.border, 0.8));
      card.appendChild(spacer(10, 12));
      const noteFrame = vSec(COL_W);
      noteFrame.appendChild(txt("Design note", F.s, 10, C.textDim));
      noteFrame.appendChild(spacer(10, 6));
      noteFrame.appendChild(txtW(note, F.r, 11, C.textDim, COL_W, 16));
      card.appendChild(noteFrame);
    }

    return card;
  }

  // ---------- Checkbox rows ----------
  const chkRows = [
    legendRow(
      chk("overridden", "on"), chk("overridden", "off"),
      "Normal",
      "User explicitly set this cell. Full-saturation accent on ON; neutral bright stroke on OFF. Wins over ancestor — any cascade from above stops here."
    ),
    legendRow(
      chk("inherited", "on"), chk("inherited", "off"),
      "Inherited",
      "Value flows from nearest ancestor override. Dim accent on ON, neutral dim stroke on OFF. Clickable — click promotes this cell to Normal (pins the value here, breaks further inheritance)."
    ),
    legendRow(
      chk("locked", "on"), chk("locked", "off"),
      "Locked",
      "Value forced by cascade-lock source (SUB=OFF on an ancestor). Neutral grey — no accent tint. OFF has a subtle backing («крышечка»), distinguishing Locked OFF from Inherited OFF (empty) and Disabled OFF (dashed). Not clickable — unlock only at the source."
    ),
    legendRow(
      chk("disabled", "on"), chk("disabled", "off"),
      "Disabled (row off)",
      "Row is functionally off — media missing or scan running. Dashed border + no backing in both states. Clicks are still accepted and mutate stored state — the change just has no real-world effect until the row re-enables. Safety Cover applies here specifically to remind the user they're touching something while the row is dead."
    ),
    legendRow(
      chk("disabled-inherited", "on"), chk("disabled-inherited", "off"),
      "Disabled + Inherited (row off)",
      "Row is off, and the stored value itself is Inherited from an ancestor. Dashed border (row-off signal) with a dim-accent check glyph on ON (lineage hint). Clicks are still accepted and mutate the cell's local override — when the row re-enables, that local override takes effect (promoting to Normal) if set."
    ),
    legendRow(
      chk("disabled-locked", "on"), chk("disabled-locked", "off"),
      "Disabled + Locked (row off)",
      "Row is off, and the stored value is cascade-locked from above. Dashed border with the grey Locked «подложка» peeking through. Not clickable even while the row is off — the Locked layer wins over the Disabled click-acceptance. No Safety Cover (nothing to gate)."
    ),
    legendRow(
      txt("N/A", F.m, 10, C.textGhost), coverStripCell(),
      "Safety Cover Countdown",
      "Orthogonal overlay — not a state class. Applies wherever the cell accepts clicks: Normal, Inherited, Disabled, Disabled+Inherited (4 of 6 rows above). Excluded from Locked and Disabled+Locked — source owns the value, so a 2-click gate has nothing to protect. Mechanic: first click arms (stroke turns red), countdown drains over ~3s, second click within the window commits. Timeout re-locks. Red appears ONLY during the armed countdown."
    ),
  ];

  const chkTable = buildTable(
    "Checkbox state taxonomy + Safety Cover",
    "Base classes: Normal → Inherited → Locked → Disabled. Compound rows (Disabled+Inherited, Disabled+Locked) show how Disabled composes orthogonally with the cascade class. SUB cascade is SYMMETRIC — SUB=OFF on an ancestor locks both ON and OFF values in descendants. Only Normal ON and Inherited ON carry accent — every OFF and every grey-tier cell is pure neutral.",
    chkRows,
    "Works at 14px because distinguishing signals are structural (fill presence, dash pattern, backing), not glyph-based. Safety Cover is red-only during the armed window — activation signal, not column chrome. This keeps red desensitization-free: the user sees red only when something is about to happen."
  );

  // ---------- Eye rows ----------
  // Asymmetry: open eye cascades as HARD LOCK (no Inherited ON), closed eye
  // cascades as SOFT INHERIT (no Locked OFF). Forbidden (class, value) pairs
  // render as naCell — a faded em-dash — so the gap reads as intentional.
  const eyeRows = [
    legendRow(
      eye("overridden", "on"), eye("overridden", "off"),
      "Normal",
      "User explicitly set eye state. Bare glyph — no container chrome. Full-saturation accent eye-open on ON; calm neutral borderBright eye-closed on OFF. Wins over ancestor cascade."
    ),
    legendRow(
      naCell(), eye("inherited", "off"),
      "Inherited",
      "Closed ancestor cascades as SOFT INHERIT — descendants echo closed, may individually override to open. Bare eye-closed glyph, strokeMid outline. Clickable — click promotes to Normal (the cell pins its own value). No ON variant: an open ancestor cascades as Locked ON, not Inherited ON."
    ),
    legendRow(
      eye("locked", "on"), naCell(),
      "Locked",
      "Open ancestor cascades as HARD LOCK — descendants are forced open. Bare eye-open glyph with strokeMid outline and a backMid «подложка» painted inside the eye body path — the fill is the lock signal, not a container box. Not clickable — unlock only at the ancestor (toggle that eye closed). No OFF variant: a closed ancestor doesn't lock, so a closed eye is always Inherited or Normal, never Locked."
    ),
    legendRow(
      eye("disabled", "on"), eye("disabled", "off"),
      "Disabled (row off)",
      "Row is functionally off — media missing or scan running. Bare glyph with muted strokeMid outline in both ON and OFF. The body path alone is dashed (outer almond on the open eye, eyelid arc on the closed eye) — pupil and lashes stay solid so the silhouette still reads as an eye. No container box: the dashed body is the row-off signal. Clicks are still accepted and mutate stored state; the change just has no real-world effect until the row re-enables. Safety Cover applies here to remind the user they're touching something while the row is dead."
    ),
    legendRow(
      naCell(), eye("disabled-inherited", "off"),
      "Disabled + Inherited (row off)",
      "Row is off, and the stored value itself is Inherited OFF from an ancestor. Bare eye-closed glyph with a darker backMid outline (both row-off and Inherited tiers darken the glyph), and the eyelid-arc body path alone is dashed — the four lashes stay solid. Clicks are still accepted — they set a local override that will take effect when the row re-enables. ON variant doesn't exist for the same reason as plain Inherited ON."
    ),
    legendRow(
      eye("disabled-locked", "on"), naCell(),
      "Disabled + Locked (row off)",
      "Row is off, but the eye is also under cascade-lock from an open ancestor. Bare eye-open glyph, backMid outline, backDim «подложка» painted in the body path, and the same body path is dashed (row-off signal) while the pupil stays solid — darker echo of plain Locked ON plus the Disabled dashed-body marker. Not clickable even while the row is off — Locked wins over Disabled click-acceptance. No Safety Cover (nothing to gate). OFF variant doesn't exist for the same reason as plain Locked OFF."
    ),
    legendRow(
      txt("N/A", F.m, 10, C.textGhost), coverStripCell(),
      "Safety Cover Countdown",
      "Same overlay mechanic as the checkbox table — applies wherever the cell accepts clicks: Normal (both), Inherited OFF, Disabled (both), Disabled+Inherited OFF. Excluded from Locked ON and Disabled+Locked ON (source owns the value). The cover wraps the 20×20 click target of the cell. First click arms, drains over ~3s, second click commits; timeout re-locks. Red only during the armed countdown."
    ),
  ];

  const eyeTable = buildTable(
    "Eye state taxonomy + Safety Cover",
    "Same base classes as the checkbox table (Normal / Inherited / Locked / Disabled + compounds), but ASYMMETRIC cascade: open eye = hard lock on descendants (no Inherited ON), closed eye = soft inherit (no Locked OFF). Forbidden (class, value) pairs render as a faded em-dash. Unlike the checkbox family, the eye glyphs carry no container chrome — class signal lives inside the glyph via three in-path stylings: outline colour (every tier), optional fill «подложка» on the body path (Locked ON, Disabled+Locked ON), and optional dashPattern on the same body path (every Disabled tier). Pupil and lashes always stay solid. Only Normal ON carries accent.",
    eyeRows,
    "The asymmetry captures a real semantic rule: you can't hide a child of a visible parent (open cascades as lock), but you can individually show a child of a hidden parent (closed cascades as hint). Keeping the eye chrome-free — all class signals baked into the glyph's own paths (outline colour, optional body подложка, optional body dashPattern) — lets the eye silhouette itself read as «contained» vs «free» without any wrapper boxes competing with the row-off border. Same red-during-armed-window rule applies."
  );

  // ---------- Root ----------
  const root = figma.createFrame();
  root.resize(10, 10);
  root.layoutMode = "VERTICAL";
  root.layoutSizingHorizontal = "HUG";
  root.layoutSizingVertical = "HUG";
  root.itemSpacing = 32;
  root.paddingTop = 40; root.paddingBottom = 40;
  root.paddingLeft = 40; root.paddingRight = 40;
  root.counterAxisAlignItems = "MIN";
  setFill(root, C.canvas, 1);

  root.appendChild(chkTable);
  root.appendChild(eyeTable);

  root.x = 200; root.y = 200;
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("Checkbox + Eye taxonomy rendered");
}

main();
