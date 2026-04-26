// SheepDog — Panel Concept v2.0 · Figma Scripter mockup
// Consolidates three legacy docs into one SOT (2026-04-24):
//   - figma-sheepdog-states-v1.js        (state model + LED palette + Simplified) → merged
//   - figma-sheepdog-tier-cycle-v1.js    (3-click cycle + root constraint + bulk)  → merged
//   - figma-sheepdog-panel-v1.2.js       (FLT + safety cover + sort + DEL + Settings) → partial merge
//                                         (superseded bits dropped; see below)
//
// What this doc maps to (spec: sheepdog-state-design-v1.md):
//   §1 Main panel idle      — state showcase, LED indicators, 8 annotation cards
//   §2 Simplified view      — Tier A columns (STATE · NAME · LNK · LBL · ×), global forced settings
//   §3 Tier model           — 3-click cycle (pin · toggle · unpin), Root constraint
//   §4 Bulk grammar         — root cascade, children-only, mixed root+children (follow-as-capable)
//   §5 Asymmetry tooltips   — educate root-vs-child state-space gap
//   §6 FLT flat-override    — 3 pair demos + guards 1-5 (effective target preview, etc.)
//   §7 Safety cover         — flip-up metaphor + borderCountdown (destructive ops gate)
//   §8 Sort auto-clear      — drag-clears-sort + Undo toast
//   §9 DEL column preview   — Advanced-only; per #41 hidden in Simplified, per #45 Mirror DEL parked
//   §10 Progress panel      — 3 variants (collapsed / expanded-idle / active with chunks)
//   §11 Action icon legend  — ↻ Sync / ⌕ Relink (now in LNK column) / 🧲 Gather / 👁 Eye / × / LBL
//   §12 Settings modal      — General / Import filters / Behavior / Danger zone / Advanced-Logs
//                              (AUTO-SYNC inheritance block DROPPED; Advanced toggle lives here)
//   §13 Plugin boundary     — Config / FS / Premiere layers + cross-boundary ops (per §16 spec)
//   §14 Magnet + Herder     — structure restoration, side-file safe harbour, SUB=off soft-stop
//   §REF Palette + taxonomy — 10-token palette SOT + checkbox / eye / button state tables
//
// SUPERSEDED from v1.2 — dropped:
//   - §1 STATE row-bg tint     (missing=red bg, scanning=amber bg) → replaced by LED stateCell
//   - §4.6 SUB=OFF subtree lockout → spec #9/#20: SUB=off is cause, not state; parent unaffected
//   - row(cfg.state = "ok"|"scanning"|"missing") → replaced by cfg.stateIndicator ∈ healthy|busy|disabled|missing
//   - §7 AUTO-SYNC global toggle + 👁 inheritance demo → #34: renamed "Advanced", mode-switch semantic
//
// SOT for helpers: finalized from figma-sheepdog-states-v1.js (arcGradient on eyeToggle for
// Locked-OFF / Disabled+Locked-OFF; size-asymmetric 4px/6px LED palette; TC taxonomy tokens).

async function main() {
  // ---------- Fonts ----------
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Italic" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // ---------- Constants ----------
  const DOC_W  = 1840;  // wider than states-v1 (1640) to accommodate tier-cycle sequence panels
  const PAD    = 40;
  const PANEL_W = 940;
  const ANN_W   = 540;

  const COL = {
    LABEL: 20,
    TREE:  14,  // kept for backward compat; chevron now lives inside NAME cell
    NAME:  204,
    PATH:  210,
    STATE: 32,  // LED indicator glyph (leftmost after rename from v1.2)
    SUB:   32,
    REL:   32,
    SEQ:   32,
    FLT:   32,
    EYE:   32,
    DEL:   32,  // hidden by default; appears only when Settings → Danger zone enables
    ACT:   78,  // 3 buttons (22px each) + 2 gaps (4px) = 74; +4 breathing = 78. Header label centers above content.
    RM:    22,
  };
  const ROW_GAP = 8;
  const ROW_PAD = 12;
  const ROW_H   = 30;

  // ---------- Colors (Premiere / Media Encoder dark theme) ----------
  const C = {
    canvas:    { r: 0.08,  g: 0.08,  b: 0.09  },
    panel:     { r: 0.145, g: 0.145, b: 0.155 },
    panelAlt:  { r: 0.175, g: 0.175, b: 0.185 },
    panelHi:   { r: 0.21,  g: 0.21,  b: 0.22  },
    border:    { r: 0.30,  g: 0.30,  b: 0.32  },
    borderStrong: { r: 0.42, g: 0.42, b: 0.44 },

    // 2026-04-25: C.text (0.87) collapsed into C.borderBright (0.843).
    // Two near-identical bright tokens were palette violations of the Apple
    // "pick once, inherit everywhere" rule (~5% delta carries no signal).
    // Now: borderBright is THE primary text token + checkbox Normal-OFF
    // stroke + button REST/HOVER/PRESSED icon — single source for bright.
    textDim:   { r: 0.60,  g: 0.60,  b: 0.63  },
    strokeMid: { r: 0.486, g: 0.486, b: 0.514 },
    borderBright: { r: 0.843, g: 0.843, b: 0.855 },

    accent:    { r: 0.08,  g: 0.47,  b: 0.95  },
    accentSoft:{ r: 0.08,  g: 0.47,  b: 0.95  },
    success:   { r: 0.302, g: 0.780, b: 0.388 },
    danger:    { r: 0.96,  g: 0.32,  b: 0.38  },
    amber:     { r: 0.94,  g: 0.69,  b: 0.22  },
    white:     { r: 1,     g: 1,     b: 1      },

    labelViolet:   { r: 0.55, g: 0.40, b: 0.95 },
    labelIris:     { r: 0.40, g: 0.50, b: 0.95 },
    labelCerulean: { r: 0.30, g: 0.70, b: 0.95 },
    labelForest:   { r: 0.30, g: 0.65, b: 0.40 },
    labelRose:     { r: 0.95, g: 0.45, b: 0.70 },
    labelMango:    { r: 0.96, g: 0.58, b: 0.22 },
  };

  const F = {
    r: { family: "Inter", style: "Regular"   },
    i: { family: "Inter", style: "Italic"    },
    m: { family: "Inter", style: "Medium"    },
    s: { family: "Inter", style: "Semi Bold" },
    b: { family: "Inter", style: "Bold"      },
  };

  // ---------- SVG icon dict ----------
  const SVG = {
    refresh:      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>',
    search:       '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>',
    magnet:       '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.87891 7.87891H4.22205" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.7784 4.13388C19.7784 3.81433 19.6514 3.50787 19.4255 3.28191C19.1995 3.05595 18.893 2.92899 18.5735 2.92897L15.3265 2.92897C15.0069 2.92899 14.7004 3.05595 14.4745 3.28191C14.2485 3.50787 14.1216 3.81433 14.1215 4.13388V12.6602C14.1215 12.9387 14.0667 13.2146 13.9601 13.472C13.8535 13.7293 13.6972 13.9632 13.5002 14.1602C13.3032 14.3572 13.0694 14.5134 12.812 14.62C12.5546 14.7266 12.2788 14.7815 12.0002 14.7815C11.7216 14.7815 11.4458 14.7266 11.1884 14.62C10.9311 14.5134 10.6972 14.3572 10.5002 14.1602C10.3032 13.9632 10.147 13.7293 10.0404 13.472C9.93377 13.2146 9.8789 12.9387 9.8789 12.6602L9.8789 4.13388C9.87888 3.81433 9.75193 3.50787 9.52597 3.28191C9.30001 3.05595 8.99355 2.92899 8.67399 2.92897L5.42696 2.92897C5.1074 2.92899 4.80094 3.05595 4.57498 3.28191C4.34903 3.50787 4.22207 3.81433 4.22205 4.13388L4.22346 13.1368C4.22365 15.1997 5.04331 17.178 6.50214 18.6366C7.96096 20.0951 9.93944 20.9144 12.0023 20.9142C13.0238 20.9141 14.0352 20.7129 14.9789 20.3219C15.9225 19.9309 16.7799 19.3579 17.5021 18.6356C18.9607 17.1767 19.78 15.1983 19.7798 13.1353L19.7784 4.13388Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.7783 7.87891H14.1215" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    eye:          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeClosed:    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>',
    settings:     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>',
    chevronDown:  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    funnelX:      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.531 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l.427-.473"/><path d="m16.5 3.5 5 5"/><path d="m21.5 3.5-5 5"/></svg>',
    rotateCcw:    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    arrowLeft:    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
    x:            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  };

  // ========================================================================
  // HELPERS
  // ========================================================================

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

  function setFill(node, color, opacity) {
    node.fills = [{ type: "SOLID", color, opacity: opacity != null ? opacity : 1 }];
  }
  function setStroke(node, color, opacity, weight) {
    node.strokes = [{ type: "SOLID", color, opacity: opacity != null ? opacity : 1 }];
    node.strokeWeight = weight != null ? weight : 1;
  }
  function flat(fg, alpha, bg) {
    bg = bg || C.panel;
    return {
      r: fg.r * alpha + bg.r * (1 - alpha),
      g: fg.g * alpha + bg.g * (1 - alpha),
      b: fg.b * alpha + bg.b * (1 - alpha)
    };
  }
  function setFillFlat(node, color, alpha, bg) {
    node.fills = [{ type: "SOLID", color: flat(color, alpha, bg), opacity: 1 }];
  }
  function setStrokeFlat(node, color, alpha, weight, bg) {
    node.strokes = [{ type: "SOLID", color: flat(color, alpha, bg), opacity: 1 }];
    node.strokeWeight = weight != null ? weight : 1;
  }

  function vSec(w) {
    const f = figma.createFrame();
    f.fills = [];
    f.resize(w, 10);
    f.layoutMode = "VERTICAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "HUG";
    return f;
  }
  function hSec(w) {
    const f = figma.createFrame();
    f.fills = [];
    f.resize(w, 10);
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "HUG";
    return f;
  }
  function hHug() {
    const f = figma.createFrame();
    f.fills = [];
    f.resize(40, 20);
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "HUG";
    f.layoutSizingVertical = "HUG";
    return f;
  }
  function vHug() {
    const f = figma.createFrame();
    f.fills = [];
    f.resize(20, 40);
    f.layoutMode = "VERTICAL";
    f.layoutSizingHorizontal = "HUG";
    f.layoutSizingVertical = "HUG";
    return f;
  }

  function txt(chars, font, size, color, lh, ls) {
    const t = figma.createText();
    t.fontName = font;
    t.characters = chars;
    t.fontSize = size;
    t.fills = [{ type: "SOLID", color }];
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    if (lh) t.lineHeight = { value: lh, unit: "PIXELS" };
    if (ls != null) t.letterSpacing = { value: ls, unit: "PIXELS" };
    return t;
  }
  function txtW(chars, font, size, color, w, lh) {
    const t = figma.createText();
    t.fontName = font;
    t.characters = chars;
    t.fontSize = size;
    t.fills = [{ type: "SOLID", color }];
    t.resize(w, 10);
    t.textAutoResize = "HEIGHT";
    if (lh) t.lineHeight = { value: lh, unit: "PIXELS" };
    return t;
  }
  function divider(w, color, opacity) {
    const r = figma.createRectangle();
    r.resize(w, 1);
    r.fills = [{ type: "SOLID", color, opacity: opacity != null ? opacity : 1 }];
    return r;
  }
  function dividerV(h, color, opacity) {
    const r = figma.createRectangle();
    r.resize(1, h);
    r.fills = [{ type: "SOLID", color, opacity: opacity != null ? opacity : 1 }];
    return r;
  }
  function spacer(w, h) {
    const f = figma.createFrame();
    f.resize(w, h);
    f.fills = [];
    return f;
  }

  function treeCell(svgKey, color, visible) {
    const f = figma.createFrame();
    f.resize(COL.TREE, ROW_H);
    f.fills = [];
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = "CENTER";
    f.counterAxisAlignItems = "CENTER";
    if (visible !== false && svgKey) {
      f.appendChild(loadIcon(svgKey, color || C.textDim, 12));
    }
    return f;
  }

  // TC — solid taxonomy palette (mirrors Tabel.jsx; referenced by checkbox/eyeToggle).
  const TC = {
    backMid:      { r: 0.294, g: 0.294, b: 0.306 },
    backDim:      { r: 0.196, g: 0.196, b: 0.206 },
    strokeMid:    { r: 0.486, g: 0.486, b: 0.514 },
    borderBright: { r: 0.843, g: 0.843, b: 0.855 },
    accentFill:   { r: 0.122, g: 0.259, b: 0.431 },
    accentEdge:   { r: 0.118, g: 0.290, b: 0.514 },
  };

  function bodyChildIndex(glyph) { return glyph === "eyeClosed" ? 1 : 0; }
  function applyBodyBacking(node, glyph, color) {
    if (!("children" in node) || !Array.isArray(node.children)) return;
    const body = node.children[bodyChildIndex(glyph)];
    if (body && "fills" in body) body.fills = [{ type: "SOLID", color: color, opacity: 1 }];
  }
  function applyBodyDash(node, glyph) {
    if (!("children" in node) || !Array.isArray(node.children)) return;
    const body = node.children[bodyChildIndex(glyph)];
    if (body && "dashPattern" in body) body.dashPattern = [1.5, 1.5];
  }

  // applyBodyGradient — fills the eyeClosed arc with a top→bottom vertical gradient
  // (top 0% alpha → bottom 100% alpha, same color). Used for Locked-OFF and
  // Disabled+Locked-OFF eye variants. Gives closed eyelid a weighty pressed-down look.
  function applyBodyGradient(node, glyph, colorRGB) {
    if (!("children" in node) || !Array.isArray(node.children)) return;
    const body = node.children[bodyChildIndex(glyph)];
    if (!body || !("fills" in body)) return;
    body.fills = [{
      type: "GRADIENT_LINEAR",
      gradientTransform: [[0, 1, 0], [-1, 0, 1]],
      gradientStops: [
        { position: 0, color: { r: colorRGB.r, g: colorRGB.g, b: colorRGB.b, a: 0 } },
        { position: 1, color: { r: colorRGB.r, g: colorRGB.g, b: colorRGB.b, a: 1 } },
      ],
    }];
  }

  // checkbox(variant, locked, danger) — 4-tier presence gradient.
  // See §REF taxonomy table for full (class, value) matrix.
  function checkbox(variant, locked, danger) {
    let cls, value;
    if (variant === "cover" || variant === "cover-armed") {
      cls = variant;
    } else if (variant === "disabled-locked-on") {
      cls = "disabled-locked"; value = "on";
    } else if (variant === "disabled-locked-off" || variant === "disabled-locked") {
      cls = "disabled-locked"; value = "off";
    } else if (variant === "disabled-inherited-on") {
      cls = "disabled-inherited"; value = "on";
    } else if (variant === "disabled-inherited-off") {
      cls = "disabled-inherited"; value = "off";
    } else if (variant === "disabled" || variant === "disabled-off") {
      cls = "disabled"; value = "off";
    } else if (variant === "disabled-on") {
      cls = "disabled"; value = "on";
    } else if (locked) {
      cls = "locked";
      value = (variant === "on" || variant === "inherited-on") ? "on" : "off";
    } else if (variant === "inherited-on" || variant === "inherited-off") {
      cls = "inherited";
      value = variant === "inherited-on" ? "on" : "off";
    } else {
      cls = "overridden"; value = variant;
    }

    const f = figma.createFrame();
    f.resize(14, 14);
    f.cornerRadius = 3;

    function center() {
      f.layoutMode = "HORIZONTAL";
      f.layoutSizingHorizontal = "FIXED"; f.layoutSizingVertical = "FIXED";
      f.primaryAxisAlignItems = "CENTER"; f.counterAxisAlignItems = "CENTER";
    }

    if (cls === "overridden" && value === "on") {
      const fillColor = danger ? C.danger : C.accent;
      setFill(f, fillColor, 1); setStroke(f, fillColor, 1, 1);
      center(); f.appendChild(txt("✓", F.b, 10, C.white));
    } else if (cls === "overridden" && value === "off") {
      f.fills = []; setStroke(f, TC.borderBright, 1, 1);
    } else if (cls === "inherited" && value === "on") {
      setFill(f, TC.accentFill, 1); setStroke(f, TC.accentEdge, 1, 1);
      center(); f.appendChild(txt("✓", F.m, 9, C.white));
    } else if (cls === "inherited" && value === "off") {
      f.fills = []; setStroke(f, TC.strokeMid, 1, 1);
    } else if (cls === "locked" && value === "on") {
      setFill(f, TC.backMid, 1); setStroke(f, TC.strokeMid, 1, 1);
      center(); f.appendChild(txt("✓", F.m, 9, TC.strokeMid));
    } else if (cls === "locked" && value === "off") {
      setFill(f, TC.backMid, 1); setStroke(f, TC.strokeMid, 1, 1);
    } else if (cls === "disabled" && value === "on") {
      f.fills = []; setStroke(f, TC.strokeMid, 1, 1);
      f.dashPattern = [2, 2];
      center(); f.appendChild(txt("✓", F.m, 9, TC.strokeMid));
    } else if (cls === "disabled" && value === "off") {
      f.fills = []; setStroke(f, TC.strokeMid, 1, 1);
      f.dashPattern = [2, 2];
    } else if (cls === "disabled-inherited" && value === "on") {
      f.fills = []; setStroke(f, TC.backMid, 1, 1);
      f.dashPattern = [2, 2];
      center(); f.appendChild(txt("✓", F.m, 9, TC.backMid));
    } else if (cls === "disabled-inherited" && value === "off") {
      f.fills = []; setStroke(f, TC.backMid, 1, 1);
      f.dashPattern = [2, 2];
    } else if (cls === "disabled-locked" && value === "on") {
      setFill(f, TC.backDim, 1); setStroke(f, TC.backMid, 1, 1);
      f.dashPattern = [2, 2];
      center(); f.appendChild(txt("✓", F.m, 9, TC.backMid));
    } else if (cls === "disabled-locked" && value === "off") {
      setFill(f, TC.backDim, 1); setStroke(f, TC.backMid, 1, 1);
      f.dashPattern = [2, 2];
    } else if (cls === "cover") {
      setFillFlat(f, C.white, 0.06);
      setStroke(f, C.borderStrong, 1, 1.5);
    } else if (cls === "cover-armed") {
      setFillFlat(f, C.white, 0.06);
      setStrokeFlat(f, C.danger, 0.85, 1.5);
    }
    return f;
  }

  // eyeToggle(variant, locked) — NO container chrome. Class signal lives in the glyph.
  // Asymmetric cascade per spec: open eye ≠ symmetric like checkbox SUB (see §REF eye table).
  function eyeToggle(variant, locked) {
    let cls, value;
    if (variant === "disabled-locked-on") {
      cls = "disabled-locked"; value = "on";
    } else if (variant === "disabled-inherited-on") {
      cls = "disabled-inherited"; value = "on";
    } else if (variant === "disabled-inherited-off") {
      cls = "disabled-inherited"; value = "off";
    } else if (variant === "disabled" || variant === "disabled-off") {
      cls = "disabled"; value = "off";
    } else if (variant === "disabled-on") {
      cls = "disabled"; value = "on";
    } else if (variant === "inherited-on") {
      cls = "inherited"; value = "on";
    } else if (locked) {
      cls = "locked";
      value = (variant === "on" || variant === "inherited-on") ? "on" : "off";
    } else if (variant === "inherited-off") {
      cls = "inherited"; value = "off";
    } else {
      cls = "overridden"; value = variant === "on" ? "on" : "off";
    }

    const wrap = figma.createFrame();
    wrap.resize(20, 20);
    wrap.layoutMode = "HORIZONTAL";
    wrap.layoutSizingHorizontal = "FIXED"; wrap.layoutSizingVertical = "FIXED";
    wrap.primaryAxisAlignItems = "CENTER"; wrap.counterAxisAlignItems = "CENTER";
    wrap.fills = [];

    const glyphSize = 14;
    let glyph, color, backing = null, dashed = false, arcGradient = null;
    if (cls === "overridden" && value === "on") {
      glyph = "eye"; color = C.accent;
    } else if (cls === "overridden" && value === "off") {
      glyph = "eyeClosed"; color = TC.borderBright;
    } else if (cls === "inherited" && value === "on") {
      glyph = "eye"; color = TC.strokeMid;
    } else if (cls === "inherited" && value === "off") {
      glyph = "eyeClosed"; color = TC.strokeMid;
    } else if (cls === "locked" && value === "on") {
      glyph = "eye"; color = TC.strokeMid; backing = TC.backMid;
    } else if (cls === "locked" && value === "off") {
      glyph = "eyeClosed"; color = TC.strokeMid; arcGradient = TC.backMid;
    } else if (cls === "disabled" && value === "on") {
      glyph = "eye"; color = TC.strokeMid; dashed = true;
    } else if (cls === "disabled" && value === "off") {
      glyph = "eyeClosed"; color = TC.strokeMid; dashed = true;
    } else if (cls === "disabled-inherited" && value === "on") {
      glyph = "eye"; color = TC.backMid; dashed = true;
    } else if (cls === "disabled-inherited" && value === "off") {
      glyph = "eyeClosed"; color = TC.backMid; dashed = true;
    } else if (cls === "disabled-locked" && value === "on") {
      glyph = "eye"; color = TC.backMid; backing = TC.backDim; dashed = true;
    } else if (cls === "disabled-locked" && value === "off") {
      glyph = "eyeClosed"; color = TC.backMid; arcGradient = TC.backDim; dashed = true;
    } else {
      glyph = "eye"; color = TC.strokeMid;
    }

    const g = loadIcon(glyph, color, glyphSize);
    if (backing)     applyBodyBacking(g, glyph, backing);
    if (dashed)      applyBodyDash(g, glyph);
    if (arcGradient) applyBodyGradient(g, glyph, arcGradient);
    wrap.appendChild(g);
    return wrap;
  }

  function cell(w, child, align) {
    const f = figma.createFrame();
    f.resize(w, ROW_H);
    f.fills = [];
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = align || "CENTER";
    f.counterAxisAlignItems = "CENTER";
    if (child) f.appendChild(child);
    return f;
  }

  function labelDot(color) {
    const f = figma.createFrame();
    f.resize(12, 12);
    f.cornerRadius = 6;
    if (color) {
      setFill(f, color, 1);
    } else {
      f.fills = [];
      setStrokeFlat(f, C.textDim, 0.7, 1);
    }
    return f;
  }

  function actionIcon(glyph, color, opacity) {
    const f = figma.createFrame();
    f.resize(22, 22);
    f.cornerRadius = 3;
    f.fills = [];
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = "CENTER";
    f.counterAxisAlignItems = "CENTER";
    const svgKeyMap = { "↻": "refresh", "⌕": "search", "🧲": "magnet", "👁": "eye", "⚙": "settings", "×": "x", "↺": "rotateCcw", "←": "arrowLeft" };
    const svgKey = svgKeyMap[glyph];
    const base = color || C.borderBright;
    const iconColor = (opacity != null) ? flat(base, opacity) : base;
    if (svgKey) {
      f.appendChild(loadIcon(svgKey, iconColor, 14));
    } else {
      f.appendChild(txt(glyph, F.m, 12, iconColor));
    }
    return f;
  }

  function actionIconHighlight(glyph, color) {
    const f = actionIcon(glyph, color);
    setFillFlat(f, color, 0.22);
    setStrokeFlat(f, color, 0.5, 1);
    return f;
  }

  function btnPrimary(label) {
    const f = hHug();
    f.paddingTop = 7; f.paddingBottom = 7;
    f.paddingLeft = 14; f.paddingRight = 14;
    f.cornerRadius = 4;
    f.counterAxisAlignItems = "CENTER";
    setFill(f, C.accent, 1);
    f.appendChild(txt(label, F.s, 12, C.white));
    return f;
  }
  function btnGhost(label) {
    const f = hHug();
    f.paddingTop = 7; f.paddingBottom = 7;
    f.paddingLeft = 12; f.paddingRight = 12;
    f.cornerRadius = 4;
    f.counterAxisAlignItems = "CENTER";
    f.fills = [];
    setStroke(f, C.border, 1, 1);
    f.appendChild(txt(label, F.m, 12, C.borderBright));
    return f;
  }

  function chip(label, color, bgOpacity) {
    const f = hHug();
    f.paddingTop = 2; f.paddingBottom = 2;
    f.paddingLeft = 6; f.paddingRight = 6;
    f.cornerRadius = 3;
    f.counterAxisAlignItems = "CENTER";
    setFill(f, color, bgOpacity != null ? bgOpacity : 0.18);
    setStroke(f, color, 0.45, 1);
    f.appendChild(txt(label, F.m, 10, color));
    return f;
  }

  // recolorPath / loadFunnelXIcon — selective 2-color rendering for funnel-x filter icon.
  function recolorPath(node, color) {
    if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
      node.strokes = node.strokes.map(function(p) {
        if (p.type === "SOLID") return { type: "SOLID", color: color, opacity: p.opacity != null ? p.opacity : 1 };
        return p;
      });
    }
    if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
      node.fills = node.fills.map(function(p) {
        if (p.type === "SOLID") return { type: "SOLID", color: color, opacity: p.opacity != null ? p.opacity : 1 };
        return p;
      });
    }
  }
  function loadFunnelXIcon(funnelColor, xColor, size) {
    size = size || 14;
    const f = figma.createNodeFromSvg(SVG.funnelX);
    f.fills = [];
    f.resize(size, size);
    rescaleStrokes(f, size / 24);
    if (f.children && f.children.length >= 3) {
      recolorPath(f.children[0], funnelColor);
      recolorPath(f.children[1], xColor);
      recolorPath(f.children[2], xColor);
    }
    return f;
  }

  // btnHeader — outlined square (28×28) for header toolbar; builder provides icon.
  function btnHeader(iconBuilder) {
    const f = figma.createFrame();
    f.resize(28, 28);
    f.cornerRadius = 4;
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = "CENTER";
    f.counterAxisAlignItems = "CENTER";
    f.fills = [];
    setStroke(f, C.border, 1, 1);
    f.appendChild(iconBuilder());
    return f;
  }

  function btnFilter(active) {
    const funnelColor = active ? C.borderBright : C.textDim;
    const xColor      = C.textDim; // always dim
    return btnHeader(function() { return loadFunnelXIcon(funnelColor, xColor, 14); });
  }
  function btnCheckImport(active) {
    const iconColor = active ? C.borderBright : C.textDim;
    return btnHeader(function() { return loadIcon("refresh", iconColor, 14); });
  }

  function toggle(on) {
    const wrap = hHug();
    wrap.itemSpacing = 8;
    wrap.counterAxisAlignItems = "CENTER";
    const track = figma.createFrame();
    track.resize(28, 16);
    track.cornerRadius = 8;
    if (on) setFill(track, C.accent, 1);
    else setFill(track, C.border, 1);
    const knob = figma.createFrame();
    knob.resize(12, 12);
    knob.cornerRadius = 6;
    setFill(knob, C.white, 1);
    knob.x = on ? 14 : 2;
    knob.y = 2;
    track.appendChild(knob);
    wrap.appendChild(track);
    return wrap;
  }

  function sectionTitle(text, subtext, w) {
    const v = vSec(w);
    v.itemSpacing = 4;
    v.appendChild(txt(text, F.b, 20, C.white, 26, 0));
    if (subtext) v.appendChild(txt(subtext, F.r, 12, C.textDim, 18));
    return v;
  }

  function note(text, w) {
    return txtW(text, F.r, 11, C.textDim, w, 16);
  }

  function annCard(title, color, rows, width) {
    const w = width || ANN_W;
    const card = vSec(w);
    card.cornerRadius = 8;
    setFill(card, C.panel, 1);
    setStroke(card, color, 0.35, 1);
    card.paddingTop = 14; card.paddingBottom = 14;
    card.paddingLeft = 16; card.paddingRight = 16;
    card.itemSpacing = 10;

    const head = hHug();
    head.itemSpacing = 10;
    head.counterAxisAlignItems = "CENTER";
    const chipDot = figma.createFrame();
    chipDot.resize(6, 6); chipDot.cornerRadius = 3;
    setFill(chipDot, color, 1);
    head.appendChild(chipDot);
    head.appendChild(txt(title, F.s, 12, C.white, undefined, 0.5));
    card.appendChild(head);

    for (const rw of rows) {
      const line = hSec(w - 32);
      line.itemSpacing = 10;
      line.counterAxisAlignItems = "MIN";
      line.appendChild(rw.demo);
      const tx = vSec(w - 32 - 34);
      tx.itemSpacing = 2;
      tx.appendChild(txt(rw.title, F.s, 11, C.borderBright));
      tx.appendChild(txtW(rw.desc, F.r, 11, C.textDim, w - 32 - 34, 16));
      line.appendChild(tx);
      card.appendChild(line);
    }
    return card;
  }

  function demoBox(w, h, child) {
    const f = figma.createFrame();
    f.resize(w, h);
    f.fills = [];
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = "CENTER";
    f.counterAxisAlignItems = "CENTER";
    if (child) f.appendChild(child);
    return f;
  }

  // treeMini — used by §6 FLT pair demos (on-disk vs resolved tree visualizations).
  function treeMini(title, lines, colorAccent, width) {
    const w = width || 680;
    const box = vSec(w);
    box.cornerRadius = 8;
    setFill(box, C.panel, 1);
    setStroke(box, colorAccent, 0.4, 1);
    box.paddingTop = 18; box.paddingBottom = 18;
    box.paddingLeft = 22; box.paddingRight = 22;
    box.itemSpacing = 6;

    const head = hHug();
    head.itemSpacing = 10;
    head.counterAxisAlignItems = "CENTER";
    const chipDot = figma.createFrame();
    chipDot.resize(6, 6); chipDot.cornerRadius = 3;
    setFill(chipDot, colorAccent, 1);
    head.appendChild(chipDot);
    head.appendChild(txt(title, F.s, 12, C.white, undefined, 0.5));
    box.appendChild(head);
    box.appendChild(spacer(1, 6));

    for (const ln of lines) {
      const h = hSec(w - 44);
      h.itemSpacing = 8;
      h.counterAxisAlignItems = "CENTER";
      h.appendChild(txt(ln.glyph || "  ", F.m, 11, ln.color || C.textDim));
      h.appendChild(txt(ln.text, ln.bold ? F.s : F.r, 12, ln.textColor || C.borderBright));
      if (ln.tag) h.appendChild(txt(ln.tag, F.i, 10, ln.tagColor || C.textDim));
      box.appendChild(h);
    }
    return box;
  }

  // ========================================================================
  // TIER-CYCLE LOCAL HELPERS (for §3 / §4 / §5)
  // ========================================================================

  function arrowLabel(label, w) {
    const f = hSec(w || 60);
    f.itemSpacing = 6;
    f.counterAxisAlignItems = "CENTER";
    f.primaryAxisAlignItems = "CENTER";
    f.appendChild(txt("-->", F.r, 11, C.textDim));
    if (label) f.appendChild(txt(label, F.m, 11, C.borderBright));
    return f;
  }

  function bigArrow(label) {
    const f = vHug();
    f.itemSpacing = 6;
    f.counterAxisAlignItems = "CENTER";
    const arr = figma.createFrame();
    arr.resize(32, 32);
    arr.layoutMode = "HORIZONTAL";
    arr.layoutSizingHorizontal = "FIXED";
    arr.layoutSizingVertical = "FIXED";
    arr.primaryAxisAlignItems = "CENTER";
    arr.counterAxisAlignItems = "CENTER";
    arr.fills = [];
    setStroke(arr, C.border, 1, 1);
    arr.cornerRadius = 16;
    arr.appendChild(txt(">", F.b, 14, C.textDim));
    f.appendChild(arr);
    if (label) f.appendChild(txt(label, F.m, 10, C.textDim, 14));
    return f;
  }

  function cycleCell(kind, variant, label, stepLabel) {
    const wrap = vHug();
    wrap.itemSpacing = 6;
    wrap.counterAxisAlignItems = "CENTER";

    if (stepLabel) {
      const badge = figma.createFrame();
      badge.resize(18, 18);
      badge.cornerRadius = 9;
      badge.layoutMode = "HORIZONTAL";
      badge.layoutSizingHorizontal = "FIXED";
      badge.layoutSizingVertical = "FIXED";
      badge.primaryAxisAlignItems = "CENTER";
      badge.counterAxisAlignItems = "CENTER";
      setFillFlat(badge, C.accent, 0.25);
      badge.appendChild(txt(stepLabel, F.b, 9, C.accent));
      wrap.appendChild(badge);
    }

    const glyphBox = figma.createFrame();
    glyphBox.resize(40, 40);
    glyphBox.cornerRadius = 6;
    glyphBox.layoutMode = "HORIZONTAL";
    glyphBox.layoutSizingHorizontal = "FIXED";
    glyphBox.layoutSizingVertical = "FIXED";
    glyphBox.primaryAxisAlignItems = "CENTER";
    glyphBox.counterAxisAlignItems = "CENTER";
    setFillFlat(glyphBox, C.white, 0.04);
    setStroke(glyphBox, C.border, 1, 1);
    glyphBox.appendChild(kind === "eye" ? eyeToggle(variant) : checkbox(variant));
    wrap.appendChild(glyphBox);

    if (label) wrap.appendChild(txt(label, F.r, 10, C.textDim, 14));
    return wrap;
  }

  function compactArrow(label) {
    const f = vHug();
    f.itemSpacing = 4;
    f.counterAxisAlignItems = "CENTER";
    f.appendChild(txt(">", F.b, 12, C.borderStrong));
    if (label) f.appendChild(txt(label, F.m, 9, C.accent, 12));
    return f;
  }

  function miniPanel(w) {
    const p = vSec(w);
    p.cornerRadius = 6;
    p.clipsContent = true;
    setFill(p, C.panel, 1);
    setStroke(p, C.border, 1, 1);
    p.itemSpacing = 0;
    return p;
  }

  function miniColHeader(w) {
    const bar = hSec(w);
    bar.paddingLeft = 10; bar.paddingRight = 10;
    bar.paddingTop = 6; bar.paddingBottom = 6;
    bar.itemSpacing = 8;
    bar.counterAxisAlignItems = "CENTER";
    setFill(bar, C.panelAlt, 1);
    bar.appendChild(txt("NAME", F.s, 9, C.textDim, undefined, 1));
    const sp = spacer(1, 1);
    bar.appendChild(sp);
    sp.layoutGrow = 1;
    bar.appendChild(txt("EYE", F.s, 9, C.textDim, undefined, 1));
    return bar;
  }

  function miniRow(cfg, panelW) {
    const wrap = hSec(panelW);
    wrap.paddingLeft = 10; wrap.paddingRight = 10;
    wrap.paddingTop = 0; wrap.paddingBottom = 0;
    wrap.itemSpacing = 0;
    wrap.counterAxisAlignItems = "CENTER";
    if (cfg.selected) setFill(wrap, C.panelHi, 1);
    else wrap.fills = [];

    const inner = hSec(panelW - 20);
    inner.itemSpacing = 6;
    inner.counterAxisAlignItems = "CENTER";
    inner.paddingTop = 5; inner.paddingBottom = 5;

    if (cfg.indent) inner.appendChild(spacer(cfg.indent, 1));
    inner.appendChild(txt(cfg.name, cfg.root ? F.m : F.r, 11, cfg.root ? C.borderBright : C.textDim));
    const sp = spacer(1, 1);
    inner.appendChild(sp);
    sp.layoutGrow = 1;
    inner.appendChild(eyeToggle(cfg.eyeVariant));

    wrap.appendChild(inner);
    return wrap;
  }

  function tooltipBox(text, pointDown) {
    const wrap = vHug();
    wrap.itemSpacing = 0;
    wrap.counterAxisAlignItems = "CENTER";

    const box = vHug();
    box.paddingTop = 8; box.paddingBottom = 8;
    box.paddingLeft = 10; box.paddingRight = 10;
    box.cornerRadius = 4;
    box.itemSpacing = 4;
    setFill(box, C.canvas, 1);
    setStroke(box, C.border, 1, 1);
    box.appendChild(txtW(text, F.r, 11, C.borderBright, 200, 16));
    wrap.appendChild(box);

    if (pointDown) {
      const triWrap = figma.createFrame();
      triWrap.resize(16, 6);
      triWrap.fills = [];
      wrap.appendChild(triWrap);
    }

    return wrap;
  }

  // ========================================================================
  // SAFETY-COVER HELPERS (for §7)
  // Sampled rounded-rect perimeter + trimmed-path model. Figma-specific
  // workaround: native VectorNode has no trim-path / dashoffset, so we
  // truncate the point list and flip axes for CCW drain. In production CEP
  // this collapses to <path stroke-dasharray=perim stroke-dashoffset animated>.
  // ========================================================================

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

  function borderCountdown(size, r, progress01) {
    const wrap = figma.createFrame();
    wrap.resize(size, size);
    wrap.fills = [];

    const base = figma.createFrame();
    base.resize(size, size);
    base.cornerRadius = r;
    base.fills = [];
    setStroke(base, C.borderStrong, 1, 1.75);
    base.x = 0; base.y = 0;
    wrap.appendChild(base);

    const inset = 1;
    const inner = size - 2 * inset;
    const overlay = figma.createVector();
    overlay.resize(inner, inner);
    overlay.vectorPaths = [{
      windingRule: "NONE",
      data: perimeterPathCCW(inner, inner, r, progress01),
    }];
    overlay.strokes = [{ type: "SOLID", color: C.accent }];
    overlay.strokeWeight = 1.75;
    overlay.strokeCap = "ROUND";
    overlay.strokeJoin = "ROUND";
    overlay.fills = [];
    wrap.appendChild(overlay);
    overlay.relativeTransform = [[-1, 0, inset + inner], [0, 1, inset]];

    return wrap;
  }

  // ========================================================================
  // PANEL FACTORIES (header / columns / row)
  // ========================================================================

  function panelHeader() {
    const wrap = hSec(PANEL_W);
    wrap.paddingLeft = 14; wrap.paddingRight = 14;
    wrap.paddingTop = 10; wrap.paddingBottom = 10;
    wrap.itemSpacing = 12;
    wrap.counterAxisAlignItems = "CENTER";
    setFill(wrap, C.panel, 1);

    const logoBox = hHug();
    logoBox.itemSpacing = 8;
    logoBox.counterAxisAlignItems = "CENTER";
    const logoDot = figma.createFrame();
    logoDot.resize(18, 18);
    logoDot.cornerRadius = 4;
    setFill(logoDot, C.accent, 1);
    logoDot.layoutMode = "HORIZONTAL";
    logoDot.layoutSizingHorizontal = "FIXED";
    logoDot.layoutSizingVertical = "FIXED";
    logoDot.primaryAxisAlignItems = "CENTER";
    logoDot.counterAxisAlignItems = "CENTER";
    logoDot.appendChild(txt("S", F.b, 10, C.white));
    logoBox.appendChild(logoDot);
    logoBox.appendChild(txt("SheepDog", F.b, 13, C.borderBright));
    wrap.appendChild(logoBox);

    const searchBox = hSec(180);
    searchBox.paddingLeft = 10; searchBox.paddingRight = 10;
    searchBox.paddingTop = 6; searchBox.paddingBottom = 6;
    searchBox.itemSpacing = 8;
    searchBox.cornerRadius = 4;
    searchBox.counterAxisAlignItems = "CENTER";
    setFill(searchBox, C.canvas, 1);
    setStroke(searchBox, C.border, 1, 1);
    searchBox.appendChild(loadIcon("search", C.textDim, 14));
    searchBox.appendChild(txt("Search watch folders…", F.r, 11, C.textDim));
    wrap.appendChild(searchBox);

    wrap.appendChild(spacer(1, 1));
    wrap.children[wrap.children.length - 1].layoutGrow = 1;

    const asBox = hHug();
    asBox.itemSpacing = 6;
    asBox.counterAxisAlignItems = "CENTER";
    asBox.appendChild(txt("Advanced", F.m, 11, C.borderBright));
    asBox.appendChild(toggle(true));
    wrap.appendChild(asBox);

    wrap.appendChild(btnFilter(false));
    wrap.appendChild(btnCheckImport(false));
    wrap.appendChild(actionIcon("⚙", C.borderBright));
    return wrap;
  }

  function colHeaderCell(w, label, align, color) {
    const f = figma.createFrame();
    f.resize(w, 24);
    f.fills = [];
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = align || "MIN";
    f.counterAxisAlignItems = "CENTER";
    if (label) f.appendChild(txt(label, F.s, 9, color || C.textDim, undefined, 1));
    return f;
  }

  function columnHeaderBar(opts) {
    const wrap = hSec(PANEL_W);
    wrap.paddingLeft = ROW_PAD; wrap.paddingRight = ROW_PAD;
    wrap.paddingTop = 6; wrap.paddingBottom = 6;
    wrap.itemSpacing = ROW_GAP;
    wrap.counterAxisAlignItems = "CENTER";
    setFill(wrap, C.panelAlt, 1);

    wrap.appendChild(colHeaderCell(COL.STATE, "ST",     "CENTER"));
    wrap.appendChild(colHeaderCell(COL.NAME,  "NAME",   "MIN", C.textDim));
    wrap.appendChild(colHeaderCell(COL.PATH,  "PATH",   "MIN"));
    // Flex spacer — absorbs slack between PATH and right-pinned cluster
    // (SUB onward), pushing cluster to the right edge per Mockup.png target.
    const headerFlex = spacer(1, 1);
    wrap.appendChild(headerFlex);
    headerFlex.layoutGrow = 1;
    wrap.appendChild(colHeaderCell(COL.SUB,   "SUB",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.REL,   "REL",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.SEQ,   "SEQ",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.FLT,   "FLT",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.EYE,   "EYE",    "CENTER"));
    if (opts && opts.showDel) {
      wrap.appendChild(colHeaderCell(COL.DEL, "DEL", "CENTER"));
    }
    wrap.appendChild(colHeaderCell(COL.ACT,   "ACTIONS","CENTER"));
    wrap.appendChild(colHeaderCell(COL.LABEL, "LBL",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.RM,    "",       "CENTER"));
    return wrap;
  }

  // stateCell(stateIndicator) — LED indicator per row.
  // Palette (2026-04-25 — mirror-deleting added):
  //   healthy         = solid  4px blue   (idle baseline)
  //   busy            = hollow 6px blue   (import in-flight, pulses in real impl)
  //   mirror-deleting = hollow 6px red    (OS trash in-flight, pulses; parallels busy in red channel)
  //   disabled        = hollow 6px gray   (off, not broken)
  //   missing         = solid  4px red    (persistent alarm — path unreachable)
  //
  // Shape × hue grammar:
  //   solid/hollow encodes steady/transient; hue (blue/red/gray) encodes channel.
  //   mirror-deleting is the red analogue of busy — same visual weight, opposite outcome.
  function stateCell(stateIndicator) {
    const f = figma.createFrame();
    f.resize(COL.STATE, ROW_H);
    f.fills = [];
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = "CENTER";
    f.counterAxisAlignItems = "CENTER";

    const led = figma.createFrame();
    if (stateIndicator === "healthy") {
      led.resize(4, 4); led.cornerRadius = 2;
      setFill(led, C.accent, 1);
    } else if (stateIndicator === "busy") {
      led.resize(6, 6); led.cornerRadius = 3;
      led.fills = [];
      setStroke(led, C.accent, 1, 1);
    } else if (stateIndicator === "mirror-deleting") {
      led.resize(6, 6); led.cornerRadius = 3;
      led.fills = [];
      setStroke(led, C.danger, 1, 1);
    } else if (stateIndicator === "disabled") {
      led.resize(6, 6); led.cornerRadius = 3;
      led.fills = [];
      setStroke(led, C.strokeMid, 1, 1);
    } else if (stateIndicator === "missing") {
      led.resize(4, 4); led.cornerRadius = 2;
      setFill(led, C.danger, 1);
    } else {
      return f;
    }
    f.appendChild(led);
    return f;
  }

  // row(cfg) — full advanced row. cfg.stateIndicator drives STATE LED + path color + ⚠ prefix.
  // Row bg stays calm across all states (no tints, no borders). cfg.subLocked renders Locked tier on
  // toggles (race-prevention during Busy); cfg.showDel + cfg.del surface the optional DEL column.
  // Optional: cfg.extraTargetChip (FLT §6 guard 1), cfg.fltBorder ("swallowed"|"anchor") for FLT demos.
  function row(cfg) {
    const r = hSec(PANEL_W - 2 * ROW_PAD);
    r.paddingTop = 0; r.paddingBottom = 0;
    r.paddingLeft = 0; r.paddingRight = 0;
    r.itemSpacing = ROW_GAP;
    r.counterAxisAlignItems = "CENTER";

    const wrap = hSec(PANEL_W);
    wrap.paddingLeft = ROW_PAD; wrap.paddingRight = ROW_PAD;
    wrap.paddingTop = 0; wrap.paddingBottom = 0;
    wrap.itemSpacing = 0;
    wrap.counterAxisAlignItems = "CENTER";
    wrap.fills = [];

    // FLT border states (§6 guards): survives state-cascade only when state is healthy
    // (state signal always wins — per plan risk #4).
    if (cfg.stateIndicator === "healthy" || cfg.stateIndicator == null) {
      if (cfg.fltBorder === "swallowed") setStroke(wrap, C.borderStrong, 0.7, 1);
      else if (cfg.fltBorder === "anchor") setStroke(wrap, C.accent, 0.55, 1);
    }

    const labelBox = cell(COL.LABEL, labelDot(cfg.label));
    const dimAlpha = cfg.labelInherited ? 0.4
                    : (cfg.stateIndicator === "disabled" || cfg.subLocked) ? 0.35
                    : null;
    if (dimAlpha != null) {
      const dot = labelBox.children[0];
      if (cfg.label) {
        dot.fills = [{ type: "SOLID", color: flat(cfg.label, dimAlpha), opacity: 1 }];
      } else {
        dot.strokes = [{ type: "SOLID", color: flat(C.textDim, 0.7 * dimAlpha), opacity: 1 }];
      }
    }

    r.appendChild(stateCell(cfg.stateIndicator || "healthy"));

    // NAME cell with integrated chevron + optional target chip.
    const nameBox = cell(COL.NAME, null, "MIN");
    const nameInner = hHug();
    nameInner.itemSpacing = 6;
    nameInner.counterAxisAlignItems = "CENTER";
    if (cfg.indent) nameInner.appendChild(spacer(cfg.indent, 1));
    let svgKey = null;
    if (cfg.tree === "expanded")       svgKey = "chevronDown";
    else if (cfg.tree === "collapsed") svgKey = "chevronRight";
    else if (cfg.tree === "virtual")   svgKey = "chevronRight";
    if (svgKey) nameInner.appendChild(loadIcon(svgKey, C.textDim, 12));
    else        nameInner.appendChild(spacer(12, 1));
    const nameFont = cfg.nameItalic ? F.i : F.m;
    const nameColor = cfg.nameColor || ((cfg.stateIndicator === "disabled" || cfg.subLocked) ? C.strokeMid : C.borderBright);
    nameInner.appendChild(txt(cfg.name, nameFont, 12, nameColor));
    if (cfg.extraTargetChip) nameInner.appendChild(chip(cfg.extraTargetChip, C.amber, 0.15));
    nameBox.appendChild(nameInner);
    r.appendChild(nameBox);

    // PATH cell — color follows NAME (identity = one channel). Exception:
    // missing rows render path in danger red + ⚠ prefix — that's a STATE
    // signal localized to the path itself ("this specific row's path is the
    // unreachable thing"), kept separate from row-identity brightness.
    const pathBox = cell(COL.PATH, null, "MIN");
    const isPathMissing = (cfg.stateIndicator === "missing");
    const pathColor = cfg.pathColor || (isPathMissing ? C.danger : nameColor);
    const pathFont = cfg.pathItalic ? F.i : F.r;
    const pathInner = hHug();
    pathInner.itemSpacing = 4;
    pathInner.counterAxisAlignItems = "CENTER";
    if (isPathMissing) pathInner.appendChild(txt("⚠", F.b, 11, C.danger));
    pathInner.appendChild(txt(cfg.path, pathFont, 11, pathColor));
    pathBox.appendChild(pathInner);
    r.appendChild(pathBox);

    // Flex spacer — pushes right-pinned cluster (SUB onward) to right edge.
    // Mirrors columnHeaderBar so headers + row content stay column-aligned.
    const rowFlex = spacer(1, 1);
    r.appendChild(rowFlex);
    rowFlex.layoutGrow = 1;

    r.appendChild(cell(COL.SUB, checkbox(cfg.sub, cfg.subLocked)));
    r.appendChild(cell(COL.REL, checkbox(cfg.rel, cfg.subLocked)));
    r.appendChild(cell(COL.SEQ, checkbox(cfg.seq, cfg.subLocked)));
    r.appendChild(cell(COL.FLT, checkbox(cfg.flt, cfg.subLocked)));
    r.appendChild(cell(COL.EYE, eyeToggle(cfg.eye || "on", cfg.subLocked)));

    if (cfg.showDel) {
      const delVariant = cfg.del || "off";
      r.appendChild(cell(COL.DEL, checkbox(delVariant, cfg.subLocked, true)));
    }

    // ACTIONS.
    const actWrap = cell(COL.ACT, null, "CENTER");
    const actInner = hHug();
    actInner.itemSpacing = 4;
    actInner.counterAxisAlignItems = "CENTER";
    for (const a of (cfg.actions || [])) {
      let ic;
      if (a.highlight) ic = actionIconHighlight(a.glyph, a.color || C.accent);
      else ic = actionIcon(a.glyph, a.color || C.borderBright, a.opacity);
      actInner.appendChild(ic);
    }
    actWrap.appendChild(actInner);
    r.appendChild(actWrap);

    r.appendChild(labelBox);

    // RM column — context-aware glyph:
    //   disabled child         → ← (arrow-left, restore) — "soft-stop reversed, watching back"
    //                             chosen for ×-like diamond form-factor — same visual weight as ×.
    //                             Hover turns BLUE (positive/restore signal — accent),
    //                             mirroring × hover going RED on missing/root (destructive).
    //   healthy/missing/root   → × (disable or delete, meaning per §1 × matrix)
    //   busy / mirror-deleting → × locked (strokeMid — race-prevention)
    //   remove=false           → empty
    const rmCell = cell(COL.RM, null);
    if (cfg.remove !== false) {
      const locked = (cfg.stateIndicator === "busy" || cfg.stateIndicator === "mirror-deleting");
      const rmColor = locked ? C.strokeMid : C.textDim;
      if (cfg.stateIndicator === "disabled") {
        rmCell.appendChild(loadIcon("arrowLeft", rmColor, 12));
      } else {
        rmCell.appendChild(loadIcon("x", rmColor, 12));
      }
    }
    r.appendChild(rmCell);

    wrap.appendChild(r);
    return wrap;
  }

  // ---------- Simplified mode (§2) — Tier A columns ----------
  // STATE · NAME · LNK(⌕) · LBL · × (2026-04-23). Drops SUB/SEQ/REL/FLT/EYE/DEL.
  // SUB defaults ON; SEQ forced ON via Premiere native; EYE forced ON; DEL hidden.
  const PANEL_SIMP_W  = 540;
  const COL_SIMP_NAME = 346;
  const COL_SIMP_ACT  = 32;

  function panelHeaderSimplified(w) {
    const wrap = hSec(w);
    wrap.paddingLeft = 14; wrap.paddingRight = 14;
    wrap.paddingTop = 10; wrap.paddingBottom = 10;
    wrap.itemSpacing = 10;
    wrap.counterAxisAlignItems = "CENTER";
    setFill(wrap, C.panel, 1);

    const logoBox = hHug();
    logoBox.itemSpacing = 8;
    logoBox.counterAxisAlignItems = "CENTER";
    const logoDot = figma.createFrame();
    logoDot.resize(18, 18); logoDot.cornerRadius = 4;
    setFill(logoDot, C.accent, 1);
    logoDot.layoutMode = "HORIZONTAL";
    logoDot.layoutSizingHorizontal = "FIXED";
    logoDot.layoutSizingVertical = "FIXED";
    logoDot.primaryAxisAlignItems = "CENTER";
    logoDot.counterAxisAlignItems = "CENTER";
    logoDot.appendChild(txt("S", F.b, 10, C.white));
    logoBox.appendChild(logoDot);
    logoBox.appendChild(txt("SheepDog", F.b, 13, C.borderBright));
    wrap.appendChild(logoBox);

    const searchBox = hSec(150);
    searchBox.paddingLeft = 10; searchBox.paddingRight = 10;
    searchBox.paddingTop = 6; searchBox.paddingBottom = 6;
    searchBox.itemSpacing = 8;
    searchBox.cornerRadius = 4;
    searchBox.counterAxisAlignItems = "CENTER";
    setFill(searchBox, C.canvas, 1);
    setStroke(searchBox, C.border, 1, 1);
    searchBox.appendChild(loadIcon("search", C.textDim, 13));
    searchBox.appendChild(txt("Search…", F.r, 11, C.textDim));
    wrap.appendChild(searchBox);

    wrap.appendChild(spacer(1, 1));
    wrap.children[wrap.children.length - 1].layoutGrow = 1;

    const asBox = hHug();
    asBox.itemSpacing = 6;
    asBox.counterAxisAlignItems = "CENTER";
    asBox.appendChild(txt("Advanced", F.m, 11, C.borderBright));
    asBox.appendChild(toggle(false));
    wrap.appendChild(asBox);

    wrap.appendChild(btnFilter(false));
    wrap.appendChild(btnCheckImport(false));
    wrap.appendChild(actionIcon("⚙", C.borderBright));
    return wrap;
  }

  function columnHeaderBarSimplified(w) {
    const wrap = hSec(w);
    wrap.paddingLeft = ROW_PAD; wrap.paddingRight = ROW_PAD;
    wrap.paddingTop = 6; wrap.paddingBottom = 6;
    wrap.itemSpacing = ROW_GAP;
    wrap.counterAxisAlignItems = "CENTER";
    setFill(wrap, C.panelAlt, 1);

    wrap.appendChild(colHeaderCell(COL.STATE,    "ST",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL_SIMP_NAME, "NAME",  "MIN", C.textDim));
    // Flex spacer — pushes right-pinned cluster (LNK · LBL · ×) to the right
    // edge, mirroring Advanced columnHeaderBar.
    const headerFlexS = spacer(1, 1);
    wrap.appendChild(headerFlexS);
    headerFlexS.layoutGrow = 1;
    wrap.appendChild(colHeaderCell(COL_SIMP_ACT, "LNK",   "CENTER"));
    wrap.appendChild(colHeaderCell(COL.LABEL,    "LBL",   "CENTER"));
    wrap.appendChild(colHeaderCell(COL.RM,       "",      "CENTER"));
    return wrap;
  }

  function rowSimplified(cfg, panelW) {
    const r = hSec(panelW - 2 * ROW_PAD);
    r.itemSpacing = ROW_GAP;
    r.counterAxisAlignItems = "CENTER";

    const wrap = hSec(panelW);
    wrap.paddingLeft = ROW_PAD; wrap.paddingRight = ROW_PAD;
    wrap.itemSpacing = 0;
    wrap.counterAxisAlignItems = "CENTER";
    wrap.fills = [];

    const labelBox = cell(COL.LABEL, labelDot(cfg.label));
    const dimAlpha = cfg.labelInherited ? 0.4
                    : (cfg.stateIndicator === "disabled") ? 0.35
                    : null;
    if (dimAlpha != null) {
      const dot = labelBox.children[0];
      if (cfg.label) {
        dot.fills = [{ type: "SOLID", color: flat(cfg.label, dimAlpha), opacity: 1 }];
      } else {
        dot.strokes = [{ type: "SOLID", color: flat(C.textDim, 0.7 * dimAlpha), opacity: 1 }];
      }
    }

    r.appendChild(stateCell(cfg.stateIndicator || "healthy"));

    const nameBox = cell(COL_SIMP_NAME, null, "MIN");
    const nameInner = hHug();
    nameInner.itemSpacing = 6;
    nameInner.counterAxisAlignItems = "CENTER";
    if (cfg.indent) nameInner.appendChild(spacer(cfg.indent, 1));
    let svgKey = null;
    if (cfg.tree === "expanded")       svgKey = "chevronDown";
    else if (cfg.tree === "collapsed") svgKey = "chevronRight";
    else if (cfg.tree === "virtual")   svgKey = "chevronRight";
    if (svgKey) nameInner.appendChild(loadIcon(svgKey, C.textDim, 12));
    else        nameInner.appendChild(spacer(12, 1));
    const nameFont = cfg.nameItalic ? F.i : F.m;
    const nameColor = cfg.nameColor || ((cfg.stateIndicator === "disabled") ? C.strokeMid : C.borderBright);
    nameInner.appendChild(txt(cfg.name, nameFont, 12, nameColor));
    nameBox.appendChild(nameInner);
    r.appendChild(nameBox);

    // Flex spacer — pushes LNK · LBL · × to right edge.
    // Mirrors columnHeaderBarSimplified so headers + row content stay column-aligned.
    const rowFlexS = spacer(1, 1);
    r.appendChild(rowFlexS);
    rowFlexS.layoutGrow = 1;

    const actColor = (cfg.stateIndicator === "disabled"
                   || cfg.stateIndicator === "missing"
                   || cfg.stateIndicator === "busy")
      ? C.strokeMid
      : C.borderBright;
    r.appendChild(cell(COL_SIMP_ACT, actionIcon("⌕", actColor)));

    r.appendChild(labelBox);

    // RM column — same context-aware glyph as full row(): ← (arrowLeft) for disabled, × otherwise.
    const rmCellS = cell(COL.RM, null);
    if (cfg.remove !== false) {
      const lockedS = (cfg.stateIndicator === "busy" || cfg.stateIndicator === "mirror-deleting");
      const rmColorS = lockedS ? C.strokeMid : C.textDim;
      if (cfg.stateIndicator === "disabled") {
        rmCellS.appendChild(loadIcon("arrowLeft", rmColorS, 12));
      } else {
        rmCellS.appendChild(loadIcon("x", rmColorS, 12));
      }
    }
    r.appendChild(rmCellS);

    wrap.appendChild(r);
    return wrap;
  }

  function footerSimplified(label, w) {
    const f = hSec(w);
    f.paddingLeft = 14; f.paddingRight = 14;
    f.paddingTop = 8; f.paddingBottom = 8;
    f.itemSpacing = 10;
    f.counterAxisAlignItems = "CENTER";
    setFill(f, C.panel, 1);
    f.appendChild(txt("status:", F.r, 11, C.textDim));
    f.appendChild(txt(label || "Ready", F.m, 11, C.borderBright));
    return f;
  }

  function footer(label) {
    const f = hSec(PANEL_W);
    f.paddingLeft = 14; f.paddingRight = 14;
    f.paddingTop = 8; f.paddingBottom = 8;
    f.itemSpacing = 10;
    f.counterAxisAlignItems = "CENTER";
    setFill(f, C.panel, 1);
    f.appendChild(txt("status:", F.r, 11, C.textDim));
    f.appendChild(txt(label || "Ready", F.m, 11, C.borderBright));
    return f;
  }

  // progressPanel(variant) — §10. Variants: "collapsed" | "expanded-idle" | "active".
  // progressPanel(variant) — variants: "collapsed" | "expanded-idle" | "active" (import) | "mirror-deleting"
  function progressPanel(variant) {
    const isMirror = (variant === "mirror-deleting");
    const activeColor = isMirror ? C.danger : C.accent;

    const p = vSec(PANEL_W);
    p.paddingLeft = 14; p.paddingRight = 14;
    p.paddingTop = 10; p.paddingBottom = 10;
    p.itemSpacing = 8;
    setFill(p, C.panelAlt, 1);

    const head = hSec(PANEL_W - 28);
    head.itemSpacing = 8;
    head.counterAxisAlignItems = "CENTER";
    // Caret = unified chevron SVG (right for collapsed, down for expanded).
    head.appendChild(loadIcon(variant === "collapsed" ? "chevronRight" : "chevronDown", C.textDim, 12));
    if (variant === "collapsed") {
      head.appendChild(txt("Progress — idle", F.s, 12, C.borderBright));
      head.appendChild(txt("·", F.r, 11, C.textDim));
      head.appendChild(txt("last: 148 imported / 7 skipped · 2m ago", F.r, 11, C.textDim));
    } else if (variant === "expanded-idle") {
      head.appendChild(txt("Progress — idle", F.s, 12, C.borderBright));
    } else if (isMirror) {
      head.appendChild(txt("Mirror DEL — trashing to OS", F.s, 12, C.danger));
      head.appendChild(spacer(1, 1)); head.children[head.children.length - 1].layoutGrow = 1;
      head.appendChild(txt("[Cancel]", F.m, 11, C.danger));
    } else {
      head.appendChild(txt("Progress — Check & Import running", F.s, 12, C.borderBright));
      head.appendChild(spacer(1, 1)); head.children[head.children.length - 1].layoutGrow = 1;
      head.appendChild(txt("[Cancel]", F.m, 11, C.danger));
    }
    p.appendChild(head);

    if (variant === "collapsed") return p;

    if (variant === "expanded-idle") {
      p.appendChild(txt("Last run: 2026-04-25 14:22 · 148 imported / 7 skipped / 0 errors", F.r, 11, C.textDim));
      p.appendChild(txt('Last chunk: bin "03_Assets/01_Video" · 5 files · 3.2s', F.r, 11, C.textDim));
      p.appendChild(txt("Next auto-sync: in 2s (Auto-import ON)", F.r, 11, C.textDim));
      return p;
    }

    const barWrap = vSec(PANEL_W - 28);
    barWrap.itemSpacing = 4;
    const barLabel = hSec(PANEL_W - 28);
    barLabel.itemSpacing = 8;
    barLabel.counterAxisAlignItems = "CENTER";
    barLabel.appendChild(txt("Overall", F.m, 11, C.borderBright));
    barLabel.appendChild(spacer(1, 1)); barLabel.children[barLabel.children.length - 1].layoutGrow = 1;
    if (isMirror) {
      barLabel.appendChild(txt("42% · 3/7 bins · 21/50 files · timer 3.1s / 5s", F.r, 11, C.textDim));
    } else {
      barLabel.appendChild(txt("68% · 7/10 chunks · 102/148 files", F.r, 11, C.textDim));
    }
    barWrap.appendChild(barLabel);

    const track = figma.createFrame();
    track.resize(PANEL_W - 28, 6);
    track.cornerRadius = 3;
    setFill(track, C.canvas, 1);
    const fill = figma.createFrame();
    fill.resize(Math.round((PANEL_W - 28) * (isMirror ? 0.42 : 0.68)), 6);
    fill.cornerRadius = 3;
    setFill(fill, activeColor, 1);
    track.appendChild(fill);
    barWrap.appendChild(track);
    p.appendChild(barWrap);

    function chunkLine(label, status, color) {
      const h = hSec(PANEL_W - 28);
      h.itemSpacing = 8;
      h.counterAxisAlignItems = "CENTER";
      h.appendChild(loadIcon("chevronRight", C.textDim, 10));
      h.appendChild(txt(label, F.r, 11, C.borderBright));
      h.appendChild(spacer(1, 1)); h.children[h.children.length - 1].layoutGrow = 1;
      h.appendChild(txt(status, F.r, 11, color || C.textDim));
      return h;
    }

    if (isMirror) {
      p.appendChild(chunkLine('bin "03_Assets/_old_backup"', "8/8 trashed  ✓", C.success));
      p.appendChild(chunkLine('bin "03_Assets/01_Video/RAW"', "12/12 trashed  ✓", C.success));
      p.appendChild(chunkLine('bin "D:/Shoots/day_00"', "1/30 trashing…  (timer 3.1s)", C.danger));
    } else {
      p.appendChild(chunkLine('bin "03_Assets/01_Video"', "5/5 done  ✓", C.success));
      p.appendChild(chunkLine('bin "03_Assets/02_Image"', "8/8 done  ✓", C.success));
      p.appendChild(chunkLine('bin "03_Assets/03_Image_Sequences"', "scanning…", C.amber));
    }
    return p;
  }

  // ========================================================================
  // BUILD DOCUMENT
  // ========================================================================

  const root = figma.createFrame();
  root.name = "SheepDog — Panel Concept v2.0";
  root.resize(DOC_W, 10);
  root.layoutMode = "VERTICAL";
  root.layoutSizingHorizontal = "FIXED";
  root.layoutSizingVertical = "HUG";
  setFill(root, C.canvas, 1);
  root.paddingTop = PAD; root.paddingBottom = PAD;
  root.paddingLeft = PAD; root.paddingRight = PAD;
  root.itemSpacing = 56;

  const contentW = DOC_W - 2 * PAD;

  // ---------- §0 Title ----------
  const titleSec = vSec(contentW);
  titleSec.itemSpacing = 8;
  titleSec.appendChild(txt(
    "SheepDog — Panel Concept v2.0  ·  merged SOT",
    F.b, 36, C.white, 44, 1
  ));
  titleSec.appendChild(txt(
    "§1 Main panel · §2 Simplified · §3 Tier cycle · §4 Bulk grammar · §5 Asymmetry · §6 FLT · §7 Cover · §8 Sort · §9 Mirror DEL · §10 Progress · §11 Icons · §11b Labels · §12 Settings · §13 Boundary · §14 Magnet+Herder · §REF Palette/Taxonomy  ·  2026-04-25",
    F.r, 14, C.textDim, 20
  ));
  titleSec.appendChild(divider(contentW, C.white, 0.08));
  root.appendChild(titleSec);

  // ==================================================
  // §1 — Main panel · state showcase
  // One panel, 4 states, cause variations. STATE column (new) shows per-row
  // LED indicator. SUB/EYE/LBL are orthogonal settings — shown at right.
  // ==================================================

  const sec1 = vSec(contentW);
  sec1.itemSpacing = 16;
  sec1.appendChild(sectionTitle(
    "§1 — Main panel · state showcase",
    "STATE column (LED) shows per-row indicator. SUB/EYE/LBL are orthogonal settings — shown at right of STATE, unchanged by state.",
    contentW
  ));

  const sec1Row = hSec(contentW);
  sec1Row.itemSpacing = 40;
  sec1Row.counterAxisAlignItems = "MIN";

  // ---------- Main panel ----------
  const panel1 = vSec(PANEL_W);
  panel1.cornerRadius = 6;
  panel1.clipsContent = true;
  setFill(panel1, C.panel, 1);
  setStroke(panel1, C.border, 1, 1);
  panel1.itemSpacing = 0;

  panel1.appendChild(panelHeader());
  panel1.appendChild(divider(PANEL_W, C.border, 1));
  panel1.appendChild(columnHeaderBar());
  panel1.appendChild(divider(PANEL_W, C.border, 1));

  // NOTE: Static tier snapshots only. Cycle behavior lives in §3; bulk in §4.
  const rowsP1 = [
    // ── S1 HEALTHY ──────────────────────────────────────────────────────
    {
      tree: "expanded", stateIndicator: "healthy",
      name: "03_Assets", path: "E:/Projects/2026/FILM/03_Assets",
      sub: "on", rel: "off", seq: "off", flt: "off", eye: "on",
      label: C.labelCerulean,
      actions: [
        { glyph: "↻", color: C.borderBright },
        { glyph: "⌕", color: C.borderBright },
        { glyph: "🧲", color: C.borderBright },
      ],
    },
    {
      indent: 18, tree: "expanded", stateIndicator: "healthy",
      name: "01_Video", path: "…/03_Assets/01_Video",
      sub: "inherited-on", rel: "inherited-off", seq: "on", flt: "inherited-off", eye: "inherited-on",
      label: null, labelInherited: true,
      actions: [
        { glyph: "↻", color: C.borderBright },
        { glyph: "⌕", color: C.borderBright },
        { glyph: "🧲", color: C.borderBright },
      ],
    },
    // ── S2 BUSY ─────────────────────────────────────────────────────────
    {
      tree: "collapsed", stateIndicator: "busy", subLocked: true,
      name: "day_02", path: "D:/Shoots/2026/04/day_02",
      sub: "on", rel: "off", seq: "off", flt: "off", eye: "on",
      label: C.labelMango,
      actions: [
        { glyph: "↻", color: C.strokeMid },
        { glyph: "⌕", color: C.strokeMid },
        { glyph: "🧲", color: C.strokeMid },
      ],
    },
    // ── S3 DISABLED — own force ─────────────────────────────────────────
    {
      tree: "collapsed", stateIndicator: "disabled",
      name: "_old_backup", path: "E:/archive/2024/FILM_old",
      sub: "disabled", rel: "disabled", seq: "disabled", flt: "disabled", eye: "disabled",
      label: null, labelInherited: true,
      nameColor: C.strokeMid,
      actions: [
        { glyph: "↻", color: C.strokeMid },
        { glyph: "⌕", color: C.strokeMid },
        { glyph: "🧲", color: C.strokeMid },
      ],
    },
    // ── S3 DISABLED — parent SUB=off cascade (parent stays Healthy) ─────
    {
      tree: "expanded", stateIndicator: "healthy",
      name: "ref", path: "E:/REFLIB/CGI",
      sub: "off", rel: "on", seq: "off", flt: "off", eye: "off",
      label: C.labelViolet,
      actions: [
        { glyph: "↻", color: C.borderBright },
        { glyph: "⌕", color: C.borderBright },
        { glyph: "🧲", color: C.borderBright },
      ],
    },
    {
      indent: 18, tree: "collapsed", stateIndicator: "disabled",
      name: "CGI_footage", path: "…/REFLIB/CGI/CGI_footage",
      sub: "disabled-inherited-off", rel: "disabled-inherited-off", seq: "disabled-inherited-off", flt: "disabled-inherited-off", eye: "disabled-inherited-off",
      label: null, labelInherited: true,
      nameColor: C.strokeMid,
      actions: [
        { glyph: "↻", color: C.strokeMid },
        { glyph: "⌕", color: C.strokeMid },
        { glyph: "🧲", color: C.strokeMid },
      ],
    },
    // ── S3 DISABLED — parent itself disabled (cascade) ──────────────────
    {
      tree: "expanded", stateIndicator: "disabled",
      name: "_trash", path: "E:/archive/trash",
      sub: "disabled", rel: "disabled", seq: "disabled", flt: "disabled", eye: "disabled",
      label: null, labelInherited: true,
      nameColor: C.strokeMid,
      actions: [
        { glyph: "↻", color: C.strokeMid },
        { glyph: "⌕", color: C.strokeMid },
        { glyph: "🧲", color: C.strokeMid },
      ],
    },
    {
      indent: 18, tree: "collapsed", stateIndicator: "disabled",
      name: "old_vfx", path: "…/trash/old_vfx",
      sub: "disabled-inherited-off", rel: "disabled-inherited-off", seq: "disabled-inherited-off", flt: "disabled-inherited-off", eye: "disabled-inherited-off",
      label: null, labelInherited: true,
      nameColor: C.strokeMid,
      actions: [
        { glyph: "↻", color: C.strokeMid },
        { glyph: "⌕", color: C.strokeMid },
        { glyph: "🧲", color: C.strokeMid },
      ],
    },
    // ── S4 MISSING — mixed inheritance (enoent) ─────────────────────────
    {
      indent: 18, tree: "collapsed", stateIndicator: "missing",
      name: "03_Archive", path: "…/03_Assets/03_Archive",
      sub: "disabled-inherited-on", rel: "disabled-inherited-off", seq: "disabled-inherited-off", flt: "disabled-inherited-off", eye: "disabled-on",
      label: null, labelInherited: true,
      actions: [
        { glyph: "↻", color: C.strokeMid },
        { glyph: "⌕", color: C.strokeMid },
        { glyph: "🧲", color: C.strokeMid },
      ],
    },
    // ── S4 MISSING — offline drive ──────────────────────────────────────
    {
      tree: "collapsed", stateIndicator: "missing",
      name: "external_footage", path: "F:/external/footage",
      sub: "disabled-on", rel: "disabled", seq: "disabled", flt: "disabled", eye: "disabled-on",
      label: C.labelIris,
      actions: [
        { glyph: "↻", color: C.strokeMid },
        { glyph: "⌕", color: C.strokeMid },
        { glyph: "🧲", color: C.strokeMid },
      ],
    },
    // ── S4 MISSING — eacces ─────────────────────────────────────────────
    {
      tree: "collapsed", stateIndicator: "missing",
      name: "locked_archive", path: "E:/locked",
      sub: "disabled-on", rel: "disabled", seq: "disabled", flt: "disabled", eye: "disabled-on",
      label: C.labelRose,
      actions: [
        { glyph: "↻", color: C.strokeMid },
        { glyph: "⌕", color: C.strokeMid },
        { glyph: "🧲", color: C.strokeMid },
      ],
    },
    // ── EDGE — Missing AND user-disabled ────────────────────────────────
    {
      tree: "collapsed", stateIndicator: "missing",
      name: "_archived_disk", path: "G:/archive/legacy",
      nameColor: C.strokeMid,
      sub: "disabled", rel: "disabled", seq: "disabled", flt: "disabled", eye: "disabled",
      label: null, labelInherited: true,
      actions: [
        { glyph: "↻", color: C.strokeMid },
        { glyph: "⌕", color: C.strokeMid },
        { glyph: "🧲", color: C.strokeMid },
      ],
    },
  ];

  for (const cfg of rowsP1) {
    panel1.appendChild(row(cfg));
    panel1.appendChild(divider(PANEL_W, C.border, 0.25));
  }
  panel1.appendChild(footer("Watching 12 rows  ·  1 busy  ·  4 missing  ·  4 disabled  ·  1 edge (missing + user-disabled)"));
  sec1Row.appendChild(panel1);

  // ---------- Annotation column — 8 cards ----------
  const ann1 = vSec(ANN_W);
  ann1.itemSpacing = 20;

  ann1.appendChild(annCard("S1 — Healthy", C.accent, [
    {
      demo: demoBox(32, 20, (function() {
        const led = figma.createFrame();
        led.resize(4, 4); led.cornerRadius = 2;
        setFill(led, C.accent, 1);
        return led;
      })()),
      title: "Small solid blue (4px) — baseline, alive",
      desc: "Most common state (80%+ rows). Small size keeps visual weight quiet on panel scan, but blue hue connects to busy's hollow blue ring — unified \"healthy channel\". Size asymmetry: steady states (idle/missing) are compact 4px solid dots, transient/off (busy/disabled) are 6px hollow rings. Scan is NOT Busy — silent.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(eyeToggle("off")); g.appendChild(checkbox("on")); return g;
      })()),
      title: "EYE=off is a setting, not a state",
      desc: "Healthy + EYE=off = valid healthy row (LED stays hollow bright). EYE/SUB/LBL are orthogonal settings — they don't change S1→S4 state. SUB=off cascades disabled-cause to children, but parent row stays S1.",
    },
  ]));

  ann1.appendChild(annCard("S2 — Busy (import in-flight)", C.accent, [
    {
      demo: demoBox(32, 20, (function() {
        const led = figma.createFrame();
        led.resize(6, 6); led.cornerRadius = 3;
        led.fills = []; setStroke(led, C.accent, 1, 1);
        return led;
      })()),
      title: "Hollow blue ring 6px — active, pulses in real impl",
      desc: "Triggered ONLY by import (auto-sync or manual Check & Import). Scan is never Busy — silent. Hollow ring = natural pulse animation in production (stroke opacity / ring expansion — iOS activity indicator pattern). 6px ring is larger than 4px solid idle — hollow shape needs room to read + size reinforces \"something happening here\". Blue hue shared with idle (healthy channel); shape distinguishes state. Figma renders static.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(checkbox("on", true));
        g.appendChild(eyeToggle("on", true));
        return g;
      })()),
      title: "Race-prevention lock — toggles + actions",
      desc: "Toggles (SUB/REL/SEQ/FLT/EYE) render as LOCKED tier — not clickable during import. Action icons (↻ ⌕ 🧲) render strokeMid = disabled visual. × also disabled (can't remove folder mid-import). LBL stays editable — metadata edits don't race with in-flight import.",
    },
    {
      demo: demoBox(32, 20, txt("N/M", F.m, 10, C.textDim)),
      title: "N/M counter (future)",
      desc: "Busy row can carry a file counter (e.g. 12/40) via tooltip on the LED. Not rendered in this mock — LED slot is too narrow for counter text.",
    },
  ]));

  ann1.appendChild(annCard("S3 — Disabled (3 causes, 1 runtime)", C.strokeMid, [
    {
      demo: demoBox(32, 20, (function() {
        const led = figma.createFrame();
        led.resize(6, 6); led.cornerRadius = 3;
        led.fills = []; setStroke(led, C.strokeMid, 1, 1);
        return led;
      })()),
      title: "Hollow gray LED — off, not broken",
      desc: "2×2 grammar (shape × hue). Solid=active-attention (busy/missing), hollow=passive-baseline (idle/disabled). Hollow strokeMid stroke reads as \"muted, off by user\" without claiming red/alarm. Stroke brightness encodes channel: baseline-ok vs turned-off.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const f = figma.createFrame(); f.resize(14, 14); f.cornerRadius = 3;
        f.fills = []; setStroke(f, TC.strokeMid, 1, 1); f.dashPattern = [2,2]; return f;
      })()),
      title: "Cause A — own × force-disable",
      desc: "User explicitly disabled this row. × on a child sets force-disable. × on a root removes from config. Tooltip: \"Disabled by user.\"",
    },
    {
      demo: demoBox(32, 20, (function() {
        const f = figma.createFrame(); f.resize(14, 14); f.cornerRadius = 3;
        f.fills = []; setStroke(f, TC.backMid, 1, 1); f.dashPattern = [2,2]; return f;
      })()),
      title: "Cause B — parent SUB=off cascade",
      desc: "Parent has SUB=off (parent is Healthy, not disabled). Descendants inherit disabled-cause. Controls show disabled-inherited tier (backMid dashed — dimmer than Cause A). Tooltip: \"Watching disabled — parent SUB=off.\"",
    },
    {
      demo: demoBox(32, 20, (function() {
        const f = figma.createFrame(); f.resize(14, 14); f.cornerRadius = 3;
        f.fills = []; setStroke(f, TC.backMid, 1, 1); f.dashPattern = [2,2]; return f;
      })()),
      title: "Cause C — parent itself disabled",
      desc: "Parent row is Disabled (any cause). Whole subtree cascades. Controls use disabled-inherited tier. Both parent and child carry the hollow gray LED.",
    },
  ]));

  ann1.appendChild(annCard("S4 — Missing (path unreachable)", C.danger, [
    {
      demo: demoBox(32, 20, (function() {
        const led = figma.createFrame();
        led.resize(6, 6); led.cornerRadius = 3;
        setFill(led, C.danger, 1);
        return led;
      })()),
      title: "Red LED — path unreachable",
      desc: "Path can't be reached (any subtype). Missing supersedes all other states including Busy. State signals: red LED + path text red with ⚠ prefix. Row bg stays calm. No colored buttons — Relink is a regular strokeMid icon.",
    },
    {
      demo: demoBox(32, 20, actionIcon("⌕", C.strokeMid)),
      title: "Missing implies disabled-visual on controls",
      desc: "Controls (checkboxes, eye, action icons) render as disabled-tier because runtime is off. Stored values preserved. Relink is still the primary action semantically — the red LED and ⚠ on path are the cues, not a button highlight. × alive, LBL editable. Toggles store-not-apply.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = vHug(); g.itemSpacing = 2;
        g.appendChild(txt("enoent", F.m, 9, flat(C.danger, 0.7)));
        g.appendChild(txt("offline", F.m, 9, flat(C.danger, 0.5)));
        g.appendChild(txt("eacces", F.m, 9, flat(C.danger, 0.35)));
        return g;
      })()),
      title: "4 subtypes — tooltip differentiates",
      desc: "enoent: folder deleted/renamed. offline: drive disconnected. eacces: permission denied. other: IO error / broken symlink. Subtype stored in config, affects retry strategy. LED is red across all 4.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        const led = figma.createFrame();
        led.resize(6, 6); led.cornerRadius = 3;
        setFill(led, C.danger, 1);
        g.appendChild(led);
        g.appendChild(txt("name", F.m, 9, C.strokeMid));
        return g;
      })()),
      title: "Edge — Missing AND user-disabled",
      desc: "Row was force-disabled by × and path is ALSO offline. Two independent axes visible: LED red (path), name dim (user intent). Restore path → LED hollow dim (disabled, not missing). To reactivate: fix path AND × (restore).",
    },
  ]));

  // ── ANNOTATION CARD: Path color rules — NAME and PATH share one channel ────
  // Identity (name + path) collapses into ONE brightness channel; missing red
  // is a path-localized state signal kept separate from the identity channel.
  ann1.appendChild(annCard("Path color — follows NAME (one identity channel)", C.borderBright, [
    {
      demo: demoBox(86, 18, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("03_Assets", F.m, 10, C.borderBright));
        g.appendChild(txt("E:/…/03_Assets", F.r, 10, C.borderBright));
        return g;
      })()),
      title: "Healthy → both bright (borderBright #D7D7DA)",
      desc: "Identity channel = ONE color. Name and path render at the SAME brightness — together they tell you \"which row\". Splitting brightness across them adds a fake axis the user has to decode for nothing.",
    },
    {
      demo: demoBox(86, 18, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("_old_backup", F.m, 10, C.strokeMid));
        g.appendChild(txt("E:/archive/…", F.r, 10, C.strokeMid));
        return g;
      })()),
      title: "Soft-stop (disabled / busy / mirror-deleting) → both dim (strokeMid)",
      desc: "Whenever the row's identity is muted (cfg.subLocked or stateIndicator=disabled), name AND path drop to strokeMid together. The dimming reads as \"this row is paused\" without the user parsing two separate dim levels.",
    },
    {
      demo: demoBox(86, 18, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("03_Archive", F.m, 10, C.borderBright));
        g.appendChild(txt("⚠", F.b, 9, C.danger));
        g.appendChild(txt("…/03_Archive", F.r, 10, C.danger));
        return g;
      })()),
      title: "Missing → path is the EXCEPTION (red + ⚠)",
      desc: "Path turns red because the path itself is the unreachable thing — localized state signal. Name stays at identity-bright (borderBright) because we still know which row it is. ⚠ prefix anchors the signal to the path token specifically.",
    },
    {
      demo: demoBox(86, 18, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("_archived_disk", F.m, 10, C.strokeMid));
        g.appendChild(txt("⚠", F.b, 9, C.danger));
        g.appendChild(txt("G:/archive/…", F.r, 10, C.danger));
        return g;
      })()),
      title: "Edge — Missing + user-disabled (two independent signals)",
      desc: "Both axes light up: name=dim (user paused) + path=red (FS unreachable). Two channels saying two different things — orthogonal because they encode different facts. This is why path's missing-red sits OUTSIDE the identity channel: it can co-exist with any name color.",
    },
    {
      demo: demoBox(86, 18, txt("rule", F.s, 10, C.textDim)),
      title: "Implementation in row()",
      desc: "pathColor = cfg.pathColor || (isPathMissing ? C.danger : nameColor). One line, two signals: \"missing wins for path\", otherwise \"path follows identity\". User-supplied cfg.pathColor still overrides for special cases.",
    },
  ]));

  // ── ANNOTATION CARD: Column architecture — fixed lanes + flexible identity ──
  // LEAN demos: chip() + txt() only. No bare figma.createFrame() inside IIFEs
  // (that handcrafted-frame pattern caused 70% panel collapse in earlier draft).
  ann1.appendChild(annCard("Column architecture — fixed lanes + flexible identity", C.borderBright, [
    {
      demo: demoBox(86, 18, (function() {
        const g = hHug();
        g.itemSpacing = 4;
        g.counterAxisAlignItems = "CENTER";
        g.appendChild(chip("ST", C.accent, 0.18));
        g.appendChild(txt("← left", F.r, 9, C.textDim));
        return g;
      })()),
      title: "ST — left-pinned, fixed 32px",
      desc: "State LED column hugs the left edge. Width fixed. Not user-resizable, never hides. Always the first glyph users scan when reading a row.",
    },
    {
      demo: demoBox(86, 18, (function() {
        const g = hHug();
        g.itemSpacing = 3;
        g.counterAxisAlignItems = "CENTER";
        g.appendChild(chip("SUB", C.borderBright, 0.10));
        g.appendChild(chip("…", C.borderBright, 0.10));
        g.appendChild(chip("LBL", C.borderBright, 0.10));
        return g;
      })()),
      title: "Right-pinned cluster — locked order, locked widths",
      desc: "SUB · REL · SEQ · FLT · EYE · ACTIONS · LBL · × (and DEL when Danger zone enables) — sit against right edge in this exact order. Cannot be reordered, resized, or moved. Headers center over their content.",
    },
    {
      demo: demoBox(86, 18, (function() {
        const g = hHug();
        g.itemSpacing = 4;
        g.counterAxisAlignItems = "CENTER";
        g.appendChild(chip("NAME", C.amber, 0.18));
        g.appendChild(txt("⇿", F.b, 11, C.amber));
        g.appendChild(chip("PATH", C.amber, 0.18));
        return g;
      })()),
      title: "NAME ⇿ PATH — flexible, only the divider is draggable",
      desc: "Together absorb all space between ST and right cluster. User drags the SEPARATOR to reallocate width — neither hides, both always visible.",
    },
    {
      demo: demoBox(86, 18, (function() {
        const g = hHug();
        g.itemSpacing = 6;
        g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("⇔", F.b, 14, C.accent));
        g.appendChild(txt("window", F.m, 10, C.textDim));
        return g;
      })()),
      title: "Adaptive — panel reflows with window",
      desc: "Whole panel grows/shrinks with window. NAME ⇿ PATH expand proportionally, keeping user-set divider ratio. ST + right widths constant.",
    },
    {
      demo: demoBox(86, 18, (function() {
        const g = hHug();
        g.itemSpacing = 3;
        g.counterAxisAlignItems = "CENTER";
        g.appendChild(chip("×", C.strokeMid, 0.18));
        g.appendChild(chip("LBL", C.strokeMid, 0.18));
        g.appendChild(chip("ACT", C.strokeMid, 0.18));
        return g;
      })()),
      title: "Narrow window → rightmost columns hide first",
      desc: "Shed order: × → LBL → ACTIONS → EYE → FLT → SEQ → REL → SUB. NAME, PATH, ST never hide. Hidden columns surface via row hover (parked).",
    },
    {
      demo: demoBox(86, 18, txt("Simplified", F.s, 10, C.textDim)),
      title: "Simplified mode — nothing draggable",
      desc: "Per Tier A: only window resize matters. NAME⇿LNK separator fixed (no PATH in Simplified). Removes \"how do I reset my drag?\" failure mode for casual users.",
    },
    {
      demo: demoBox(86, 18, txt("rule", F.s, 10, C.textDim)),
      title: "What the user CAN touch",
      desc: "(1) Window size — adapts everything. (2) NAME ⇿ PATH separator (Advanced only). (3) Hide filter + Sort — change which rows show, not column geometry. Everything else locked by design.",
    },
  ]));

  ann1.appendChild(annCard("Simplified / Advanced mode (§2)", C.accent, [
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("Advanced", F.m, 9, C.borderBright));
        g.appendChild(toggle(true));
        return g;
      })()),
      title: "Toggle \"Advanced\" in panel header",
      desc: "Default state OFF → Simplified view (fewer columns). Toggle ON reveals advanced columns inline. Panel shown here is in Advanced mode (all columns visible). Renamed / expanded from v1.2 \"Auto Sync\" — one toggle governs both behavior + chrome.",
    },
    {
      demo: demoBox(32, 20, txt("S · N · ⌕ · L · ×", F.m, 8, C.textDim)),
      title: "Simplified columns",
      desc: "STATE · NAME (hover=path) · LNK · LBL · × — only 5 columns. Hidden: PATH · SUB · REL · SEQ · FLT · EYE · DEL · ACTIONS. SUB defaults ON (recursive). SEQ forced ON via Premiere native. EYE forced ON. DEL hidden regardless of Settings.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("▾ 03_Archive", F.m, 9, C.borderBright));
        g.appendChild(loadIcon("search", C.danger, 10));
        return g;
      })()),
      title: "⌕ symmetric with chevron",
      desc: "Relink icon in dedicated LNK column — always visible, color matches state. Chevron left-sticks, ⌕ right-sticks. Semantic binding: ⌕ is a row-level recovery action, not a column-level generic.",
    },
    {
      demo: demoBox(32, 20, eyeToggle("on")),
      title: "EYE only in Advanced",
      desc: "In Simplified, EYE forced ON globally — \"auto-import everything\". Per-row EYE override requires Advanced. Stored EYE values preserved across toggle: switch Advanced → Simplified preserves overrides silently, reapplied on switch back.",
    },
  ]));

  ann1.appendChild(annCard("× action matrix (§6 / spec §14)", C.textDim, [
    {
      demo: demoBox(42, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("root", F.s, 8, C.textDim, undefined, 0.5));
        g.appendChild(loadIcon("x", C.textDim, 12));
        return g;
      })()),
      title: "Parent → remove from tracking",
      desc: "Tooltip: \"Remove folder from SheepDog\". Click → confirm → config entry deleted. Disk files UNTOUCHED (plugin doesn't own FS). Always available — parent is config-layer only.",
    },
    {
      demo: demoBox(42, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("child", F.s, 8, C.textDim, undefined, 0.5));
        g.appendChild(loadIcon("x", C.textDim, 12));
        return g;
      })()),
      title: "Child healthy → disable (toggle)",
      desc: "Tooltip: \"Disable watching\". Click → watching stops on this row, stored values preserved. Reversible via × again. Plugin CAN'T delete child file — OS owns disk.",
    },
    {
      demo: demoBox(42, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("off", F.s, 8, C.strokeMid, undefined, 0.5));
        g.appendChild(loadIcon("x", C.textDim, 12));
        return g;
      })()),
      title: "Child disabled → enable (toggle)",
      desc: "Tooltip: \"Enable watching\". Click → row re-activates, stored overrides restored. Opposite direction of disable. Safe reversible toggle.",
    },
    {
      demo: demoBox(42, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        const led = figma.createFrame();
        led.resize(4, 4); led.cornerRadius = 2;
        setFill(led, C.danger, 1);
        g.appendChild(led);
        g.appendChild(loadIcon("x", C.textDim, 12));
        return g;
      })()),
      title: "Missing → delete entry",
      desc: "Tooltip: \"Delete entry — path already gone\". Click → config cleanup. Can't enable — file missing from FS. Only way to get rid of the row. User must relink first if they want to re-activate.",
    },
    {
      demo: demoBox(42, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        const led = figma.createFrame();
        led.resize(6, 6); led.cornerRadius = 3;
        led.fills = []; setStroke(led, C.accent, 1, 1);
        g.appendChild(led);
        g.appendChild(loadIcon("x", C.strokeMid, 12));
        return g;
      })()),
      title: "Busy → × locked",
      desc: "× renders in strokeMid, click ignored. Race prevention: removing row mid-import would corrupt in-flight bin writes. Re-available when busy clears.",
    },
    {
      demo: demoBox(42, 20, txt("OS", F.s, 10, C.textDim)),
      title: "Want to delete a child? Use OS first",
      desc: "Plugin does NOT offer child delete. To remove a child folder: delete in Finder/CLI → row becomes missing → × cleans up plugin config. Explicit two-step respects OS ownership. Mirror DEL is separate opt-in (Settings) for cross-boundary cascade.",
    },
  ]));

  ann1.appendChild(annCard("Hide filter — funnel-x (spec §15)", C.accent, [
    {
      demo: demoBox(72, 32, (function() {
        const g = hHug(); g.itemSpacing = 8; g.counterAxisAlignItems = "CENTER";
        g.appendChild(btnFilter(false));
        g.appendChild(btnFilter(true));
        return g;
      })()),
      title: "funnel-x — OFF / ON states",
      desc: "Left (OFF): funnel + × both #9999A1 — whole icon quiet. Right (ON): funnel #D7D7DA bright, × stays #9999A1 dim. Funnel body alone lights up as the \"engaged\" signal — × is always-subtle modifier.",
    },
    {
      demo: demoBox(72, 20, (function() {
        const g = hHug(); g.itemSpacing = 3; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("6 rows ·", F.r, 9, C.textDim));
        g.appendChild(txt("4 missing hidden", F.m, 9, C.danger));
        return g;
      })()),
      title: "Footer counter — RED for missing-hidden",
      desc: "When filter ON, footer shows hidden counts. Missing count rendered red — persistent soft reminder. Out-of-sight ≠ out-of-mind. Disabled-hidden count stays textDim (non-urgent).",
    },
    {
      demo: demoBox(42, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(loadIcon("chevronRight", C.textDim, 10));
        g.appendChild(txt("03_Assets", F.m, 9, C.borderBright));
        return g;
      })()),
      title: "Chevron — only if has children",
      desc: "Parent with children → chevron shown (even if all hidden by filter). Leaf row → no chevron. Chevron = structural signal (\"container\"), not visibility signal.",
    },
  ]));

  ann1.appendChild(annCard("↻ Check & Import — activity-driven", C.borderBright, [
    {
      demo: demoBox(72, 32, (function() {
        const g = hHug(); g.itemSpacing = 8; g.counterAxisAlignItems = "CENTER";
        g.appendChild(btnCheckImport(false));
        g.appendChild(btnCheckImport(true));
        return g;
      })()),
      title: "Idle / active states (same chrome)",
      desc: "Outlined 28×28 square, no fill. Idle (left): icon #9999A1 dim. Active (right): icon #D7D7DA bright. Feedback purely via icon brightness — no blue fill, matches filter button chrome.",
    },
    {
      demo: demoBox(32, 20, txt("user", F.m, 9, C.textDim)),
      title: "Click → triggers mass check+import",
      desc: "User-initiated action. Click starts bulk fs walk + Premiere importFiles for all (or selected) rows. Icon brightens to active for duration of import job, auto-dims when done.",
    },
  ]));

  // ── ANNOTATION CARD: × / ← row action · context glyph + hover (spec §14) ────
  // Glyph swaps per row state — × for destroy/disable/remove, ← for restore.
  // Hover colour encodes outcome class:
  //   red   = destructive (missing/root)
  //   blue  = positive restore (disabled child re-enable)
  //   text  = neutral safe (healthy disable — reversible)
  // ← (arrow-left) chosen over ↺: same diamond form-factor as ×, less visual chaos.
  ann1.appendChild(annCard("× / ← row action — context glyph + hover (spec §14)", C.danger, [
    {
      demo: demoBox(52, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("healthy", F.s, 8, C.textDim, undefined, 0.4));
        g.appendChild(loadIcon("x", C.textDim, 14));
        g.appendChild(txt("→", F.r, 10, C.textDim));
        g.appendChild(loadIcon("x", C.borderBright, 14));
        return g;
      })()),
      title: "Healthy child → × · safe hover (text brighten)",
      desc: "Rest × in textDim. Hover brightens to text. Click disables watching — row stays in config, stored settings preserved. Disabled = soft-stop, like SUB=off. Reversible via ← later. No red: plugin doesn't delete FS.",
    },
    {
      demo: demoBox(52, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("disabled", F.s, 8, C.strokeMid, undefined, 0.4));
        g.appendChild(loadIcon("arrowLeft", C.textDim, 12));
        g.appendChild(txt("→", F.r, 10, C.textDim));
        g.appendChild(loadIcon("arrowLeft", C.accent, 12));
        return g;
      })()),
      title: "Disabled child → ← · BLUE hover (restore)",
      desc: "Glyph SWAPS to arrow-left ← — diamond form-factor matches × geometrically (less visual hash) but reads \"reverse soft-stop\". Hover turns BLUE (accent) — positive/restore signal mirrors × hover going RED for destructive. Click resumes watching; stored overrides re-applied. Disabled rows are soft-stopped (existing imports stay legitimate, no new files); ← lifts the soft-stop.",
    },
    {
      demo: demoBox(52, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        const led = figma.createFrame();
        led.resize(4, 4); led.cornerRadius = 2;
        setFill(led, C.danger, 1);
        g.appendChild(led);
        g.appendChild(loadIcon("x", C.textDim, 14));
        g.appendChild(txt("→", F.r, 10, C.textDim));
        g.appendChild(loadIcon("x", C.danger, 14));
        return g;
      })()),
      title: "Missing → × · destructive hover (RED)",
      desc: "Path already gone from FS. × deletes the CONFIG entry — only way to remove the row from the tree. Hover turns red — irreversible (no Cmd+Z after confirm). Matches missing LED red.",
    },
    {
      demo: demoBox(52, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("root", F.s, 8, C.textDim, undefined, 0.4));
        g.appendChild(loadIcon("x", C.textDim, 14));
        g.appendChild(txt("→", F.r, 10, C.textDim));
        g.appendChild(loadIcon("x", C.danger, 14));
        return g;
      })()),
      title: "Parent / root → × · destructive hover (RED)",
      desc: "Removes folder from SheepDog tracking entirely. Disk untouched — just config cleanup. Red hover signals \"config-level destroy, not recoverable from UI\". Confirm dialog protects the click.",
    },
    {
      demo: demoBox(52, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        const led = figma.createFrame();
        led.resize(6, 6); led.cornerRadius = 3;
        led.fills = []; setStroke(led, C.accent, 1, 1);
        g.appendChild(led);
        g.appendChild(loadIcon("x", C.strokeMid, 14));
        return g;
      })()),
      title: "Busy → × locked (no hover effect)",
      desc: "During import, × renders strokeMid and ignores click. Race-prevention: removing row mid-import would corrupt in-flight bin writes. Re-available immediately when busy clears.",
    },
    {
      demo: demoBox(52, 20, txt("§13", F.s, 10, C.textDim)),
      title: "Plugin boundary — always config-layer only",
      desc: "× (and ↺) touch ONLY SheepDog's config. Plugin never deletes FS files. OS-owned destroy routes through Mirror DEL (spec §9 + §13): Premiere bin delete + Mirror DEL on = source files trashed with timer + cancel. No other FS-destroy path exists.",
    },
  ]));

  sec1Row.appendChild(ann1);
  sec1.appendChild(sec1Row);
  root.appendChild(sec1);

  // ==================================================
  // §2 — Simplified view · Advanced toggle OFF
  // Tier A columns: STATE · NAME (hover=path) · LNK · LBL · × (5 cols).
  // Globals: EYE forced ON · SEQ forced ON (Premiere native) · SUB default ON ·
  // DEL hidden regardless of Settings · REL/FLT default OFF.
  // ==================================================

  const sec2 = vSec(contentW);
  sec2.itemSpacing = 16;
  sec2.appendChild(sectionTitle(
    "§2 — Simplified view · Advanced toggle OFF",
    "Minimal chrome. STATE · NAME (hover=path) · LNK · LBL · ×. Only 5 columns. Globals: EYE forced ON · SEQ forced ON (Premiere auto-detect) · SUB default ON · DEL hidden · REL/FLT default OFF. Default view for new users.",
    contentW
  ));

  const sec2Row = hSec(contentW);
  sec2Row.itemSpacing = 40;
  sec2Row.counterAxisAlignItems = "MIN";

  const simpPanel = vSec(PANEL_SIMP_W);
  simpPanel.cornerRadius = 6;
  simpPanel.clipsContent = true;
  setFill(simpPanel, C.panel, 1);
  setStroke(simpPanel, C.border, 1, 1);
  simpPanel.itemSpacing = 0;

  simpPanel.appendChild(panelHeaderSimplified(PANEL_SIMP_W));
  simpPanel.appendChild(divider(PANEL_SIMP_W, C.border, 1));
  simpPanel.appendChild(columnHeaderBarSimplified(PANEL_SIMP_W));
  simpPanel.appendChild(divider(PANEL_SIMP_W, C.border, 1));

  // Tree order: children of 03_Assets live INSIDE its expansion (rows 2–3),
  // then roots follow (day_02, _old_backup, external_footage).
  const simpRows = [
    { tree: "expanded", stateIndicator: "healthy", name: "03_Assets", label: C.labelCerulean },
    { indent: 18, tree: "expanded", stateIndicator: "healthy", name: "01_Video", label: null, labelInherited: true },
    { indent: 18, tree: "collapsed", stateIndicator: "missing", name: "03_Archive", label: null, labelInherited: true },
    { tree: "collapsed", stateIndicator: "busy", subLocked: true, name: "day_02", label: C.labelMango },
    { tree: "collapsed", stateIndicator: "disabled", name: "_old_backup", label: null, labelInherited: true, nameColor: C.strokeMid },
    { tree: "collapsed", stateIndicator: "missing", name: "external_footage", label: C.labelIris },
  ];

  for (const cfg of simpRows) {
    simpPanel.appendChild(rowSimplified(cfg, PANEL_SIMP_W));
    simpPanel.appendChild(divider(PANEL_SIMP_W, C.border, 0.25));
  }
  simpPanel.appendChild(footerSimplified("6 rows  ·  1 busy  ·  2 missing  ·  1 disabled", PANEL_SIMP_W));
  sec2Row.appendChild(simpPanel);

  const simpAnn = vSec(ANN_W);
  simpAnn.itemSpacing = 20;
  simpAnn.appendChild(annCard("Simplified — what differs from Advanced", C.accent, [
    {
      demo: demoBox(40, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("Advanced", F.m, 9, C.borderBright));
        g.appendChild(toggle(false));
        return g;
      })()),
      title: "Toggle OFF = Simplified (default)",
      desc: "Default state for new users. Panel shows 5 columns. Flip toggle ON to reveal PATH, SUB, REL, SEQ, FLT, EYE, DEL, ACTIONS — panel morphs in place, no separate screen.",
    },
    {
      demo: demoBox(32, 20, actionIcon("⌕", C.borderBright)),
      title: "Relink in dedicated column (not red)",
      desc: "Compact ⌕ column always visible. Color borderBright on active rows, strokeMid on disabled/missing/busy rows — matches row state but never red. No refresh, no magnet — only relink.",
    },
    {
      demo: demoBox(32, 20, txt("hover→path", F.m, 9, C.textDim)),
      title: "Path reveal on NAME hover",
      desc: "No visible PATH column. Hover on NAME → tooltip shows full path. Consistent gesture: hover = inspect. Works on all row states.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(checkbox("on")); g.appendChild(eyeToggle("on")); return g;
      })()),
      title: "SUB · SEQ · EYE forced ON globally",
      desc: "All three hidden in Simplified. SUB toggle only affects FUTURE fs events — initial walk is irreversible, so post-hoc SUB=off helps little for casual users. SEQ delegated to Premiere's importAsNumberedStills (native sequence detection). EYE forced ON = \"auto-import all\". Stored per-row values preserved silently; reapplied when Advanced toggles ON.",
    },
    {
      demo: demoBox(32, 20, txt("R F D", F.s, 9, C.strokeMid)),
      title: "REL · FLT · DEL hidden",
      desc: "REL/FLT default OFF in Settings. DEL hidden regardless of its Settings toggle (destructive feature → kept out of Easy mode entirely). All three available in Advanced.",
    },
  ]));
  sec2Row.appendChild(simpAnn);
  sec2.appendChild(sec2Row);
  root.appendChild(sec2);

  // ==================================================
  // §3 — Tier model · 3-click cycle · Root constraint
  // Spec §1.12. Single click cycles through 3 tier states for child rows;
  // roots degrade to 2-state (no inherited tier available).
  // ==================================================

  const sec3 = vSec(contentW);
  sec3.itemSpacing = 20;
  sec3.appendChild(sectionTitle(
    "§3 — Tier model · 3-click cycle + Root constraint",
    "Single click cycles through 3 tier states (Discord-precedent). Both checkbox and eye follow identical cycle logic. Roots degrade to 2-state (inherited tier physically impossible — no parent cascade).",
    contentW
  ));

  // ---- Part A: 3-click cycle for checkbox + eye ----
  const sec3aRow = hSec(contentW);
  sec3aRow.itemSpacing = 40;
  sec3aRow.counterAxisAlignItems = "MIN";

  const cycleCol = vSec(680);
  cycleCol.itemSpacing = 32;

  const chkCycleWrap = vSec(680);
  chkCycleWrap.itemSpacing = 12;
  chkCycleWrap.appendChild(txt("Checkbox cycle", F.s, 13, C.borderBright));
  const chkCycleRow = hHug();
  chkCycleRow.itemSpacing = 16;
  chkCycleRow.counterAxisAlignItems = "CENTER";
  chkCycleRow.appendChild(cycleCell("checkbox", "inherited-on", "inherited-on\n(dim)", "1"));
  chkCycleRow.appendChild(compactArrow("pin"));
  chkCycleRow.appendChild(cycleCell("checkbox", "on", "overridden-on\n(bright)", "2"));
  chkCycleRow.appendChild(compactArrow("toggle"));
  chkCycleRow.appendChild(cycleCell("checkbox", "off", "overridden-off\n(bright)", "3"));
  chkCycleRow.appendChild(compactArrow("unpin"));
  const chkLoopLabel = hHug();
  chkLoopLabel.itemSpacing = 4;
  chkLoopLabel.counterAxisAlignItems = "CENTER";
  chkLoopLabel.appendChild(txt("back to 1", F.r, 10, C.textDim));
  chkCycleRow.appendChild(chkLoopLabel);
  chkCycleWrap.appendChild(chkCycleRow);
  chkCycleWrap.appendChild(txt(
    "inherited (no stored) → pin → overridden-same → toggle → overridden-opposite → unpin → inherited",
    F.r, 11, C.textDim, 17
  ));
  cycleCol.appendChild(chkCycleWrap);
  cycleCol.appendChild(divider(680, C.border, 0.3));

  const eyeCycleWrap = vSec(680);
  eyeCycleWrap.itemSpacing = 12;
  eyeCycleWrap.appendChild(txt("Eye cycle", F.s, 13, C.borderBright));
  const eyeCycleRow = hHug();
  eyeCycleRow.itemSpacing = 16;
  eyeCycleRow.counterAxisAlignItems = "CENTER";
  eyeCycleRow.appendChild(cycleCell("eye", "inherited-on", "inherited-on\n(dim)", "1"));
  eyeCycleRow.appendChild(compactArrow("pin"));
  eyeCycleRow.appendChild(cycleCell("eye", "on", "overridden-on\n(bright)", "2"));
  eyeCycleRow.appendChild(compactArrow("toggle"));
  eyeCycleRow.appendChild(cycleCell("eye", "off", "overridden-off\n(bright)", "3"));
  eyeCycleRow.appendChild(compactArrow("unpin"));
  const eyeLoopLabel = hHug();
  eyeLoopLabel.itemSpacing = 4;
  eyeLoopLabel.counterAxisAlignItems = "CENTER";
  eyeLoopLabel.appendChild(txt("back to 1", F.r, 10, C.textDim));
  eyeCycleRow.appendChild(eyeLoopLabel);
  eyeCycleWrap.appendChild(eyeCycleRow);
  eyeCycleWrap.appendChild(txt(
    "Same logic, different glyphs. Eye open = on (watching), eye closed = off (auto-import disabled).",
    F.r, 11, C.textDim, 17
  ));
  cycleCol.appendChild(eyeCycleWrap);
  sec3aRow.appendChild(cycleCol);

  sec3aRow.appendChild(annCard("3-click cycle — data model", C.accent, [
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(checkbox("inherited-on")); return g;
      })()),
      title: "Inherited — no stored value",
      desc: "effective = parent cascade (computed). No config entry for this column. Rendered dim to show the effective value without claiming ownership.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(checkbox("on")); return g;
      })()),
      title: "Overridden — stored explicit value",
      desc: "Click 1 (pin): effective value snapshotted into stored. Row decoupled from parent cascade. Parent changes during override do NOT affect this row — that is why the user pinned.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(checkbox("off")); return g;
      })()),
      title: "Toggle within override (click 2)",
      desc: "Stored value flips. Still decoupled. 150ms fade on tier promote in production code (static in Figma). Precedent: Discord permissions tri-state.",
    },
    {
      demo: demoBox(32, 20, txt("unpin", F.m, 9, C.textDim)),
      title: "Unpin (click 3) — resync",
      desc: "Stored value deleted. Resyncs to parent's CURRENT value (not historical). Parent may have changed while child was overridden — unpin picks up that current state.",
    },
  ]));

  sec3.appendChild(sec3aRow);

  // ---- Part B: Root constraint (2-state vs 3-state) ----
  sec3.appendChild(divider(contentW, C.border, 0.25));

  const sec3bRow = hSec(contentW);
  sec3bRow.itemSpacing = 40;
  sec3bRow.counterAxisAlignItems = "MIN";

  const stateSpaceCol = vSec(700);
  stateSpaceCol.itemSpacing = 24;

  const rootPanel = vSec(330);
  rootPanel.itemSpacing = 12;
  rootPanel.appendChild(txt("Root — 2-state toggle (no inherited)", F.s, 13, C.borderBright));
  const rootCycleRow = hHug();
  rootCycleRow.itemSpacing = 16;
  rootCycleRow.counterAxisAlignItems = "CENTER";
  rootCycleRow.appendChild(cycleCell("checkbox", "off", "overridden-off", "1"));
  rootCycleRow.appendChild(compactArrow("toggle"));
  rootCycleRow.appendChild(cycleCell("checkbox", "on", "overridden-on", "2"));
  rootCycleRow.appendChild(compactArrow("toggle"));
  const rootLoopBack = hHug();
  rootLoopBack.itemSpacing = 4;
  rootLoopBack.counterAxisAlignItems = "CENTER";
  rootLoopBack.appendChild(txt("back to 1", F.r, 10, C.textDim));
  rootCycleRow.appendChild(rootLoopBack);
  rootPanel.appendChild(rootCycleRow);
  rootPanel.appendChild(txt("No inherited state. Tooltip: \"Toggle (root, no inherited state)\".", F.r, 11, C.textDim, 17));
  stateSpaceCol.appendChild(rootPanel);
  stateSpaceCol.appendChild(divider(700, C.border, 0.3));

  const childPanel = vSec(700);
  childPanel.itemSpacing = 12;
  childPanel.appendChild(txt("Child — 3-state cycle (full)", F.s, 13, C.borderBright));
  const childCycleRow = hHug();
  childCycleRow.itemSpacing = 16;
  childCycleRow.counterAxisAlignItems = "CENTER";
  childCycleRow.appendChild(cycleCell("checkbox", "inherited-on", "inherited-on", "1"));
  childCycleRow.appendChild(compactArrow("pin"));
  childCycleRow.appendChild(cycleCell("checkbox", "on", "overridden-on", "2"));
  childCycleRow.appendChild(compactArrow("toggle"));
  childCycleRow.appendChild(cycleCell("checkbox", "off", "overridden-off", "3"));
  childCycleRow.appendChild(compactArrow("unpin"));
  const childLoopBack = hHug();
  childLoopBack.itemSpacing = 4;
  childLoopBack.counterAxisAlignItems = "CENTER";
  childLoopBack.appendChild(txt("back to 1", F.r, 10, C.textDim));
  childCycleRow.appendChild(childLoopBack);
  childPanel.appendChild(childCycleRow);
  childPanel.appendChild(txt("Full 3-state. Tooltip: \"Cycle: pin · toggle · reset.\"", F.r, 11, C.textDim, 17));
  stateSpaceCol.appendChild(childPanel);

  sec3bRow.appendChild(stateSpaceCol);
  sec3bRow.appendChild(annCard("Root constraint — physics, not design choice", C.borderBright, [
    {
      demo: demoBox(32, 20, txt("2", F.b, 14, C.textDim)),
      title: "Root has no parent to inherit from",
      desc: "State-space = {overridden-on, overridden-off}. The inherited tier is physically impossible — there is no cascade source. Cycle degrades to toggle. This is not an inconsistency — it is physics.",
    },
    {
      demo: demoBox(32, 20, txt("3", F.b, 14, C.accent)),
      title: "Child has parent cascade",
      desc: "State-space = {inherited, overridden-same, overridden-opposite}. All 3 tiers available. Full cycle usable.",
    },
    {
      demo: demoBox(32, 20, txt("?", F.b, 14, C.textDim)),
      title: "Tooltips educate asymmetry",
      desc: "First-hover on mixed selection: root cell shows \"Toggle (no inherited state)\", child cell shows \"Cycle: pin · toggle · reset. Selected roots hold at last value.\" Standard hover elsewhere.",
    },
  ]));
  sec3.appendChild(sec3bRow);
  root.appendChild(sec3);

  // ==================================================
  // §4 — Bulk grammar · root cascade · children-only · mixed (follow-as-capable)
  // ==================================================

  const sec4 = vSec(contentW);
  sec4.itemSpacing = 20;
  sec4.appendChild(sectionTitle(
    "§4 — Bulk grammar",
    "Click-on-cell propagates to selection. Clicked-cell state-space determines cycle depth. Root cell drives 2-cycle (children follow); child cell drives 3-cycle (roots hold at overridden step — \"follow as capable, pass when can't\").",
    contentW
  ));

  // ---- Part A: Root-driven bulk cascade ----
  sec4.appendChild(txt("A · Bulk cascade via root click", F.s, 14, C.white, 18, 0.3));

  const sec4aRow = hSec(contentW);
  sec4aRow.itemSpacing = 24;
  sec4aRow.counterAxisAlignItems = "MIN";
  const MP3W = 320;

  const before4aWrap = vSec(MP3W);
  before4aWrap.itemSpacing = 8;
  before4aWrap.appendChild(txt("BEFORE", F.s, 12, C.textDim, undefined, 1));
  const before4aPanel = miniPanel(MP3W);
  before4aPanel.appendChild(miniColHeader(MP3W));
  before4aPanel.appendChild(divider(MP3W, C.border, 1));
  before4aPanel.appendChild(miniRow({ name: "Projects", root: true, eyeVariant: "on", selected: true }, MP3W));
  before4aPanel.appendChild(divider(MP3W, C.border, 0.2));
  before4aPanel.appendChild(miniRow({ name: "01_Clients", indent: 16, eyeVariant: "inherited-on", selected: true }, MP3W));
  before4aPanel.appendChild(divider(MP3W, C.border, 0.2));
  before4aPanel.appendChild(miniRow({ name: "02_Internal", indent: 16, eyeVariant: "inherited-on", selected: true }, MP3W));
  before4aPanel.appendChild(divider(MP3W, C.border, 0.2));
  before4aPanel.appendChild(miniRow({ name: "03_Archive", indent: 16, eyeVariant: "off", selected: true }, MP3W));
  before4aPanel.appendChild(divider(MP3W, C.border, 0.2));
  before4aPanel.appendChild(miniRow({ name: "04_Trash", indent: 16, eyeVariant: "off", selected: true }, MP3W));
  before4aWrap.appendChild(before4aPanel);
  before4aWrap.appendChild(txt("Root: overridden-on. Children: mixed.", F.r, 10, C.textDim, 14));

  const arrow4aWrap = vHug();
  arrow4aWrap.itemSpacing = 8;
  arrow4aWrap.counterAxisAlignItems = "CENTER";
  const arrowBox4a = figma.createFrame();
  arrowBox4a.resize(48, 48);
  arrowBox4a.layoutMode = "HORIZONTAL";
  arrowBox4a.layoutSizingHorizontal = "FIXED";
  arrowBox4a.layoutSizingVertical = "FIXED";
  arrowBox4a.primaryAxisAlignItems = "CENTER";
  arrowBox4a.counterAxisAlignItems = "CENTER";
  setFillFlat(arrowBox4a, C.accent, 0.12);
  setStroke(arrowBox4a, C.accent, 0.4, 1);
  arrowBox4a.cornerRadius = 24;
  arrowBox4a.appendChild(txt(">", F.b, 18, C.accent));
  arrow4aWrap.appendChild(arrowBox4a);
  arrow4aWrap.appendChild(txt("Click root's", F.r, 10, C.textDim, 13));
  arrow4aWrap.appendChild(txt("eye cell", F.m, 10, C.borderBright, 13));

  const after4aWrap = vSec(MP3W);
  after4aWrap.itemSpacing = 8;
  after4aWrap.appendChild(txt("AFTER", F.s, 12, C.textDim, undefined, 1));
  const after4aPanel = miniPanel(MP3W);
  after4aPanel.appendChild(miniColHeader(MP3W));
  after4aPanel.appendChild(divider(MP3W, C.border, 1));
  after4aPanel.appendChild(miniRow({ name: "Projects", root: true, eyeVariant: "off", selected: true }, MP3W));
  after4aPanel.appendChild(divider(MP3W, C.border, 0.2));
  after4aPanel.appendChild(miniRow({ name: "01_Clients", indent: 16, eyeVariant: "off", selected: true }, MP3W));
  after4aPanel.appendChild(divider(MP3W, C.border, 0.2));
  after4aPanel.appendChild(miniRow({ name: "02_Internal", indent: 16, eyeVariant: "off", selected: true }, MP3W));
  after4aPanel.appendChild(divider(MP3W, C.border, 0.2));
  after4aPanel.appendChild(miniRow({ name: "03_Archive", indent: 16, eyeVariant: "off", selected: true }, MP3W));
  after4aPanel.appendChild(divider(MP3W, C.border, 0.2));
  after4aPanel.appendChild(miniRow({ name: "04_Trash", indent: 16, eyeVariant: "off", selected: true }, MP3W));
  after4aWrap.appendChild(after4aPanel);
  after4aWrap.appendChild(txt("All rows: overridden-off. Unified in 1 click.", F.r, 10, C.textDim, 14));

  sec4aRow.appendChild(before4aWrap);
  sec4aRow.appendChild(arrow4aWrap);
  sec4aRow.appendChild(after4aWrap);
  sec4aRow.appendChild(annCard("Root-driven bulk cascade", C.success, [
    { demo: demoBox(32, 20, eyeToggle("on")), title: "Root drives 2-cycle",
      desc: "Root has no inherited state. Click on root's cell with active selection = 2-state cycle applies. All selected rows sync to root's new value." },
    { demo: demoBox(32, 20, eyeToggle("off")), title: "All rows unified",
      desc: "After click: root = overridden-off, all children = overridden-off. Mixed state eliminated in 1 click. Use case: set eye on whole subtree to off." },
    { demo: demoBox(32, 20, txt("sel", F.m, 9, C.accent)), title: "Selection highlight preserved",
      desc: "Rows remain selected post-click. Finder/Photos-style subtle tint, no border (Premiere parity). Next click continues the cycle." },
  ]));
  sec4.appendChild(sec4aRow);

  // ---- Part B: Children-only cycle (click child × 3) ----
  sec4.appendChild(divider(contentW, C.border, 0.25));
  sec4.appendChild(txt("B · Children-only bulk cycle (click child × 3)", F.s, 14, C.white, 18, 0.3));

  const sec4bRow = hSec(contentW);
  sec4bRow.itemSpacing = 16;
  sec4bRow.counterAxisAlignItems = "MIN";
  const MP4W = 210;

  function childrenPanel(label, rows4) {
    const wrap = vSec(MP4W);
    wrap.itemSpacing = 8;
    wrap.appendChild(txt(label, F.s, 11, C.textDim, undefined, 1));
    const p = miniPanel(MP4W);
    p.appendChild(miniColHeader(MP4W));
    p.appendChild(divider(MP4W, C.border, 1));
    for (var i = 0; i < rows4.length; i++) {
      p.appendChild(miniRow({ name: rows4[i].name, indent: 0, eyeVariant: rows4[i].eye, selected: true }, MP4W));
      if (i < rows4.length - 1) p.appendChild(divider(MP4W, C.border, 0.2));
    }
    wrap.appendChild(p);
    return wrap;
  }

  sec4bRow.appendChild(childrenPanel("BEFORE (mixed)", [
    { name: "Alpha", eye: "inherited-on" },
    { name: "Beta",  eye: "inherited-on" },
    { name: "Gamma", eye: "on" },
    { name: "Delta", eye: "off" },
  ]));
  function arrw(l) { const a = vHug(); a.itemSpacing = 4; a.counterAxisAlignItems = "CENTER";
    a.appendChild(txt(">", F.b, 14, C.borderStrong)); a.appendChild(txt(l, F.m, 9, C.accent, 12)); return a; }
  sec4bRow.appendChild(arrw("click 1"));
  sec4bRow.appendChild(childrenPanel("After click 1", [
    { name: "Alpha", eye: "on" }, { name: "Beta", eye: "on" }, { name: "Gamma", eye: "on" }, { name: "Delta", eye: "on" },
  ]));
  sec4bRow.appendChild(arrw("click 2"));
  sec4bRow.appendChild(childrenPanel("After click 2", [
    { name: "Alpha", eye: "off" }, { name: "Beta", eye: "off" }, { name: "Gamma", eye: "off" }, { name: "Delta", eye: "off" },
  ]));
  sec4bRow.appendChild(arrw("click 3"));
  sec4bRow.appendChild(childrenPanel("After click 3 (reset)", [
    { name: "Alpha", eye: "inherited-on" }, { name: "Beta", eye: "inherited-on" }, { name: "Gamma", eye: "inherited-on" }, { name: "Delta", eye: "inherited-on" },
  ]));
  sec4bRow.appendChild(annCard("Children-only bulk cycle", C.amber, [
    { demo: demoBox(32, 20, txt("3x", F.b, 12, C.amber)), title: "3 clicks = bulk reset to inherited",
      desc: "Children-only selection → full 3-cycle available. Click 1 unifies to overridden-on. Click 2 flips to off. Click 3 unpins all → inherited. Clicked cell determines the cycle path; others follow as capable." },
    { demo: demoBox(32, 20, eyeToggle("inherited-on")), title: "Inherited after reset",
      desc: "Click 3 deletes stored overrides. All children re-adopt parent cascade value. If parent is on, all show inherited-on (dim). Effective value consistent with cascade." },
  ], 380));
  sec4.appendChild(sec4bRow);

  // ---- Part C: Mixed root + children, click child cell ----
  sec4.appendChild(divider(contentW, C.border, 0.25));
  sec4.appendChild(txt("C · Mixed root + children · click child cell (follow-as-capable)", F.s, 14, C.white, 18, 0.3));

  const sec4cRow = hSec(contentW);
  sec4cRow.itemSpacing = 16;
  sec4cRow.counterAxisAlignItems = "MIN";

  function mixedPanel(label, rootCfg, childrenCfgs) {
    const wrap = vSec(MP4W);
    wrap.itemSpacing = 8;
    wrap.appendChild(txt(label, F.s, 11, C.textDim, undefined, 1));
    const p = miniPanel(MP4W);
    p.appendChild(miniColHeader(MP4W));
    p.appendChild(divider(MP4W, C.border, 1));
    p.appendChild(miniRow({ name: rootCfg.name, root: true, indent: 0, eyeVariant: rootCfg.eye, selected: true }, MP4W));
    p.appendChild(divider(MP4W, C.border, 0.2));
    for (var i = 0; i < childrenCfgs.length; i++) {
      p.appendChild(miniRow({ name: childrenCfgs[i].name, indent: 14, eyeVariant: childrenCfgs[i].eye, selected: true }, MP4W));
      if (i < childrenCfgs.length - 1) p.appendChild(divider(MP4W, C.border, 0.2));
    }
    wrap.appendChild(p);
    return wrap;
  }

  sec4cRow.appendChild(mixedPanel("BEFORE (mixed)",
    { name: "Projects", eye: "on" },
    [ { name: "Alpha", eye: "inherited-on" }, { name: "Beta",  eye: "inherited-on" }, { name: "Gamma", eye: "off" } ]
  ));
  sec4cRow.appendChild(arrw("click 1"));
  sec4cRow.appendChild(mixedPanel("After click 1",
    { name: "Projects", eye: "on" },
    [ { name: "Alpha", eye: "on" }, { name: "Beta", eye: "on" }, { name: "Gamma", eye: "on" } ]
  ));
  sec4cRow.appendChild(arrw("click 2"));
  sec4cRow.appendChild(mixedPanel("After click 2",
    { name: "Projects", eye: "off" },
    [ { name: "Alpha", eye: "off" }, { name: "Beta", eye: "off" }, { name: "Gamma", eye: "off" } ]
  ));
  sec4cRow.appendChild(arrw("click 3"));
  sec4cRow.appendChild(mixedPanel("After click 3 (root holds)",
    { name: "Projects", eye: "off" },
    [ { name: "Alpha", eye: "inherited-off" }, { name: "Beta", eye: "inherited-off" }, { name: "Gamma", eye: "inherited-off" } ]
  ));
  sec4cRow.appendChild(annCard("Mixed selection — follow / pass rule", C.amber, [
    { demo: demoBox(32, 20, txt("hold", F.b, 10, C.amber)), title: "Root holds at click 3",
      desc: "Children reach inherited step; root can't inherit (no parent cascade) → holds at its last overridden value (here: overridden-off). This is the \"pass when can't\" rule. Root stays bright (overridden tier), children dim (inherited tier) — two tiers visible side-by-side in same column." },
    { demo: demoBox(32, 20, txt("=", F.b, 14, C.amber)), title: "Effective value consistent",
      desc: "At click 3: root overridden-off + children inherited-off = all rows effectively OFF. \"Inherited\" means \"adopt parent's current\" → children adopt root's overridden-off. Visual tier differs, semantic state identical." },
    { demo: demoBox(32, 20, txt("vs A", F.b, 10, C.amber)), title: "Click on root vs click on child",
      desc: "Clicking ROOT cell (part A) triggers 2-state cycle — children follow, all stay in overridden tier, never reach inherited. Clicking CHILD cell (this part C) triggers 3-state cycle — children can reach inherited, root holds." },
  ], 380));
  sec4.appendChild(sec4cRow);
  root.appendChild(sec4);

  // ==================================================
  // §5 — Asymmetry tooltips · first-hover education
  // ==================================================

  const sec5 = vSec(contentW);
  sec5.itemSpacing = 20;
  sec5.appendChild(sectionTitle(
    "§5 — Asymmetry tooltips · first-hover education",
    "Mixed selection triggers variant tooltips. Root cell vs child cell show different text. Standard hover elsewhere.",
    contentW
  ));

  const sec5Row = hSec(contentW);
  sec5Row.itemSpacing = 48;
  sec5Row.counterAxisAlignItems = "MIN";

  const tooltipDemos = hSec(700);
  tooltipDemos.itemSpacing = 48;
  tooltipDemos.counterAxisAlignItems = "MIN";

  const rootTipWrap = vSec(300);
  rootTipWrap.itemSpacing = 8;
  rootTipWrap.appendChild(txt("Root's eye cell", F.s, 12, C.borderBright));
  const rootCellDemo = figma.createFrame();
  rootCellDemo.resize(40, 40);
  rootCellDemo.cornerRadius = 6;
  rootCellDemo.layoutMode = "HORIZONTAL";
  rootCellDemo.layoutSizingHorizontal = "FIXED";
  rootCellDemo.layoutSizingVertical = "FIXED";
  rootCellDemo.primaryAxisAlignItems = "CENTER";
  rootCellDemo.counterAxisAlignItems = "CENTER";
  setFillFlat(rootCellDemo, C.accent, 0.15);
  setStroke(rootCellDemo, C.accent, 0.5, 1);
  rootCellDemo.appendChild(eyeToggle("on"));
  rootTipWrap.appendChild(rootCellDemo);
  rootTipWrap.appendChild(tooltipBox("Toggle (root — no inherited state)", true));
  rootTipWrap.appendChild(txt("Tooltip on hover · root row · mixed selection", F.r, 10, C.textDim, 14));

  const childTipWrap = vSec(320);
  childTipWrap.itemSpacing = 8;
  childTipWrap.appendChild(txt("Child's eye cell", F.s, 12, C.borderBright));
  const childCellDemo = figma.createFrame();
  childCellDemo.resize(40, 40);
  childCellDemo.cornerRadius = 6;
  childCellDemo.layoutMode = "HORIZONTAL";
  childCellDemo.layoutSizingHorizontal = "FIXED";
  childCellDemo.layoutSizingVertical = "FIXED";
  childCellDemo.primaryAxisAlignItems = "CENTER";
  childCellDemo.counterAxisAlignItems = "CENTER";
  setFillFlat(childCellDemo, C.accent, 0.15);
  setStroke(childCellDemo, C.accent, 0.5, 1);
  childCellDemo.appendChild(eyeToggle("inherited-on"));
  childTipWrap.appendChild(childCellDemo);
  childTipWrap.appendChild(tooltipBox("Cycle: pin · toggle · reset\nSelected roots hold at last value.", true));
  childTipWrap.appendChild(txt("Tooltip on hover · child row · mixed selection", F.r, 10, C.textDim, 14));

  tooltipDemos.appendChild(rootTipWrap);
  tooltipDemos.appendChild(childTipWrap);
  sec5Row.appendChild(tooltipDemos);

  sec5Row.appendChild(annCard("Asymmetric tooltips — physics education", C.labelRose, [
    { demo: demoBox(32, 20, eyeToggle("on")), title: "Root cell hover (mixed selection)",
      desc: "\"Toggle (root — no inherited state)\". Educates that this is a 2-cycle, not a bug. Root state-space is smaller by physics, not design choice." },
    { demo: demoBox(32, 20, eyeToggle("inherited-on")), title: "Child cell hover (mixed selection)",
      desc: "\"Cycle: pin · toggle · reset. Selected roots hold at last value.\" Two lines. Explains the asymmetry and what happens to roots at the inherited step (they hold, not cycle backward)." },
    { demo: demoBox(32, 20, txt("std", F.m, 9, C.textDim)), title: "Standard tooltip elsewhere",
      desc: "Single-type selection (roots only or children only) shows simple column name or action description. Mixed-selection variant tooltips appear only when the asymmetry is relevant." },
  ]));
  sec5.appendChild(sec5Row);
  root.appendChild(sec5);

  // ==================================================
  // §6 — FLT model · v2 cascade
  // Revised 2026-04-25 per screenshot. "Double-OFF" rule:
  //   FLT=ON   → row has NO bin in Premiere. Subs flatten up.
  //   FLT=OFF  → row has OWN bin IFF its direct parent is FLT=OFF (or root).
  //             Otherwise swallowed — but its OWN subs still see FLT=OFF as their
  //             direct-parent config and benefit from the barrier.
  //   File placement → lands in the nearest surviving-bin ancestor.
  // ==================================================

  const sec6 = vSec(contentW);
  sec6.itemSpacing = 16;
  sec6.appendChild(sectionTitle(
    "§6 — FLT model · v2 cascade (revised 2026-04-25)",
    "FLT=ON row has NO bin. Files flow up to nearest FLT=OFF ancestor. FLT=OFF row gets own bin only when direct parent is also FLT=OFF — otherwise it's swallowed but still acts as a \"barrier\" for its own children.",
    contentW
  ));

  // ---- Rule card — double-OFF summary ----
  const fltRule = vSec(contentW);
  fltRule.cornerRadius = 8;
  setFill(fltRule, C.panel, 1);
  setStroke(fltRule, C.accent, 0.4, 1);
  fltRule.paddingTop = 16; fltRule.paddingBottom = 16;
  fltRule.paddingLeft = 20; fltRule.paddingRight = 20;
  fltRule.itemSpacing = 8;
  const fltRuleHead = hHug();
  fltRuleHead.itemSpacing = 10;
  fltRuleHead.counterAxisAlignItems = "CENTER";
  const fltRuleChip = figma.createFrame();
  fltRuleChip.resize(6, 6); fltRuleChip.cornerRadius = 3;
  setFill(fltRuleChip, C.accent, 1);
  fltRuleHead.appendChild(fltRuleChip);
  fltRuleHead.appendChild(txt("Rule — double-OFF for bin survival", F.s, 12, C.white, undefined, 0.5));
  fltRule.appendChild(fltRuleHead);

  fltRule.appendChild(txtW(
    "Row has OWN BIN in Premiere iff  self.FLT=OFF  AND  (parent.FLT=OFF OR self is root).  Every other combination → row swallowed, content flows up.",
    F.m, 12, C.borderBright, contentW - 40, 18
  ));
  fltRule.appendChild(txtW(
    "Important consequence: a FLT=OFF row whose direct parent is FLT=ON is itself swallowed, but it STILL acts as a barrier for its own children. A FLT=OFF grand-child inside it CAN survive (see pair B below — TEMP in RAW). That's why the rule looks at DIRECT parent, not any ancestor.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  sec6.appendChild(fltRule);

  const fltPairW = Math.floor((contentW - 20) / 2);

  function fltPair(labelText, diskLines, projectLines) {
    const pairWrap = vSec(contentW);
    pairWrap.itemSpacing = 8;
    const labelRow = hHug();
    labelRow.itemSpacing = 10;
    labelRow.counterAxisAlignItems = "CENTER";
    const labelChip = figma.createFrame();
    labelChip.resize(6, 6); labelChip.cornerRadius = 3;
    setFill(labelChip, C.accent, 1);
    labelRow.appendChild(labelChip);
    labelRow.appendChild(txt(labelText, F.s, 12, C.white, undefined, 0.3));
    pairWrap.appendChild(labelRow);

    const pairRow = hSec(contentW);
    pairRow.itemSpacing = 20;
    pairRow.counterAxisAlignItems = "MIN";
    pairRow.appendChild(treeMini("On disk (SOT)", diskLines, C.textDim, fltPairW));
    pairRow.appendChild(treeMini("In Premiere (resolved)", projectLines, C.accent, fltPairW));
    pairWrap.appendChild(pairRow);
    return pairWrap;
  }

  sec6.appendChild(fltPair(
    "A · Simple — day1=ON, RAW=OFF. RAW's direct parent is ON → RAW swallowed",
    [
      { glyph: "📁", text: "Footage", bold: true, tag: "FLT=OFF (own bin)", tagColor: C.success },
      { glyph: "  📄", text: "promo.mp4" },
      { glyph: "  📁", text: "day1", bold: true, tag: "FLT=ON (flat)", tagColor: C.amber },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📄", text: "shot_B.mp4" },
      { glyph: "    📁", text: "RAW", bold: true, tag: "FLT=OFF (own bin)", tagColor: C.success },
      { glyph: "      📄", text: "take_01.mxf" },
      { glyph: "      📄", text: "take_02.mxf" },
    ],
    [
      { glyph: "📂", text: "Footage", bold: true, tag: "FLT=OFF (own bin)", tagColor: C.success },
      { glyph: "  📄", text: "promo.mp4" },
      { glyph: "  📁", text: "day1", tag: "FLT=ON (flat — no bin)", tagColor: C.amber },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📄", text: "shot_B.mp4" },
      { glyph: "    📄", text: "take_01.mxf", tag: "from RAW (reason flat day1)", tagColor: C.textDim },
      { glyph: "    📄", text: "take_02.mxf", tag: "from RAW (reason flat day1)", tagColor: C.textDim },
    ]
  ));

  sec6.appendChild(fltPair(
    "B · Barrier survival — TEMP=OFF inside RAW=OFF (direct parent OFF) survives as bin",
    [
      { glyph: "📁", text: "Footage", bold: true, tag: "FLT=OFF (own bin)", tagColor: C.success },
      { glyph: "  📄", text: "promo.mp4" },
      { glyph: "  📁", text: "day1", bold: true, tag: "FLT=ON (flat)", tagColor: C.amber },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📄", text: "shot_B.mp4" },
      { glyph: "    📁", text: "RAW", bold: true, tag: "FLT=OFF (own bin)", tagColor: C.success },
      { glyph: "      📄", text: "take_01.mxf" },
      { glyph: "      📄", text: "take_02.mxf" },
      { glyph: "      📁", text: "TEMP", bold: true, tag: "FLT=OFF (own bin)", tagColor: C.success },
      { glyph: "        📄", text: "draft1_01.mxf" },
    ],
    [
      { glyph: "📂", text: "Footage", bold: true, tag: "FLT=OFF (own bin)", tagColor: C.success },
      { glyph: "  📄", text: "promo.mp4" },
      { glyph: "  📁", text: "day1", tag: "FLT=ON (flat — no bin)", tagColor: C.amber },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📄", text: "shot_B.mp4" },
      { glyph: "    📄", text: "take_01.mxf", tag: "directly from RAW (reason flat day1)", tagColor: C.textDim },
      { glyph: "    📄", text: "take_02.mxf", tag: "directly from RAW (reason flat day1)", tagColor: C.textDim },
      { glyph: "    📂", text: "TEMP", bold: true, tag: "FLT=OFF own bin · directly from RAW (reason flat day1)", tagColor: C.success },
      { glyph: "      📄", text: "draft1_01.mxf" },
    ]
  ));

  sec6.appendChild(fltPair(
    "C · Chain-flat — day1=ON, RAW=ON. TEMP=OFF parent is ON → swallowed, nothing survives between Footage and draft1",
    [
      { glyph: "📁", text: "Footage", bold: true, tag: "FLT=OFF (own bin)", tagColor: C.success },
      { glyph: "  📄", text: "promo.mp4" },
      { glyph: "  📁", text: "day1", bold: true, tag: "FLT=ON (flat)", tagColor: C.amber },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📄", text: "shot_B.mp4" },
      { glyph: "    📁", text: "RAW", bold: true, tag: "FLT=ON (flat)", tagColor: C.amber },
      { glyph: "      📄", text: "take_01.mxf" },
      { glyph: "      📄", text: "take_02.mxf" },
      { glyph: "      📁", text: "TEMP", bold: true, tag: "FLT=OFF (own bin)", tagColor: C.success },
      { glyph: "        📄", text: "draft1_01.mxf" },
    ],
    [
      { glyph: "📂", text: "Footage", bold: true, tag: "FLT=OFF (own bin)", tagColor: C.success },
      { glyph: "  📄", text: "promo.mp4" },
      { glyph: "  📁", text: "day1", tag: "FLT=ON (flat — no bin)", tagColor: C.amber },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📄", text: "shot_B.mp4" },
      { glyph: "    📄", text: "take_01.mxf", tag: "directly from RAW (reason flat day1)", tagColor: C.textDim },
      { glyph: "    📄", text: "take_02.mxf", tag: "directly from RAW (reason flat day1)", tagColor: C.textDim },
      { glyph: "    📄", text: "draft1_01.mxf", tag: "directly from TEMP (reason flat RAW)", tagColor: C.textDim },
    ]
  ));

  // ---- Decision log v2 ----
  const fltDecision = vSec(contentW);
  fltDecision.cornerRadius = 8;
  setFill(fltDecision, C.panel, 1);
  setStroke(fltDecision, C.accent, 0.4, 1);
  fltDecision.paddingTop = 16; fltDecision.paddingBottom = 16;
  fltDecision.paddingLeft = 20; fltDecision.paddingRight = 20;
  fltDecision.itemSpacing = 8;
  const fltDecHead = hHug();
  fltDecHead.itemSpacing = 10;
  fltDecHead.counterAxisAlignItems = "CENTER";
  const fltDecChip = figma.createFrame();
  fltDecChip.resize(6, 6); fltDecChip.cornerRadius = 3;
  setFill(fltDecChip, C.accent, 1);
  fltDecHead.appendChild(fltDecChip);
  fltDecHead.appendChild(txt("Decision log — 2026-04-25", F.s, 12, C.white, undefined, 0.5));
  fltDecision.appendChild(fltDecHead);
  fltDecision.appendChild(txtW(
    "v2 cascade locks down one rule: FLT=ON row has NO bin — its content flattens toward the nearest surviving ancestor bin. FLT=OFF row gets a bin ONLY when its direct parent is also FLT=OFF. This is the \"double-OFF\" rule.",
    F.r, 12, C.borderBright, contentW - 40, 18
  ));
  fltDecision.appendChild(txtW(
    "Why looking at DIRECT parent (not any ancestor) — it lets a FLT=OFF row act as a LOCAL BARRIER for its own subtree even while the row itself is swallowed. In pair B, RAW=OFF inside day1=ON is itself flattened (files land directly in Footage flat-bucket), yet TEMP=OFF inside RAW=OFF survives as own bin because RAW gave it the barrier locally. That gives users a single tool with two uses: \"make my subtree flat\" (set ON) vs \"preserve my children's structure inside a flat ancestor\" (set OFF as a barrier).",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  fltDecision.appendChild(txtW(
    "Superseded from v1.2: \"FLT=OFF always preserves own bin (anchor)\" — replaced by \"double-OFF\" rule. UI guards (effective-target chip / hover tooltip / show-targets toggle / fltBorder states / migration counter) — parked for now; revisit after Mirror DEL timer UX lands since same visual vocabulary may apply.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  sec6.appendChild(fltDecision);


  root.appendChild(sec6);

  // ==================================================
  // §7 — Safety cover · flip-up metaphor
  // Imported from panel-v1.2 §3. Applies to destructive ops (FLT migration, DEL).
  // Locked = matte gray fill / Unlocked = blue borderCountdown / Active = committed ✓ / Re-lock.
  // ==================================================

  const sec7 = vSec(contentW);
  sec7.itemSpacing = 16;
  sec7.appendChild(sectionTitle(
    "§7 — Safety cover · flip-up metaphor, no iconography",
    "Matte fill = cover down. Empty + blue stroke + countdown ring = cover lifted (4s). Blue fill + ✓ = applied. Amber reserved for informational Migration preview only.",
    contentW
  ));

  const sec7Row = hSec(contentW);
  sec7Row.itemSpacing = 20;
  sec7Row.counterAxisAlignItems = "MIN";

  function coveredBigDemo() {
    const f = figma.createFrame();
    f.resize(44, 44);
    f.cornerRadius = 7;
    setFill(f, C.white, 0.06);
    setStroke(f, C.borderStrong, 1, 1.75);
    return f;
  }

  function activeBigDemo() {
    const f = figma.createFrame();
    f.resize(44, 44);
    f.cornerRadius = 7;
    setFill(f, C.accent, 1);
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = "CENTER";
    f.counterAxisAlignItems = "CENTER";
    f.appendChild(txt("✓", F.b, 24, C.white));
    return f;
  }

  function coverStep(titleText, captionText, demo, showRingStrip, migrationHint) {
    const w = vSec(280);
    w.cornerRadius = 8;
    setFill(w, C.panel, 1);
    setStroke(w, C.border, 1, 1);
    w.paddingTop = 20; w.paddingBottom = 20;
    w.paddingLeft = 20; w.paddingRight = 20;
    w.itemSpacing = 12;

    const demoBoxF = figma.createFrame();
    demoBoxF.resize(240, 80);
    demoBoxF.fills = [];
    demoBoxF.layoutMode = "HORIZONTAL";
    demoBoxF.layoutSizingHorizontal = "FIXED";
    demoBoxF.layoutSizingVertical = "FIXED";
    demoBoxF.primaryAxisAlignItems = "CENTER";
    demoBoxF.counterAxisAlignItems = "CENTER";
    demoBoxF.appendChild(demo);
    w.appendChild(demoBoxF);

    w.appendChild(txt(titleText, F.s, 13, C.white));
    w.appendChild(txtW(captionText, F.r, 11, C.textDim, 240, 16));

    if (showRingStrip) {
      const strip = hSec(240);
      strip.itemSpacing = 10;
      strip.counterAxisAlignItems = "CENTER";
      strip.primaryAxisAlignItems = "CENTER";
      strip.paddingTop = 10; strip.paddingBottom = 10;
      strip.paddingLeft = 12; strip.paddingRight = 12;
      strip.cornerRadius = 4;
      setFill(strip, C.canvas, 1);

      const frames = [0.95, 0.5, 0.1];
      for (let i = 0; i < frames.length; i++) {
        strip.appendChild(borderCountdown(28, 5, frames[i]));
        if (i < frames.length - 1) {
          strip.appendChild(txt("→", F.r, 10, C.textDim));
        }
      }
      w.appendChild(strip);
      w.appendChild(txt("Blue border drains CCW along the checkbox itself. Empty = cover drops, re-lock.", F.r, 10, C.textDim));
    }

    if (migrationHint) {
      const hintBox = vSec(240);
      hintBox.itemSpacing = 2;
      hintBox.paddingTop = 8; hintBox.paddingBottom = 8;
      hintBox.paddingLeft = 10; hintBox.paddingRight = 10;
      hintBox.cornerRadius = 4;
      setFill(hintBox, C.amber, 0.1);
      setStroke(hintBox, C.amber, 0.35, 1);
      hintBox.appendChild(txt("⤳ Migration preview", F.s, 10, C.amber, undefined, 0.5));
      hintBox.appendChild(txtW(migrationHint, F.r, 10, C.borderBright, 220, 14));
      w.appendChild(hintBox);
    }
    return w;
  }

  sec7Row.appendChild(coverStep(
    "1 · Locked (default)",
    "Cover is down. Matte fill over empty control — nothing clickable through it. One click lifts the cover.",
    coveredBigDemo(), false
  ));
  sec7Row.appendChild(coverStep(
    "2 · Unlocked (4s)",
    "Cover lifted. Blue border previews the committed state and drains CCW along its own perimeter. Gray shows through as time runs out. Second click commits.",
    borderCountdown(44, 7, 0.75), true,
    "12 files move from bin \"day1\" → bin \"Footage\". Timeline links unaffected."
  ));
  sec7Row.appendChild(coverStep(
    "3 · Active (applied)",
    "2nd click within the window commits. Structural change executes. Now just a regular on-checkbox.",
    activeBigDemo(), false
  ));
  sec7Row.appendChild(coverStep(
    "— · Auto re-lock",
    "Ring completed with no 2nd click, OR project reload / import start / cancel. Cover drops back down.",
    coveredBigDemo(), false
  ));

  sec7.appendChild(sec7Row);
  root.appendChild(sec7);

  // ==================================================
  // §8 — Sort / reorder · auto-clear on drag
  // Imported from panel-v1.2 §5. Drag auto-clears active sort; visible order
  // freezes into ui.order; micro-toast + Undo guard the gesture.
  // ==================================================

  const sec8 = vSec(contentW);
  sec8.itemSpacing = 16;
  sec8.appendChild(sectionTitle(
    "§8 — Sort / reorder · auto-clear on drag (resolved 2026-04-19)",
    "Drag auto-clears active sort. Sort's visible order freezes into ui.order. Micro-toast + Undo guard the gesture.",
    contentW
  ));

  const sortFlow = hSec(contentW);
  sortFlow.itemSpacing = 16;
  sortFlow.counterAxisAlignItems = "MIN";

  function flowStep(stepN, title, desc, panelVariant) {
    const stepW = Math.floor((contentW - 32) / 3);
    const c = vSec(stepW);
    c.cornerRadius = 8;
    setFill(c, C.panel, 1);
    setStroke(c, C.border, 1, 1);
    c.paddingTop = 18; c.paddingBottom = 18;
    c.paddingLeft = 20; c.paddingRight = 20;
    c.itemSpacing = 12;

    const h = hHug();
    h.itemSpacing = 10;
    h.counterAxisAlignItems = "CENTER";
    const num = figma.createFrame();
    num.resize(22, 22);
    num.cornerRadius = 11;
    setFill(num, C.accent, 1);
    num.layoutMode = "HORIZONTAL";
    num.layoutSizingHorizontal = "FIXED";
    num.layoutSizingVertical = "FIXED";
    num.primaryAxisAlignItems = "CENTER";
    num.counterAxisAlignItems = "CENTER";
    num.appendChild(txt(String(stepN), F.b, 11, C.white));
    h.appendChild(num);
    h.appendChild(txt(title, F.s, 12, C.white));
    c.appendChild(h);
    c.appendChild(txtW(desc, F.r, 11, C.textDim, stepW - 40, 16));

    const mini = vSec(stepW - 40);
    mini.cornerRadius = 4;
    mini.clipsContent = true;
    setFill(mini, C.canvas, 1);
    setStroke(mini, C.border, 1, 1);
    mini.itemSpacing = 0;

    const miniHead = hSec(stepW - 40);
    miniHead.paddingLeft = 8; miniHead.paddingRight = 8;
    miniHead.paddingTop = 4; miniHead.paddingBottom = 4;
    miniHead.itemSpacing = 8;
    miniHead.counterAxisAlignItems = "CENTER";
    setFill(miniHead, C.panelAlt, 1);
    const nameLabel = panelVariant === "sorted" ? "NAME ↑" : "NAME";
    const nameColor = panelVariant === "sorted" ? C.accent : C.textDim;
    miniHead.appendChild(txt(nameLabel, F.s, 9, nameColor, undefined, 1));
    miniHead.appendChild(spacer(1, 1)); miniHead.children[miniHead.children.length - 1].layoutGrow = 1;
    miniHead.appendChild(txt("PATH", F.s, 9, C.textDim, undefined, 1));
    mini.appendChild(miniHead);
    mini.appendChild(divider(stepW - 40, C.border, 0.6));

    const rowNames = panelVariant === "sorted"
      ? ["01_Assets", "02_Stills", "03_Archive", "day_02", "ref"]
      : panelVariant === "dragging"
      ? ["01_Assets", "02_Stills", "03_Archive", "→ day_02", "ref"]
      : ["01_Assets", "02_Stills", "day_02", "03_Archive", "ref"];

    for (let i = 0; i < rowNames.length; i++) {
      const rn = rowNames[i];
      const isDragged = rn.indexOf("→") === 0;
      const rr = hSec(stepW - 40);
      rr.paddingLeft = 8; rr.paddingRight = 8;
      rr.paddingTop = 5; rr.paddingBottom = 5;
      rr.itemSpacing = 6;
      rr.counterAxisAlignItems = "CENTER";
      if (isDragged) {
        setFill(rr, C.accent, 0.18);
        setStroke(rr, C.accent, 0.55, 1);
      } else if (i % 2 === 1) {
        setFill(rr, C.panelAlt, 1);
      } else {
        rr.fills = [];
      }
      rr.appendChild(labelDot(C.labelCerulean));
      rr.appendChild(txt(rn.replace("→ ", ""), F.m, 10, isDragged ? C.accent : C.borderBright));
      mini.appendChild(rr);
    }

    c.appendChild(mini);

    if (panelVariant === "dragging") {
      const toast = hSec(stepW - 40);
      toast.paddingLeft = 10; toast.paddingRight = 10;
      toast.paddingTop = 7; toast.paddingBottom = 7;
      toast.itemSpacing = 8;
      toast.cornerRadius = 4;
      toast.counterAxisAlignItems = "CENTER";
      setFill(toast, C.amber, 0.15);
      setStroke(toast, C.amber, 0.55, 1);
      toast.appendChild(txt("⚡", F.r, 10, C.amber));
      toast.appendChild(txt("Sort cleared → manual order active", F.m, 10, C.borderBright));
      toast.appendChild(spacer(1, 1)); toast.children[toast.children.length - 1].layoutGrow = 1;
      toast.appendChild(txt("Undo", F.s, 10, C.accent, undefined, 0.5));
      c.appendChild(toast);
    }
    return c;
  }

  sortFlow.appendChild(flowStep(1, "Sort active",
    "User has Sort by Name ↑. Rows in sorted order. Column header shows accent ↑.", "sorted"));
  sortFlow.appendChild(flowStep(2, "Drag starts → sort clears",
    "User drags day_02 up. Threshold 4px. Sort indicator drops; visible order freezes into ui.order. Toast appears with Undo (3s window).", "dragging"));
  sortFlow.appendChild(flowStep(3, "Drag complete",
    "day_02 is now between 02_Stills and 03_Archive. Other rows keep the frozen order. ui.order persists to JSON.", "manual"));
  sec8.appendChild(sortFlow);

  // Why + guards block
  const sortWhy = vSec(contentW);
  sortWhy.cornerRadius = 8;
  setFill(sortWhy, C.panel, 1);
  setStroke(sortWhy, C.accent, 0.4, 1);
  sortWhy.paddingTop = 18; sortWhy.paddingBottom = 18;
  sortWhy.paddingLeft = 22; sortWhy.paddingRight = 22;
  sortWhy.itemSpacing = 10;

  const whyHead = hHug();
  whyHead.itemSpacing = 10;
  whyHead.counterAxisAlignItems = "CENTER";
  const whyChip = figma.createFrame();
  whyChip.resize(6, 6); whyChip.cornerRadius = 3;
  setFill(whyChip, C.accent, 1);
  whyHead.appendChild(whyChip);
  whyHead.appendChild(txt("Why + guards", F.s, 12, C.white, undefined, 0.5));
  sortWhy.appendChild(whyHead);

  const bulletW = contentW - 44;
  function whyBullet(glyph, color, text) {
    const b = hSec(bulletW);
    b.itemSpacing = 8;
    b.counterAxisAlignItems = "MIN";
    b.appendChild(txt(glyph, F.b, 12, color));
    b.appendChild(txtW(text, F.r, 11, C.borderBright, bulletW - 16, 16));
    return b;
  }
  sortWhy.appendChild(whyBullet("•", C.accent, "Single-gesture UX. No \"clear sort first, then drag\". User just tenders the gesture, sort steps aside."));
  sortWhy.appendChild(whyBullet("•", C.accent, "Order is preserved as seen on screen — not reshuffled to some unknown baseline. This removes the \"where did my rows go?\" panic."));
  sortWhy.appendChild(whyBullet("•", C.accent, "Pattern from Finder / Notion / ClickUp — users already know it. No new mental model."));
  sortWhy.appendChild(spacer(1, 4));
  sortWhy.appendChild(txt("Guards", F.s, 11, C.amber, undefined, 0.5));
  sortWhy.appendChild(whyBullet("⚡", C.amber, "Micro-toast is mandatory. Without it the sort indicator just vanishes and the user doesn't learn the pattern. 3–5s auto-dismiss."));
  sortWhy.appendChild(whyBullet("⚡", C.amber, "Drag threshold ≥ 4px before sort clears. A stray mousedown on a row must not wipe the active sort."));
  sortWhy.appendChild(whyBullet("⚡", C.amber, "Undo button inside the toast for the first 3s — one-click rollback to the sort and the prior ui.order."));
  sortWhy.appendChild(whyBullet("⚡", C.amber, "Drag-within-parent only. A row cannot be dragged outside its parent bin — hierarchy follows OS. Cross-parent moves require OS-level rename/move; plugin then re-reads SoT and re-parents."));
  sec8.appendChild(sortWhy);

  // Sort fields reference table
  const sortTable = vSec(contentW);
  sortTable.itemSpacing = 0;
  sortTable.cornerRadius = 8;
  sortTable.clipsContent = true;
  setStroke(sortTable, C.border, 1, 1);

  const sortHeadRow = hSec(contentW);
  sortHeadRow.paddingLeft = 16; sortHeadRow.paddingRight = 16;
  sortHeadRow.paddingTop = 10; sortHeadRow.paddingBottom = 10;
  sortHeadRow.itemSpacing = 12;
  setFill(sortHeadRow, C.panelAlt, 1);
  const sh1 = cell(140, txt("FIELD", F.s, 10, C.textDim, undefined, 1), "MIN"); sh1.resize(140, 20);
  const sh2 = cell(240, txt("SOURCE", F.s, 10, C.textDim, undefined, 1), "MIN"); sh2.resize(240, 20);
  const sh3 = cell(200, txt("DIRECTION", F.s, 10, C.textDim, undefined, 1), "MIN"); sh3.resize(200, 20);
  const sh4 = cell(contentW - 140 - 240 - 200 - 32 - 36, txt("NOTES", F.s, 10, C.textDim, undefined, 1), "MIN");
  sh4.resize(contentW - 140 - 240 - 200 - 32 - 36, 20);
  sortHeadRow.appendChild(sh1); sortHeadRow.appendChild(sh2); sortHeadRow.appendChild(sh3); sortHeadRow.appendChild(sh4);
  sortTable.appendChild(sortHeadRow);

  function sortRow(f, src, dir, noteTxt) {
    const rr = hSec(contentW);
    rr.paddingLeft = 16; rr.paddingRight = 16;
    rr.paddingTop = 10; rr.paddingBottom = 10;
    rr.itemSpacing = 12;
    setFill(rr, C.panel, 1);
    const c1 = cell(140, txt(f, F.s, 12, C.borderBright), "MIN"); c1.resize(140, 20);
    const c2 = cell(240, txt(src, F.r, 11, C.textDim), "MIN"); c2.resize(240, 20);
    const c3 = cell(200, txt(dir, F.r, 11, C.textDim), "MIN"); c3.resize(200, 20);
    const c4Txt = txtW(noteTxt, F.r, 11, C.textDim, contentW - 140 - 240 - 200 - 32 - 36, 16);
    const c4 = cell(contentW - 140 - 240 - 200 - 32 - 36, c4Txt, "MIN");
    c4.resize(contentW - 140 - 240 - 200 - 32 - 36, 20);
    rr.appendChild(c1); rr.appendChild(c2); rr.appendChild(c3); rr.appendChild(c4);
    return rr;
  }
  sortTable.appendChild(sortRow("Name", "folder.name", "A→Z / Z→A", "Primary sort for quick navigation."));
  sortTable.appendChild(divider(contentW, C.border, 0.6));

  // Date added — reserved: no folder.addedAt field exists yet. Row rendered dimmed + "reserved" pill.
  (function() {
    const rr = hSec(contentW);
    rr.paddingLeft = 16; rr.paddingRight = 16;
    rr.paddingTop = 10; rr.paddingBottom = 10;
    rr.itemSpacing = 12;
    setFill(rr, C.panel, 1);
    const c1inner = hHug();
    c1inner.itemSpacing = 8;
    c1inner.counterAxisAlignItems = "CENTER";
    c1inner.appendChild(txt("Date added", F.s, 12, C.strokeMid));
    c1inner.appendChild(chip("reserved", C.amber, 0.15));
    const c1 = cell(140 + 80, c1inner, "MIN"); c1.resize(140 + 80, 20);
    const c2 = cell(240 - 80, txt("—", F.r, 11, C.strokeMid), "MIN"); c2.resize(240 - 80, 20);
    const c3 = cell(200, txt("—", F.r, 11, C.strokeMid), "MIN"); c3.resize(200, 20);
    const c4Txt = txtW("Parked. No folder.addedAt field yet. Will be SheepDog-owned ISO timestamp once introduced (NOT fs.statSync birthtime — cross-platform unreliable).", F.r, 11, C.strokeMid, contentW - 140 - 240 - 200 - 32 - 36, 16);
    const c4 = cell(contentW - 140 - 240 - 200 - 32 - 36, c4Txt, "MIN");
    c4.resize(contentW - 140 - 240 - 200 - 32 - 36, 20);
    rr.appendChild(c1); rr.appendChild(c2); rr.appendChild(c3); rr.appendChild(c4);
    sortTable.appendChild(rr);
  })();

  sortTable.appendChild(divider(contentW, C.border, 0.6));
  sortTable.appendChild(sortRow("Path", "folder.path (resolved abs)", "A→Z / Z→A", "For users who think in file tree terms."));
  sortTable.appendChild(divider(contentW, C.border, 0.6));
  sortTable.appendChild(sortRow("State", "computed STATE LED", "problems first / ok first", "Triage: 'where's red?' — all missing rows rise to top in one click."));
  sec8.appendChild(sortTable);

  root.appendChild(sec8);

  // ==================================================
  // §9 — Mirror DEL · per-row permission + Premiere-triggered OS trash
  // Revised 2026-04-25. Supersedes v1.2 "commit toggle" semantics.
  //
  //   DEL column = permission toggle. Does NOT destroy on click.
  //   Single OS-delete path = user deletes bin/file inside Premiere's import
  //   pool (tracked path) AND row DEL=on AND global Mirror DEL enabled.
  //   Detected event → timer (red borderCountdown, similar to safety cover)
  //   → Cancel window → OS trash. Row disappears on confirmed OS delete.
  //   Structure-lock: if user rearranges bins so the Premiere tree is no
  //   longer 1:1 with SheepDog's tracked tree, DEL is force-disabled and
  //   locked for the affected rows. Need Magnet (§Magnet) to restore parity.
  // ==================================================

  const sec9 = vSec(contentW);
  sec9.itemSpacing = 16;
  sec9.appendChild(sectionTitle(
    "§9 — Mirror DEL · permission + Premiere-triggered OS trash (revised 2026-04-25)",
    "DEL column is a PERMISSION, not a commit toggle. Files go to OS trash ONLY when user deletes bin/file inside Premiere's import pool AND row DEL=on AND global Mirror DEL enabled. Timer + Cancel, mirror-deleting state LED (hollow red), row disappears on confirmed OS delete. Structure-lock disables DEL if bin tree diverges from SoT.",
    contentW
  ));

  // ---- Rule card: single OS-delete path ----
  const mdRule = vSec(contentW);
  mdRule.cornerRadius = 8;
  setFill(mdRule, C.panel, 1);
  setStroke(mdRule, C.accent, 0.4, 1);
  mdRule.paddingTop = 16; mdRule.paddingBottom = 16;
  mdRule.paddingLeft = 20; mdRule.paddingRight = 20;
  mdRule.itemSpacing = 8;
  const mdRuleHead = hHug();
  mdRuleHead.itemSpacing = 10;
  mdRuleHead.counterAxisAlignItems = "CENTER";
  const mdRuleDot = figma.createFrame();
  mdRuleDot.resize(6, 6); mdRuleDot.cornerRadius = 3;
  setFill(mdRuleDot, C.accent, 1);
  mdRuleHead.appendChild(mdRuleDot);
  mdRuleHead.appendChild(txt("Rule — single OS-delete path", F.s, 12, C.white, undefined, 0.5));
  mdRule.appendChild(mdRuleHead);
  mdRule.appendChild(txtW(
    "OS trash happens iff:  (A) user deletes bin/file inside Premiere from within tracked path  AND  (B) row's DEL=on  AND  (C) global Mirror DEL is enabled in Settings.",
    F.m, 12, C.borderBright, contentW - 40, 18
  ));
  mdRule.appendChild(txtW(
    "Plugin Explorer is a MEDIATOR — it never fires OS delete from its own UI. No \"destroy now\" button anywhere. Clicking the DEL checkbox grants/revokes permission for THIS row; the actual trigger is always a Premiere-side action. This collapses the attack surface: one flow, one gate, one cancellable timer.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  sec9.appendChild(mdRule);

  // ---- Flow: Premiere delete → timer → OS trash ----
  const mdFlow = vSec(contentW);
  mdFlow.itemSpacing = 8;
  mdFlow.appendChild(txt("Flow — 4 steps with a cancellable timer", F.s, 13, C.white, undefined, 0.3));

  const mdFlowRow = hSec(contentW);
  mdFlowRow.itemSpacing = 16;
  mdFlowRow.counterAxisAlignItems = "MIN";

  function mdStep(stepN, title, desc, demo) {
    const stepW = Math.floor((contentW - 48) / 4);
    const c = vSec(stepW);
    c.cornerRadius = 8;
    setFill(c, C.panel, 1);
    setStroke(c, C.border, 1, 1);
    c.paddingTop = 18; c.paddingBottom = 18;
    c.paddingLeft = 20; c.paddingRight = 20;
    c.itemSpacing = 10;

    const h = hHug();
    h.itemSpacing = 10;
    h.counterAxisAlignItems = "CENTER";
    const num = figma.createFrame();
    num.resize(22, 22);
    num.cornerRadius = 11;
    setFill(num, C.danger, 1);
    num.layoutMode = "HORIZONTAL";
    num.layoutSizingHorizontal = "FIXED";
    num.layoutSizingVertical = "FIXED";
    num.primaryAxisAlignItems = "CENTER";
    num.counterAxisAlignItems = "CENTER";
    num.appendChild(txt(String(stepN), F.b, 11, C.white));
    h.appendChild(num);
    h.appendChild(txt(title, F.s, 12, C.white));
    c.appendChild(h);
    c.appendChild(txtW(desc, F.r, 11, C.textDim, stepW - 40, 16));
    if (demo) {
      const wrap = figma.createFrame();
      wrap.resize(stepW - 40, 70);
      wrap.fills = [];
      wrap.cornerRadius = 4;
      setFill(wrap, C.canvas, 1);
      wrap.layoutMode = "HORIZONTAL";
      wrap.layoutSizingHorizontal = "FIXED";
      wrap.layoutSizingVertical = "FIXED";
      wrap.primaryAxisAlignItems = "CENTER";
      wrap.counterAxisAlignItems = "CENTER";
      wrap.appendChild(demo);
      c.appendChild(wrap);
    }
    return c;
  }

  // Step 1 — user deletes bin in Premiere
  const mdS1 = hHug();
  mdS1.itemSpacing = 6;
  mdS1.counterAxisAlignItems = "CENTER";
  mdS1.appendChild(txt("Premiere", F.s, 10, C.textDim));
  mdS1.appendChild(txt("→", F.r, 12, C.textDim));
  mdS1.appendChild(txt("Delete bin", F.m, 11, C.danger));
  mdFlowRow.appendChild(mdStep(1, "Premiere delete detected",
    "User deletes a tracked bin (or file) inside Premiere's project panel. SheepDog watcher sees the removal via project XML or ExtendScript event.",
    mdS1));

  // Step 2 — timer armed (red border countdown on row)
  mdFlowRow.appendChild(mdStep(2, "Timer armed — 5s",
    "Row state flips to mirror-deleting (hollow red LED). A red borderCountdown ring drains around the row's DEL cell — same visual language as §7 safety cover, red channel. Cancel button in §10 progress header.",
    borderCountdown(44, 7, 0.65)));

  // Step 3 — cancel window
  const mdS3 = hHug();
  mdS3.itemSpacing = 6;
  mdS3.counterAxisAlignItems = "CENTER";
  mdS3.appendChild(txt("[Cancel]", F.s, 11, C.danger));
  mdFlowRow.appendChild(mdStep(3, "Cancel window",
    "User can cancel at any point during the timer (same as Import Cancel). If cancelled: row returns to its previous state, OS files untouched, DEL permission preserved for future attempts.",
    mdS3));

  // Step 4 — OS trash + row disappears
  const mdS4 = vHug();
  mdS4.itemSpacing = 4;
  mdS4.counterAxisAlignItems = "CENTER";
  const mdS4Head = hHug();
  mdS4Head.itemSpacing = 4;
  mdS4Head.counterAxisAlignItems = "CENTER";
  mdS4Head.appendChild(txt("OS", F.s, 10, C.textDim));
  mdS4Head.appendChild(txt("→", F.r, 12, C.textDim));
  mdS4Head.appendChild(txt("🗑", F.r, 14, C.danger));
  mdS4.appendChild(mdS4Head);
  mdS4.appendChild(txt("row removed", F.i, 10, C.textDim));
  mdFlowRow.appendChild(mdStep(4, "OS trash + row disappears",
    "Timer reaches zero → files move to OS trash (Windows 48h recovery, macOS indefinite). After OS confirms delete, SheepDog removes the row from Explorer. User consciously deleted via Mirror → no \"Missing\" carryover.",
    mdS4));

  mdFlow.appendChild(mdFlowRow);
  sec9.appendChild(mdFlow);

  // ---- Panel demo ----
  sec9.appendChild(divider(contentW, C.border, 0.25));
  sec9.appendChild(txt("Panel demo — DEL column visible · one row mid mirror-delete · one row with structure-lock", F.s, 13, C.white, undefined, 0.3));

  const sec9Row = hSec(contentW);
  sec9Row.itemSpacing = 32;
  sec9Row.counterAxisAlignItems = "MIN";

  const delPanel = vSec(PANEL_W);
  delPanel.cornerRadius = 6;
  delPanel.clipsContent = true;
  setFill(delPanel, C.panel, 1);
  setStroke(delPanel, C.border, 1, 1);
  delPanel.itemSpacing = 0;
  delPanel.appendChild(columnHeaderBar({ showDel: true }));
  delPanel.appendChild(divider(PANEL_W, C.border, 1));

  // Row A — healthy, DEL=off (permission revoked, calm)
  delPanel.appendChild(row({
    indent: 0, stateIndicator: "healthy", tree: "collapsed",
    name: "footage", path: "E:/Projects/FILM/footage",
    sub: "on", rel: "off", seq: "on", flt: "off", eye: "on",
    showDel: true, del: "off",
    label: C.labelForest,
    actions: [{ glyph: "↻", color: C.borderBright }, { glyph: "⌕", color: C.borderBright }, { glyph: "🧲", color: C.borderBright }],
  }));
  delPanel.appendChild(divider(PANEL_W, C.border, 0.25));

  // Row B — healthy, DEL=on (permission granted, red fill, NO destroy yet — just armed consent)
  delPanel.appendChild(row({
    indent: 0, stateIndicator: "healthy", tree: "collapsed",
    name: "reelA", path: "D:/Shoots/2026/reelA",
    sub: "on", rel: "off", seq: "on", flt: "off", eye: "on",
    showDel: true, del: "on",
    label: C.labelMango,
    actions: [{ glyph: "↻", color: C.borderBright }, { glyph: "⌕", color: C.borderBright }, { glyph: "🧲", color: C.borderBright }],
  }));
  delPanel.appendChild(divider(PANEL_W, C.border, 0.25));

  // Row C — mirror-deleting state in progress (subLocked + LED red hollow)
  delPanel.appendChild(row({
    indent: 0, stateIndicator: "mirror-deleting", tree: "collapsed", subLocked: true,
    name: "reelB", path: "D:/Shoots/2026/reelB",
    sub: "on", rel: "off", seq: "on", flt: "off", eye: "on",
    showDel: true, del: "cover-armed",
    label: C.labelRose,
    actions: [{ glyph: "↻", color: C.strokeMid }, { glyph: "⌕", color: C.strokeMid }, { glyph: "🧲", color: C.strokeMid }],
  }));
  delPanel.appendChild(divider(PANEL_W, C.border, 0.25));

  // Row D — structure-locked (bin moved out of parent in Premiere). DEL force-disabled with Locked tier.
  delPanel.appendChild(row({
    indent: 0, stateIndicator: "healthy", tree: "leaf",
    name: "reelC", path: "D:/Shoots/2026/reelC",
    sub: "on", rel: "off", seq: "on", flt: "off", eye: "on",
    showDel: true, del: "disabled-locked-off",  // structure-lock render: Disabled+Locked OFF
    label: C.labelCerulean,
    actions: [{ glyph: "↻", color: C.borderBright }, { glyph: "⌕", color: C.borderBright }, { glyph: "🧲", color: C.borderBright }],
  }));

  sec9Row.appendChild(delPanel);

  // ---- Rules column ----
  const delNotes = vSec(contentW - PANEL_W - 32);
  delNotes.itemSpacing = 12;

  const delRules = vSec(contentW - PANEL_W - 32);
  delRules.cornerRadius = 8;
  setFill(delRules, C.panel, 1);
  setStroke(delRules, C.danger, 0.4, 1);
  delRules.paddingTop = 16; delRules.paddingBottom = 16;
  delRules.paddingLeft = 20; delRules.paddingRight = 20;
  delRules.itemSpacing = 8;
  const delRulesHead = hHug();
  delRulesHead.itemSpacing = 10;
  delRulesHead.counterAxisAlignItems = "CENTER";
  const delRulesDot = figma.createFrame();
  delRulesDot.resize(6, 6); delRulesDot.cornerRadius = 3;
  setFill(delRulesDot, C.danger, 1);
  delRulesHead.appendChild(delRulesDot);
  delRulesHead.appendChild(txt("Mirror DEL rules", F.s, 12, C.white, undefined, 0.5));
  delRules.appendChild(delRulesHead);

  const delRulesBullets = [
    "Hidden by default. Appears only when Settings → Danger zone → \"Enable DEL column\" is on. Per #41 — always hidden in Simplified regardless of Settings toggle.",
    "DEL checkbox is a PERMISSION toggle. Clicking it does NOT destroy anything — it just grants/revokes participation in the Mirror DEL flow.",
    "Never inherits. Every row opts in explicitly. Default = off.",
    "Single trigger: user deletes bin/file inside Premiere from a tracked path → timer arms (red borderCountdown, 5s default — tunable in Settings behavior).",
    "Cancel during timer window = abort. OS untouched. DEL permission preserved.",
    "On OS-trash confirm → row removed from Explorer. No Missing carryover: user consciously deleted via Mirror, so the row is gone, not problematic.",
    "Soft delete only (OS trash). Never a hard unlink. Windows 48h recovery; macOS unlimited.",
    "Premiere guard: a bin with clips in active use on any timeline → Premiere itself refuses the delete. SheepDog reports \"Skipped, N clips in use\" and highlights the row amber.",
    "STRUCTURE-LOCK: if the user rearranges bins in Premiere so the tree no longer 1:1 mirrors SoT, DEL is FORCE-DISABLED on affected rows (Disabled+Locked tier). Need Magnet (§Magnet) to restore 1:1 parity. Safety guard against accidentally wiping the wrong folder.",
    "Disabled row + DEL=on stays in Disabled tier — dormant permission preserved for when the row re-enables.",
  ];
  for (const line of delRulesBullets) {
    const bulletRow = hSec(contentW - PANEL_W - 72);
    bulletRow.itemSpacing = 8;
    bulletRow.counterAxisAlignItems = "MIN";
    bulletRow.appendChild(txt("•", F.b, 12, C.danger));
    bulletRow.appendChild(txtW(line, F.r, 11, C.borderBright, contentW - PANEL_W - 96, 16));
    delRules.appendChild(bulletRow);
  }
  delNotes.appendChild(delRules);

  // Structure-lock explainer
  const delLock = vSec(contentW - PANEL_W - 32);
  delLock.cornerRadius = 8;
  setFill(delLock, C.panel, 1);
  setStroke(delLock, C.amber, 0.45, 1);
  delLock.paddingTop = 16; delLock.paddingBottom = 16;
  delLock.paddingLeft = 20; delLock.paddingRight = 20;
  delLock.itemSpacing = 8;
  const delLockHead = hHug();
  delLockHead.itemSpacing = 10;
  delLockHead.counterAxisAlignItems = "CENTER";
  const delLockDot = figma.createFrame();
  delLockDot.resize(6, 6); delLockDot.cornerRadius = 3;
  setFill(delLockDot, C.amber, 1);
  delLockHead.appendChild(delLockDot);
  delLockHead.appendChild(txt("Structure-lock — why DEL requires deterministic parity", F.s, 12, C.white, undefined, 0.5));
  delLock.appendChild(delLockHead);
  delLock.appendChild(txtW(
    "Mirror DEL needs a deterministic bin↔folder mapping. If the user drags a bin out of its parent bin in Premiere, the mapping breaks: deleting that bin no longer identifies a single tracked folder — the wrong thing could go to trash.",
    F.r, 11, C.borderBright, contentW - PANEL_W - 72, 16
  ));
  delLock.appendChild(txtW(
    "Response: affected rows render DEL cell as Disabled+Locked (backDim fill, dashed backMid stroke — see §REF) and block new permission toggles. User fix: click Magnet (§Magnet) → SheepDog pulls bins back into SoT layout → DEL unlocks automatically.",
    F.r, 11, C.textDim, contentW - PANEL_W - 72, 16
  ));
  delNotes.appendChild(delLock);

  // Settings hint
  const delHint = vSec(contentW - PANEL_W - 32);
  delHint.cornerRadius = 8;
  setFill(delHint, C.canvas, 1);
  setStroke(delHint, C.danger, 0.5, 1);
  delHint.paddingTop = 14; delHint.paddingBottom = 14;
  delHint.paddingLeft = 16; delHint.paddingRight = 16;
  delHint.itemSpacing = 10;
  const delHintHead = hHug();
  delHintHead.itemSpacing = 8;
  delHintHead.counterAxisAlignItems = "CENTER";
  delHintHead.appendChild(txt("⚠", F.b, 12, C.danger));
  delHintHead.appendChild(txt("Settings  →  Danger zone", F.s, 11, C.danger, undefined, 0.6));
  delHint.appendChild(delHintHead);

  const delHintT1 = hSec(contentW - PANEL_W - 32 - 32);
  delHintT1.itemSpacing = 10;
  delHintT1.counterAxisAlignItems = "CENTER";
  delHintT1.appendChild(toggle(true));
  const delHintL1 = vHug();
  delHintL1.itemSpacing = 2;
  delHintL1.appendChild(txt("Enable DEL column", F.m, 12, C.borderBright));
  delHintL1.appendChild(txt("Reveals the permission column. Advanced-only.", F.r, 10, C.textDim, 14));
  delHintT1.appendChild(delHintL1);
  delHint.appendChild(delHintT1);

  const delHintT2 = hSec(contentW - PANEL_W - 32 - 32);
  delHintT2.itemSpacing = 10;
  delHintT2.counterAxisAlignItems = "CENTER";
  delHintT2.appendChild(toggle(false));
  const delHintL2 = vHug();
  delHintL2.itemSpacing = 2;
  delHintL2.appendChild(txt("Global Mirror DEL", F.m, 12, C.borderBright));
  delHintL2.appendChild(txt("Master switch. OFF by default (#45 kept). Even with per-row DEL=on, nothing trashes while this is off.", F.r, 10, C.textDim, 14));
  delHintT2.appendChild(delHintL2);
  delHint.appendChild(delHintT2);

  delNotes.appendChild(delHint);
  sec9Row.appendChild(delNotes);
  sec9.appendChild(sec9Row);

  // Decision log
  const delWhy = vSec(contentW);
  delWhy.cornerRadius = 8;
  setFill(delWhy, C.panel, 1);
  setStroke(delWhy, C.accent, 0.4, 1);
  delWhy.paddingTop = 16; delWhy.paddingBottom = 16;
  delWhy.paddingLeft = 20; delWhy.paddingRight = 20;
  delWhy.itemSpacing = 8;
  const delWhyHead = hHug();
  delWhyHead.itemSpacing = 10;
  delWhyHead.counterAxisAlignItems = "CENTER";
  const delWhyDot = figma.createFrame();
  delWhyDot.resize(6, 6); delWhyDot.cornerRadius = 3;
  setFill(delWhyDot, C.accent, 1);
  delWhyHead.appendChild(delWhyDot);
  delWhyHead.appendChild(txt("Decision log — 2026-04-25", F.s, 12, C.white, undefined, 0.5));
  delWhy.appendChild(delWhyHead);
  delWhy.appendChild(txtW(
    "v1.2's \"per-row commit toggle\" replaced by \"per-row permission + Premiere-triggered timer\". Reasons: (a) commit toggle made DEL clickable → accidental destroy one misclick away. Permission + Premiere-trigger needs THREE aligned conditions before anything happens. (b) Mirror DEL is conceptually \"bin deletion = folder deletion\", so Premiere is the natural trigger — it's where user already thinks about bin lifecycle. (c) The plugin panel is \"Explorer = mediator\" per §13 — having a destroy button inside the mediator panel contradicts the mental model.",
    F.r, 12, C.borderBright, contentW - 40, 18
  ));
  delWhy.appendChild(txtW(
    "Structure-lock prevents the worst-case: user drags bin out of parent in Premiere, forgets, later tries to delete it. Without lock, mapping becomes ambiguous — we might trash the wrong folder. Lock blocks until parity is restored (manual via OS re-parent, or automatic via Magnet). This shifts burden from \"prevent mistake with more confirmations\" to \"make wrong action structurally impossible\" — Apple rule.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  delWhy.appendChild(txtW(
    "Row disappearance (not Missing) on confirmed OS delete: user intent was \"remove this, I know\". Leaving a Missing row would spam the explorer with \"path not found\" noise the user DOESN'T want to relink. Missing is for accidental disappearance — Mirror DEL is deliberate.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  sec9.appendChild(delWhy);
  root.appendChild(sec9);

  // ==================================================
  // §10 — Progress panel · 3 variants
  // Imported from panel-v1.2 §2. Collapsed / expanded-idle / active.
  // Chunk-level progress + Cancel. Not contradicted by new spec.
  // ==================================================

  const sec10 = vSec(contentW);
  sec10.itemSpacing = 16;
  sec10.appendChild(sectionTitle(
    "§10 — Progress panel · 4 variants (Import + Mirror DEL)",
    "Media Encoder-inspired. Collapsed by default. Expands during import (blue) or mirror-delete (red) with chunk-level progress + Cancel. Timer column visible on the active chunk during Mirror DEL.",
    contentW
  ));

  function progressWrap(variant, label) {
    const w = vSec(PANEL_W);
    w.itemSpacing = 8;
    w.appendChild(txt(label, F.m, 11, C.textDim, undefined, 1));
    const pp = vSec(PANEL_W);
    pp.cornerRadius = 6;
    pp.clipsContent = true;
    setFill(pp, C.panel, 1);
    setStroke(pp, C.border, 1, 1);
    pp.appendChild(progressPanel(variant));
    w.appendChild(pp);
    return w;
  }

  const prog3 = vSec(contentW);
  prog3.itemSpacing = 24;
  prog3.appendChild(progressWrap("collapsed", "COLLAPSED — idle default. Single line in footer area."));
  prog3.appendChild(progressWrap("expanded-idle", "EXPANDED IDLE — last run summary when user toggles caret open."));
  prog3.appendChild(progressWrap("active", "ACTIVE IMPORT (blue) — overall bar + chunk breakdown. Grows up to ~200px with own scroll."));
  prog3.appendChild(progressWrap("mirror-deleting", "MIRROR DEL (red) — trashing bin contents to OS. Timer column visible on the active chunk; Cancel works like Import Cancel."));
  sec10.appendChild(prog3);
  root.appendChild(sec10);

  // ==================================================
  // §11 — Icon reference · Adobe parity
  // All icons render in Adobe-parity chrome (neutral borderBright in REST — no
  // ambient color tint). In-doc color-coded demos got confusing; we unified to
  // "button state ladder" — see §REF icon-button table. Eye has NO Safety Cover
  // (it's a toggle, not destructive). Relink rules explain re-parenting on move.
  // ==================================================

  const sec11 = vSec(contentW);
  sec11.itemSpacing = 16;
  sec11.appendChild(sectionTitle(
    "§11 — Icon reference · Adobe parity",
    "Every icon renders with the same button chrome: outlined 32×32, borderBright icon in REST, bg tint on hover/pressed (§REF Adobe parity). In-doc cards here use REST only — state ladder lives in §REF. No color accents per icon — all look identical at rest.",
    contentW
  ));

  // iconLegend — all icons use REST state (borderBright on outlined square).
  function iconLegend(glyphOrSvgKey, title, desc) {
    const card = vSec(360);
    card.cornerRadius = 8;
    setFill(card, C.panel, 1);
    setStroke(card, C.border, 1, 1);
    card.paddingTop = 16; card.paddingBottom = 16;
    card.paddingLeft = 18; card.paddingRight = 18;
    card.itemSpacing = 8;

    const head = hHug();
    head.itemSpacing = 10;
    head.counterAxisAlignItems = "CENTER";
    const ic = figma.createFrame();
    ic.resize(32, 32); ic.cornerRadius = 4;
    ic.fills = [];
    setStroke(ic, C.border, 1, 1);
    ic.layoutMode = "HORIZONTAL";
    ic.layoutSizingHorizontal = "FIXED";
    ic.layoutSizingVertical = "FIXED";
    ic.primaryAxisAlignItems = "CENTER";
    ic.counterAxisAlignItems = "CENTER";
    const textToSvg = { "↻": "refresh", "⌕": "search", "🧲": "magnet", "👁": "eye", "↺": "rotateCcw", "←": "arrowLeft", "×": "x" };
    const svgKey = textToSvg[glyphOrSvgKey] || glyphOrSvgKey;
    // Recognized SVG keys — render from dict; otherwise render as text.
    if (SVG[svgKey]) ic.appendChild(loadIcon(svgKey, C.borderBright, 16));
    else ic.appendChild(txt(glyphOrSvgKey, F.m, 15, C.borderBright));
    head.appendChild(ic);
    head.appendChild(txt(title, F.s, 13, C.white));
    card.appendChild(head);

    card.appendChild(txtW(desc, F.r, 11, C.textDim, 320, 16));
    return card;
  }

  const iconRow1 = hSec(contentW);
  iconRow1.itemSpacing = 16;
  iconRow1.counterAxisAlignItems = "MIN";
  iconRow1.appendChild(iconLegend("↻", "Manual Sync",
    "Re-scan this folder only, import new files. Works regardless of Auto-import global."));
  iconRow1.appendChild(iconLegend("⌕", "Relink",
    "Pick a new path for this row. After a relink the row becomes a ROOT (nearest parent in tree is effectively dropped). If OS later re-establishes parent-child via FS moves, SheepDog re-parents automatically (OS is SoT). Blocked targets: live parent/child of this row, dead (missing) row, self."));
  iconRow1.appendChild(iconLegend("🧲", "Magnet — restore SoT parity",
    "Pulls scattered bins/files back to their tracked positions. Side-files preserved (duplicate-not-destroy); orphans land in Herder Bucket. Full semantics in §14."));
  sec11.appendChild(iconRow1);

  const iconRow2 = hSec(contentW);
  iconRow2.itemSpacing = 16;
  iconRow2.counterAxisAlignItems = "MIN";
  iconRow2.appendChild(iconLegend("👁", "Eye — per-row auto-import (Advanced)",
    "Eye open = this folder participates in auto-import. Eye closed = still visible and manually syncable, but watcher ignores. Hidden in Simplified (EYE forced ON globally). Eye is a TOGGLE, not destructive — no Safety Cover."));
  iconRow2.appendChild(iconLegend("×", "Row action — destroy / disable (context-aware)",
    "See §1 × card: healthy child=disable, missing=delete entry, busy=locked. Destructive hover goes red on parent/missing (config-level destroy). Never touches FS."));
  iconRow2.appendChild(iconLegend("←", "Row action — restore disabled row (soft-stop reverse)",
    "Only appears on disabled rows (glyph context-switch in RM column). Diamond form-factor matches × geometrically — same visual weight, opposite intent. Hover turns BLUE (accent) as the positive-restore mirror of × → red on destructive. Click resumes watching: stored settings re-applied, soft-stop lifted (existing imports were legitimate, new ones now flow again)."));
  sec11.appendChild(iconRow2);
  root.appendChild(sec11);

  // ==================================================
  // §11b — Labels · host-driven dynamic palette
  // SheepDog is a mediator. Reads label dictionary from active host
  // (Premiere: global user prefs; AE: per-project). Stores per-row labelId
  // (1..N), survives renames/recolors. Names + hex come from host config —
  // we don't define them. Refreshed on plugin focus regain.
  // ==================================================

  const sec11b = vSec(contentW);
  sec11b.itemSpacing = 16;
  sec11b.appendChild(sectionTitle(
    "§11b — Labels · host-driven dynamic palette",
    "SheepDog reads label dictionary from active host (Premiere global prefs / AE per-project). Stores labelId — names & hex come from host. Per-row LBL column = dropdown picker over the host's actual labels. Refresh on plugin focus regain handles renames automatically.",
    contentW
  ));

  // Mock host data — what bridge.getLabelDictionary() might return for a
  // user with customised Premiere labels. For Figma readability we mix
  // SheepDog C.* placeholder colors; in reality these come from Adobe.
  const mockLabels = [
    { id: 1, name: "Client A",      color: C.labelCerulean },
    { id: 2, name: "VFX pulls",     color: C.labelRose },
    { id: 3, name: "B-roll",        color: C.labelForest },
    { id: 4, name: "Reference",     color: C.labelViolet },
    { id: 5, name: "TODO / pending",color: C.labelMango },
    { id: 6, name: "Locked",        color: C.labelIris },
  ];

  // ---- Two-column layout: left = mediator architecture card; right = dropdown mockup ----
  const lblRow = hSec(contentW);
  lblRow.itemSpacing = 24;
  lblRow.counterAxisAlignItems = "MIN";

  // Architecture card (left)
  const lblArch = vSec(Math.floor((contentW - 24) / 2));
  lblArch.cornerRadius = 8;
  setFill(lblArch, C.panel, 1);
  setStroke(lblArch, C.accent, 0.4, 1);
  lblArch.paddingTop = 18; lblArch.paddingBottom = 18;
  lblArch.paddingLeft = 22; lblArch.paddingRight = 22;
  lblArch.itemSpacing = 10;
  const lblArchHead = hHug();
  lblArchHead.itemSpacing = 10;
  lblArchHead.counterAxisAlignItems = "CENTER";
  const lblArchDot = figma.createFrame();
  lblArchDot.resize(6, 6); lblArchDot.cornerRadius = 3;
  setFill(lblArchDot, C.accent, 1);
  lblArchHead.appendChild(lblArchDot);
  lblArchHead.appendChild(txt("Mediator architecture", F.s, 13, C.white, undefined, 0.5));
  lblArch.appendChild(lblArchHead);

  const lblArchInnerW = Math.floor((contentW - 24) / 2) - 44;
  lblArch.appendChild(txtW(
    "bridge.getLabelDictionary() → ExtendScript walks active host's label config. Returns Array<{id, name, color}>. Plugin caches in memory; re-fetches on focus regain (cheap call).",
    F.m, 12, C.borderBright, lblArchInnerW, 18
  ));

  const archBullets = [
    "Premiere: label dictionary is GLOBAL (user prefs). Same labels across all projects.",
    "AE: label dictionary is PER-PROJECT (.aep). Plugin re-fetches on project switch.",
    "Per-row stored value = labelId (number). Renames/recolors in host — UI reflects new name & color, row config untouched.",
    "Label removed in host (AE only — Premiere can't remove): row falls back to null (no label) silently. Re-pick via dropdown.",
    "Application: SheepDog passes labelId on import → host applies its own color/name to the item. We never write hex/name into the manifest — labelId is source-of-truth for the link.",
  ];
  for (const b of archBullets) {
    const line = hSec(lblArchInnerW);
    line.itemSpacing = 8;
    line.counterAxisAlignItems = "MIN";
    line.appendChild(txt("•", F.b, 12, C.accent));
    line.appendChild(txtW(b, F.r, 11, C.borderBright, lblArchInnerW - 16, 16));
    lblArch.appendChild(line);
  }
  lblRow.appendChild(lblArch);

  // Dropdown mockup card (right) — shows actual UI for picking a label.
  const lblDrop = vSec(Math.floor((contentW - 24) / 2));
  lblDrop.cornerRadius = 8;
  setFill(lblDrop, C.panel, 1);
  setStroke(lblDrop, C.border, 1, 1);
  lblDrop.paddingTop = 18; lblDrop.paddingBottom = 18;
  lblDrop.paddingLeft = 22; lblDrop.paddingRight = 22;
  lblDrop.itemSpacing = 14;

  const lblDropHead = hHug();
  lblDropHead.itemSpacing = 10;
  lblDropHead.counterAxisAlignItems = "CENTER";
  const lblDropDot = figma.createFrame();
  lblDropDot.resize(6, 6); lblDropDot.cornerRadius = 3;
  setFill(lblDropDot, C.borderBright, 1);
  lblDropHead.appendChild(lblDropDot);
  lblDropHead.appendChild(txt("Dropdown — click LBL dot in row", F.s, 13, C.white, undefined, 0.5));
  lblDrop.appendChild(lblDropHead);

  // Trigger row mock — shows how it appears in the table before clicking.
  const lblTrigger = hSec(Math.floor((contentW - 24) / 2) - 44);
  lblTrigger.paddingLeft = 12; lblTrigger.paddingRight = 12;
  lblTrigger.paddingTop = 8; lblTrigger.paddingBottom = 8;
  lblTrigger.cornerRadius = 4;
  lblTrigger.itemSpacing = 10;
  lblTrigger.counterAxisAlignItems = "CENTER";
  setFill(lblTrigger, C.panelAlt, 1);
  lblTrigger.appendChild(txt("row LBL", F.s, 9, C.textDim, undefined, 0.5));
  const lblTriggerDot = figma.createFrame();
  lblTriggerDot.resize(12, 12); lblTriggerDot.cornerRadius = 6;
  setFill(lblTriggerDot, mockLabels[0].color, 1);
  lblTrigger.appendChild(lblTriggerDot);
  lblTrigger.appendChild(txt("Client A", F.m, 11, C.borderBright));
  lblTrigger.appendChild(spacer(1, 1)); lblTrigger.children[lblTrigger.children.length - 1].layoutGrow = 1;
  lblTrigger.appendChild(loadIcon("chevronDown", C.textDim, 12));
  lblDrop.appendChild(lblTrigger);

  // Open dropdown mockup
  const lblMenu = vSec(Math.floor((contentW - 24) / 2) - 44);
  lblMenu.cornerRadius = 4;
  lblMenu.clipsContent = true;
  setFill(lblMenu, C.canvas, 1);
  setStroke(lblMenu, C.border, 1, 1);
  lblMenu.itemSpacing = 0;

  function lblMenuItem(label, isSelected) {
    const w = Math.floor((contentW - 24) / 2) - 44;
    const r = hSec(w);
    r.paddingLeft = 12; r.paddingRight = 12;
    r.paddingTop = 7; r.paddingBottom = 7;
    r.itemSpacing = 10;
    r.counterAxisAlignItems = "CENTER";
    if (isSelected) setFillFlat(r, C.accent, 0.12);
    else r.fills = [];
    const dot = figma.createFrame();
    dot.resize(12, 12); dot.cornerRadius = 6;
    setFill(dot, label.color, 1);
    r.appendChild(dot);
    r.appendChild(txt(label.name, F.m, 11, C.borderBright));
    r.appendChild(spacer(1, 1)); r.children[r.children.length - 1].layoutGrow = 1;
    r.appendChild(txt("id " + label.id, F.r, 9, C.textDim));
    if (isSelected) r.appendChild(loadIcon("chevronRight", C.accent, 10));
    return r;
  }

  // "No label" option
  const w2 = Math.floor((contentW - 24) / 2) - 44;
  const noneRow = hSec(w2);
  noneRow.paddingLeft = 12; noneRow.paddingRight = 12;
  noneRow.paddingTop = 7; noneRow.paddingBottom = 7;
  noneRow.itemSpacing = 10;
  noneRow.counterAxisAlignItems = "CENTER";
  noneRow.fills = [];
  const noneDot = figma.createFrame();
  noneDot.resize(12, 12); noneDot.cornerRadius = 6;
  noneDot.fills = [];
  setStrokeFlat(noneDot, C.textDim, 0.7, 1);
  noneRow.appendChild(noneDot);
  noneRow.appendChild(txt("(no label)", F.i, 11, C.textDim));
  lblMenu.appendChild(noneRow);
  lblMenu.appendChild(divider(w2, C.border, 0.5));

  // Render labels from mock host data
  for (let i = 0; i < mockLabels.length; i++) {
    lblMenu.appendChild(lblMenuItem(mockLabels[i], i === 0));
    if (i < mockLabels.length - 1) lblMenu.appendChild(divider(w2, C.border, 0.25));
  }
  lblDrop.appendChild(lblMenu);

  lblDrop.appendChild(txtW(
    "Mockup labels reflect a USER project — names like \"Client A\" / \"VFX pulls\" come from their Adobe prefs, not SheepDog's defaults. Selected option highlighted with accent fill. (no label) clears the row's labelId.",
    F.r, 10, C.textDim, Math.floor((contentW - 24) / 2) - 44, 14
  ));
  lblRow.appendChild(lblDrop);

  sec11b.appendChild(lblRow);

  // Application notes card
  const labelsNote = vSec(contentW);
  labelsNote.cornerRadius = 8;
  setFill(labelsNote, C.panel, 1);
  setStroke(labelsNote, C.textDim, 0.4, 1);
  labelsNote.paddingTop = 14; labelsNote.paddingBottom = 14;
  labelsNote.paddingLeft = 20; labelsNote.paddingRight = 20;
  labelsNote.itemSpacing = 6;
  labelsNote.appendChild(txt("Application notes", F.s, 11, C.white, undefined, 0.4));
  labelsNote.appendChild(txtW("Label set on a PARENT row cascades to newly-imported items as default; per-row override wins. Existing imported items are NOT retro-labelled (avoids destructive metadata rewrites) — manual relabel via host or future \"Apply now\" action.", F.r, 10, C.textDim, contentW - 40, 14));
  labelsNote.appendChild(txtW("Sync: SheepDog re-fetches label dictionary on (a) plugin load, (b) plugin window focus regain, (c) on-demand via Settings refresh button (parked, MVP relies on focus-regain). UI updates dropdowns + LBL column dots reactively.", F.r, 10, C.textDim, contentW - 40, 14));
  labelsNote.appendChild(txtW("Mediator stance: SheepDog never defines labels. Adding/renaming/recoloring labels is a host concern — user does it in Adobe Preferences (Premiere) or Project Settings (AE). Plugin only reads & propagates by id.", F.r, 10, C.textDim, contentW - 40, 14));
  sec11b.appendChild(labelsNote);
  root.appendChild(sec11b);

  // ==================================================
  // §12 — Settings modal · canonical config
  // Imported from panel-v1.2 §7, reworked:
  //   - AUTO-SYNC global → renamed "Advanced mode" per decision #34
  //   - AUTO-SYNC inheritance demo DROPPED (superseded; Advanced is a mode switch, not cascade source)
  //   - New watch folder defaults cell for AUTO-SYNC removed (only SUB/REL/SEQ/FLT/DEL remain)
  //   - Decision log updated to reflect new semantics
  // ==================================================

  const sec12 = vSec(contentW);
  sec12.itemSpacing = 16;
  sec12.appendChild(sectionTitle(
    "§12 — Settings modal · canonical config",
    "Full-panel overlay (not a drawer, not a tab). Five sections. All global state lives here; header Advanced toggle is a shortcut pointing at the same store.",
    contentW
  ));

  const sec12Row = hSec(contentW);
  sec12Row.itemSpacing = 32;
  sec12Row.counterAxisAlignItems = "MIN";

  function settingsSection(title) {
    const sec = vSec(PANEL_W);
    sec.paddingLeft = 20; sec.paddingRight = 20;
    sec.paddingTop = 18; sec.paddingBottom = 18;
    sec.itemSpacing = 14;
    sec.appendChild(txt(title, F.s, 12, C.white, undefined, 0.4));
    return sec;
  }
  function settingsRow(labelTxt, subTxt, control) {
    const rw = hSec(PANEL_W - 40);
    rw.itemSpacing = 12;
    rw.counterAxisAlignItems = "CENTER";
    rw.primaryAxisAlignItems = "SPACE_BETWEEN";
    const lblWrap = vHug();
    lblWrap.itemSpacing = 2;
    lblWrap.appendChild(txt(labelTxt, F.m, 12, C.borderBright));
    if (subTxt) lblWrap.appendChild(txtW(subTxt, F.r, 10, C.textDim, PANEL_W - 160, 14));
    rw.appendChild(lblWrap);
    rw.appendChild(control);
    return rw;
  }
  function defaultsCell(label, isOn, color) {
    const col = vHug();
    col.itemSpacing = 6;
    col.counterAxisAlignItems = "CENTER";
    const box = figma.createFrame();
    box.resize(26, 26);
    box.cornerRadius = 4;
    box.layoutMode = "HORIZONTAL";
    box.layoutSizingHorizontal = "FIXED";
    box.layoutSizingVertical = "FIXED";
    box.primaryAxisAlignItems = "CENTER";
    box.counterAxisAlignItems = "CENTER";
    if (isOn) {
      setFill(box, color || C.accent, 1);
      setStroke(box, color || C.accent, 1, 1);
      box.appendChild(txt("✓", F.b, 14, C.white));
    } else {
      box.fills = [];
      setStroke(box, C.borderStrong, 1, 1);
    }
    col.appendChild(box);
    col.appendChild(txt(label, F.s, 9, isOn ? C.borderBright : C.textDim, undefined, 0.8));
    return col;
  }
  function stRadio(isOn) {
    const f = figma.createFrame();
    f.resize(14, 14);
    f.cornerRadius = 7;
    f.fills = [];
    setStroke(f, isOn ? C.accent : C.borderStrong, 1, 1);
    if (isOn) {
      f.layoutMode = "HORIZONTAL";
      f.layoutSizingHorizontal = "FIXED";
      f.layoutSizingVertical = "FIXED";
      f.primaryAxisAlignItems = "CENTER";
      f.counterAxisAlignItems = "CENTER";
      const dot = figma.createFrame();
      dot.resize(6, 6);
      dot.cornerRadius = 3;
      setFill(dot, C.accent, 1);
      f.appendChild(dot);
    }
    return f;
  }
  function stFilterChip(label) {
    const f = hHug();
    f.paddingTop = 3; f.paddingBottom = 3;
    f.paddingLeft = 8; f.paddingRight = 6;
    f.cornerRadius = 3;
    f.itemSpacing = 4;
    f.counterAxisAlignItems = "CENTER";
    setFill(f, C.panelHi, 1);
    setStroke(f, C.border, 1, 1);
    f.appendChild(txt(label, F.m, 10, C.borderBright));
    f.appendChild(loadIcon("x", C.strokeMid, 10));
    return f;
  }
  function stAddChip(label) {
    const f = hHug();
    f.paddingTop = 3; f.paddingBottom = 3;
    f.paddingLeft = 8; f.paddingRight = 8;
    f.cornerRadius = 3;
    f.counterAxisAlignItems = "CENTER";
    f.fills = [];
    setStroke(f, C.border, 0.7, 1);
    f.appendChild(txt(label, F.m, 10, C.textDim));
    return f;
  }
  function numberDrop(value) {
    const f = hHug();
    f.paddingTop = 5; f.paddingBottom = 5;
    f.paddingLeft = 10; f.paddingRight = 8;
    f.cornerRadius = 3;
    f.itemSpacing = 6;
    f.counterAxisAlignItems = "CENTER";
    setFill(f, C.panelHi, 1);
    setStroke(f, C.border, 1, 1);
    f.appendChild(txt(value, F.m, 11, C.borderBright));
    f.appendChild(txt("▾", F.r, 9, C.textDim));
    return f;
  }

  const settingsPanel = vSec(PANEL_W);
  settingsPanel.cornerRadius = 8;
  settingsPanel.clipsContent = true;
  setFill(settingsPanel, C.panel, 1);
  setStroke(settingsPanel, C.border, 1, 1);
  settingsPanel.itemSpacing = 0;

  // Header bar
  const settingsHead = hSec(PANEL_W);
  settingsHead.paddingLeft = 20; settingsHead.paddingRight = 14;
  settingsHead.paddingTop = 14; settingsHead.paddingBottom = 14;
  settingsHead.counterAxisAlignItems = "CENTER";
  settingsHead.primaryAxisAlignItems = "SPACE_BETWEEN";
  setFill(settingsHead, C.panelAlt, 1);
  const settingsHeadLeft = hHug();
  settingsHeadLeft.itemSpacing = 10;
  settingsHeadLeft.counterAxisAlignItems = "CENTER";
  settingsHeadLeft.appendChild(txt("⚙", F.m, 16, C.borderBright));
  settingsHeadLeft.appendChild(txt("Settings", F.s, 14, C.white));
  settingsHead.appendChild(settingsHeadLeft);
  const settingsHeadClose = figma.createFrame();
  settingsHeadClose.resize(22, 22);
  settingsHeadClose.cornerRadius = 3;
  settingsHeadClose.layoutMode = "HORIZONTAL";
  settingsHeadClose.layoutSizingHorizontal = "FIXED";
  settingsHeadClose.layoutSizingVertical = "FIXED";
  settingsHeadClose.primaryAxisAlignItems = "CENTER";
  settingsHeadClose.counterAxisAlignItems = "CENTER";
  settingsHeadClose.fills = [];
  settingsHeadClose.appendChild(loadIcon("x", C.textDim, 14));
  settingsHead.appendChild(settingsHeadClose);
  settingsPanel.appendChild(settingsHead);
  settingsPanel.appendChild(divider(PANEL_W, C.border, 1));

  // 12.1 General
  const sg1 = settingsSection("12.1 General");

  // Auto-import (global) — eye-toggle widget; default OFF. Replaces v1.2 Auto-Sync checkbox.
  // When OFF, nothing auto-imports (neither Simplified nor Advanced). User must turn ON explicitly.
  const sg1AutoImp = hSec(PANEL_W - 40);
  sg1AutoImp.itemSpacing = 12;
  sg1AutoImp.counterAxisAlignItems = "CENTER";
  sg1AutoImp.primaryAxisAlignItems = "SPACE_BETWEEN";
  const sg1AIlbl = vHug();
  sg1AIlbl.itemSpacing = 2;
  sg1AIlbl.appendChild(txt("Auto-import (global)", F.m, 12, C.borderBright));
  sg1AIlbl.appendChild(txtW("Glyph = eye, not a checkbox — one visual language across the doc. Default OFF: nothing auto-imports until user turns it on. When ON, per-row EYE (Advanced) overrides; in Simplified all enabled rows follow this global.", F.r, 10, C.textDim, PANEL_W - 160, 14));
  sg1AutoImp.appendChild(sg1AIlbl);
  sg1AutoImp.appendChild(eyeToggle("off"));  // default OFF per pre-defaults list
  sg1.appendChild(sg1AutoImp);

  sg1.appendChild(settingsRow(
    "Advanced mode (global)",
    "Canonical store. Header strip toggle is a shortcut to this row. ON reveals all Advanced columns (PATH · SUB · REL · SEQ · FLT · EYE · DEL · ACTIONS).",
    toggle(true)
  ));
  sg1.appendChild(settingsRow(
    "Show target chips on every row",
    "Adds a → Target chip inside the NAME of every row. Off by default — chips still appear on hover for swallowed rows (FLT Guard 2).",
    toggle(true)
  ));
  sg1.appendChild(settingsRow(
    "Show PATH column",
    "Off = hide the PATH column, show folder name only. Useful for narrow panels and users who navigate by name.",
    toggle(true)
  ));
  sg1.appendChild(divider(PANEL_W - 40, C.border, 0.4));

  const sg1DefLabel = vSec(PANEL_W - 40);
  sg1DefLabel.itemSpacing = 2;
  sg1DefLabel.appendChild(txt("New watch folder defaults (pre-defaults by devs)", F.m, 12, C.borderBright));
  sg1DefLabel.appendChild(txtW("Initial per-column state applied to every newly added folder. Change anytime per row — these defaults only fire at row creation. Global Auto-import (above) gates whether any auto-import actually fires — this column is pure per-row intent.", F.r, 10, C.textDim, PANEL_W - 40, 14));
  sg1.appendChild(sg1DefLabel);

  const sg1DefRow = hSec(PANEL_W - 40);
  sg1DefRow.itemSpacing = 18;
  sg1DefRow.counterAxisAlignItems = "CENTER";
  sg1DefRow.primaryAxisAlignItems = "MIN";
  sg1DefRow.appendChild(defaultsCell("SUB", true, C.accent));
  sg1DefRow.appendChild(defaultsCell("REL", false));
  sg1DefRow.appendChild(defaultsCell("SEQ", true, C.accent));
  sg1DefRow.appendChild(defaultsCell("FLT", false));
  sg1DefRow.appendChild(defaultsCell("EYE", true, C.accent));
  sg1DefRow.appendChild(defaultsCell("DEL", false));
  sg1.appendChild(sg1DefRow);
  sg1.appendChild(txtW(
    "SUB=on recursive watching · REL=off · SEQ=on (Premiere native sequence detection) · FLT=off · EYE=on (per-row auto-import intent; global Auto-import above gates whether it fires) · DEL=off. DEL is additionally FORCED off in Simplified regardless of this default (#41).",
    F.i, 10, C.textDim, PANEL_W - 40, 14
  ));

  settingsPanel.appendChild(sg1);
  settingsPanel.appendChild(divider(PANEL_W, C.border, 0.6));

  // 12.2 Import filters
  const sg2 = settingsSection("12.2 Import filters");
  const sg2Mode = hSec(PANEL_W - 40);
  sg2Mode.itemSpacing = 24;
  sg2Mode.counterAxisAlignItems = "CENTER";
  sg2Mode.primaryAxisAlignItems = "SPACE_BETWEEN";
  const sg2ModeLbl = vHug();
  sg2ModeLbl.itemSpacing = 2;
  sg2ModeLbl.appendChild(txt("Mode", F.m, 12, C.borderBright));
  sg2ModeLbl.appendChild(txtW("How the Extensions list is interpreted.", F.r, 10, C.textDim, 220, 14));
  sg2Mode.appendChild(sg2ModeLbl);
  const sg2Radios = hHug();
  sg2Radios.itemSpacing = 18;
  sg2Radios.counterAxisAlignItems = "CENTER";
  const sgrA = hHug();
  sgrA.itemSpacing = 6;
  sgrA.counterAxisAlignItems = "CENTER";
  sgrA.appendChild(stRadio(true));
  sgrA.appendChild(txt("Allowlist — nothing except", F.m, 11, C.borderBright));
  sg2Radios.appendChild(sgrA);
  const sgrD = hHug();
  sgrD.itemSpacing = 6;
  sgrD.counterAxisAlignItems = "CENTER";
  sgrD.appendChild(stRadio(false));
  sgrD.appendChild(txt("Denylist — everything except", F.m, 11, C.textDim));
  sg2Radios.appendChild(sgrD);
  sg2Mode.appendChild(sg2Radios);
  sg2.appendChild(sg2Mode);

  const sg2ExtLabel = vSec(PANEL_W - 40);
  sg2ExtLabel.itemSpacing = 2;
  sg2ExtLabel.appendChild(txt("Extensions", F.m, 12, C.borderBright));
  sg2ExtLabel.appendChild(txtW("Click × to remove, + to add. Switching mode above swaps the visible list — each mode has its own independent chip set.", F.r, 10, C.textDim, PANEL_W - 40, 14));
  sg2.appendChild(sg2ExtLabel);

  const sg2ChipsA = hSec(PANEL_W - 40);
  sg2ChipsA.itemSpacing = 6;
  sg2ChipsA.counterAxisAlignItems = "CENTER";
  sg2ChipsA.primaryAxisAlignItems = "MIN";
  ["mp4", "mov", "mxf", "avi", "wav", "mp3", "aif", "png", "jpg", "tif"].forEach(function(ext) {
    sg2ChipsA.appendChild(stFilterChip("." + ext));
  });
  sg2.appendChild(sg2ChipsA);

  const sg2ChipsB = hSec(PANEL_W - 40);
  sg2ChipsB.itemSpacing = 6;
  sg2ChipsB.counterAxisAlignItems = "CENTER";
  sg2ChipsB.primaryAxisAlignItems = "MIN";
  ["psd", "ai", "exr", "dpx", "r3d", "ari"].forEach(function(ext) {
    sg2ChipsB.appendChild(stFilterChip("." + ext));
  });
  sg2ChipsB.appendChild(stAddChip("+ add"));
  sg2.appendChild(sg2ChipsB);

  sg2.appendChild(divider(PANEL_W - 40, C.border, 0.4));

  const sg2HiddenRow = hSec(PANEL_W - 40);
  sg2HiddenRow.itemSpacing = 12;
  sg2HiddenRow.counterAxisAlignItems = "CENTER";
  sg2HiddenRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  const sg2HLbl = vHug();
  sg2HLbl.itemSpacing = 2;
  sg2HLbl.appendChild(txt("Skip hidden & service files", F.m, 12, C.borderBright));
  sg2HLbl.appendChild(txtW(".DS_Store · Thumbs.db · desktop.ini · ~$* · *.tmp · *.part. Separate from Extensions — always applies when on.", F.r, 10, C.textDim, PANEL_W - 160, 14));
  sg2HiddenRow.appendChild(sg2HLbl);
  sg2HiddenRow.appendChild(toggle(true));
  sg2.appendChild(sg2HiddenRow);

  sg2.appendChild(txtW("Presets — add custom patterns as needed. Shell globs (*, ?, []) supported.", F.r, 10, C.textDim, PANEL_W - 40, 14));
  const sg2SvcChips = hSec(PANEL_W - 40);
  sg2SvcChips.itemSpacing = 6;
  sg2SvcChips.counterAxisAlignItems = "CENTER";
  sg2SvcChips.primaryAxisAlignItems = "MIN";
  [".DS_Store", "Thumbs.db", "desktop.ini", "~$*", "*.tmp", "*.part"].forEach(function(pat) {
    sg2SvcChips.appendChild(stFilterChip(pat));
  });
  sg2SvcChips.appendChild(stAddChip("+ add pattern"));
  sg2.appendChild(sg2SvcChips);
  sg2.appendChild(txtW("When the toggle is off, this list is ignored but preserved.", F.i, 10, C.textDim, PANEL_W - 40, 14));

  settingsPanel.appendChild(sg2);
  settingsPanel.appendChild(divider(PANEL_W, C.border, 0.6));

  // 12.3 Behavior
  const sg3 = settingsSection("12.3 Behavior");
  sg3.appendChild(settingsRow(
    "Safety cover duration",
    "Seconds after cover lifts before auto re-lock. Applies to FLT and DEL covers.",
    numberDrop("4 s")
  ));
  sg3.appendChild(divider(PANEL_W - 40, C.border, 0.3));
  sg3.appendChild(settingsRow(
    "Undo toast duration",
    "Window after a destructive commit to hit Undo before OS trash becomes the only recovery.",
    numberDrop("3 s")
  ));
  settingsPanel.appendChild(sg3);
  settingsPanel.appendChild(divider(PANEL_W, C.border, 0.6));

  // 12.4 Danger zone
  const sg4Wrap = vSec(PANEL_W);
  sg4Wrap.paddingLeft = 20; sg4Wrap.paddingRight = 20;
  sg4Wrap.paddingTop = 18; sg4Wrap.paddingBottom = 18;
  sg4Wrap.itemSpacing = 10;
  sg4Wrap.appendChild(txt("12.4 Danger zone", F.s, 12, C.white, undefined, 0.4));

  const sg4Shell = vSec(PANEL_W - 40);
  sg4Shell.cornerRadius = 6;
  setFill(sg4Shell, C.canvas, 1);
  setStroke(sg4Shell, C.danger, 0.55, 1);
  sg4Shell.paddingTop = 14; sg4Shell.paddingBottom = 14;
  sg4Shell.paddingLeft = 16; sg4Shell.paddingRight = 16;
  sg4Shell.itemSpacing = 10;

  const sg4Head = hHug();
  sg4Head.itemSpacing = 8;
  sg4Head.counterAxisAlignItems = "CENTER";
  sg4Head.appendChild(txt("⚠", F.b, 12, C.danger));
  sg4Head.appendChild(txt("Enable destructive actions (Advanced only)", F.s, 11, C.danger, undefined, 0.6));
  sg4Shell.appendChild(sg4Head);

  // Two gates: (1) show DEL column in Advanced, (2) arm global Mirror DEL master switch.
  const sg4ToggleRow = hSec(PANEL_W - 72);
  sg4ToggleRow.itemSpacing = 12;
  sg4ToggleRow.counterAxisAlignItems = "CENTER";
  sg4ToggleRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  const sg4TLbl = vHug();
  sg4TLbl.itemSpacing = 2;
  sg4TLbl.appendChild(txt("Enable DEL column", F.m, 12, C.borderBright));
  sg4TLbl.appendChild(txtW("Reveals the permission column in Advanced. Hidden in Simplified regardless (#41). Clicking a DEL cell grants PERMISSION only — does not destroy. Actual OS delete requires master switch below + user's Premiere-side bin delete.", F.r, 10, C.textDim, PANEL_W - 160, 14));
  sg4ToggleRow.appendChild(sg4TLbl);
  sg4ToggleRow.appendChild(toggle(true));
  sg4Shell.appendChild(sg4ToggleRow);

  sg4Shell.appendChild(divider(PANEL_W - 72, C.danger, 0.3));

  // Master switch — global Mirror DEL. Default OFF (#45). When OFF, even with per-row DEL=on nothing trashes.
  const sg4MirrorRow = hSec(PANEL_W - 72);
  sg4MirrorRow.itemSpacing = 12;
  sg4MirrorRow.counterAxisAlignItems = "CENTER";
  sg4MirrorRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  const sg4MLbl = vHug();
  sg4MLbl.itemSpacing = 2;
  sg4MLbl.appendChild(txt("Global Mirror DEL (master switch)", F.m, 12, C.borderBright));
  sg4MLbl.appendChild(txtW("OFF by default (#45). When OFF: nothing trashes regardless of per-row DEL. When ON: user's Premiere bin/file delete from a tracked path + row DEL=on → timer + OS trash (see §9 for the full flow).", F.r, 10, C.textDim, PANEL_W - 160, 14));
  sg4MirrorRow.appendChild(sg4MLbl);
  sg4MirrorRow.appendChild(toggle(false));  // default OFF
  sg4Shell.appendChild(sg4MirrorRow);

  sg4Wrap.appendChild(sg4Shell);
  settingsPanel.appendChild(sg4Wrap);
  settingsPanel.appendChild(divider(PANEL_W, C.border, 0.6));

  // 12.5 Advanced / Logs
  const sg5 = settingsSection("12.5 Advanced / Logs");
  sg5.appendChild(settingsRow(
    "Auto-log to disk",
    "When off, logs stay in memory only. Dump now still works for on-demand snapshots.",
    toggle(false)
  ));
  sg5.appendChild(divider(PANEL_W - 40, C.border, 0.3));

  const sg5PathCol = vSec(PANEL_W - 40);
  sg5PathCol.itemSpacing = 4;
  sg5PathCol.appendChild(txt("Debug log path", F.m, 12, C.borderBright));
  const sg5PathBox = hSec(PANEL_W - 40);
  sg5PathBox.paddingTop = 7; sg5PathBox.paddingBottom = 7;
  sg5PathBox.paddingLeft = 10; sg5PathBox.paddingRight = 10;
  sg5PathBox.cornerRadius = 3;
  sg5PathBox.counterAxisAlignItems = "CENTER";
  setFill(sg5PathBox, C.canvas, 1);
  setStroke(sg5PathBox, C.border, 1, 1);
  sg5PathBox.appendChild(txt("%APPDATA%/Adobe/CEP/extensions/sheepdog/sheepdog-debug.log", F.r, 10, C.textDim));
  sg5PathCol.appendChild(sg5PathBox);
  sg5.appendChild(sg5PathCol);

  const sg5BtnRow = hSec(PANEL_W - 40);
  sg5BtnRow.itemSpacing = 10;
  sg5BtnRow.counterAxisAlignItems = "CENTER";
  sg5BtnRow.primaryAxisAlignItems = "MIN";
  sg5BtnRow.appendChild(btnGhost("Save log…"));
  sg5BtnRow.appendChild(btnGhost("Dump now"));
  sg5BtnRow.appendChild(btnGhost("Open log folder"));
  sg5.appendChild(sg5BtnRow);

  sg5.appendChild(txtW("Dump now — full diagnostic snapshot (watch folders + settings + recent errors) to the debug folder above. For bug reports.", F.r, 10, C.textDim, PANEL_W - 40, 14));

  settingsPanel.appendChild(sg5);
  settingsPanel.appendChild(divider(PANEL_W, C.border, 1));

  // Footer
  const sgFoot = hSec(PANEL_W);
  sgFoot.paddingLeft = 20; sgFoot.paddingRight = 20;
  sgFoot.paddingTop = 14; sgFoot.paddingBottom = 14;
  sgFoot.counterAxisAlignItems = "CENTER";
  sgFoot.primaryAxisAlignItems = "MAX";
  sgFoot.itemSpacing = 10;
  setFill(sgFoot, C.panelAlt, 1);
  sgFoot.appendChild(btnGhost("Cancel"));
  sgFoot.appendChild(btnPrimary("Save changes"));
  settingsPanel.appendChild(sgFoot);

  sec12Row.appendChild(settingsPanel);

  // Right column — rules + decision log
  const sec12Notes = vSec(contentW - PANEL_W - 32);
  sec12Notes.itemSpacing = 12;

  const sgRules = vSec(contentW - PANEL_W - 32);
  sgRules.cornerRadius = 8;
  setFill(sgRules, C.panel, 1);
  setStroke(sgRules, C.accent, 0.4, 1);
  sgRules.paddingTop = 16; sgRules.paddingBottom = 16;
  sgRules.paddingLeft = 20; sgRules.paddingRight = 20;
  sgRules.itemSpacing = 8;
  const sgRulesHead = hHug();
  sgRulesHead.itemSpacing = 10;
  sgRulesHead.counterAxisAlignItems = "CENTER";
  const sgRulesDot = figma.createFrame();
  sgRulesDot.resize(6, 6); sgRulesDot.cornerRadius = 3;
  setFill(sgRulesDot, C.accent, 1);
  sgRulesHead.appendChild(sgRulesDot);
  sgRulesHead.appendChild(txt("Settings rules", F.s, 12, C.white, undefined, 0.5));
  sgRules.appendChild(sgRulesHead);

  const sgRulesBullets = [
    "Modal overlay — covers the entire panel UI. Not a drawer, not a tab. Room for future options and single focus.",
    "SOT: Settings owns every global flag. Header Advanced toggle is a shortcut that flips the same underlying state — no duplicate truth.",
    "New folder defaults applies only at row creation. Changing defaults later does NOT rewrite existing rows.",
    "Filter mode (Allowlist / Denylist) is project-wide in v1.0. Per-folder overrides punted to v1.1.",
    "Hidden/service file skip is a separate switch — orthogonal to extension filters. Always applies when on.",
    "Danger zone uses red border as the gate-warning — it sits OUTSIDE the column. Column itself stays calm (activation-only red). Per #41 DEL column stays hidden in Simplified regardless.",
    "Save / Cancel both close the modal. Unsaved changes → confirm before Cancel. No auto-save.",
  ];
  for (let i = 0; i < sgRulesBullets.length; i++) {
    const rr = hSec(contentW - PANEL_W - 72);
    rr.itemSpacing = 8;
    rr.counterAxisAlignItems = "MIN";
    rr.appendChild(txt("•", F.b, 12, C.accent));
    rr.appendChild(txtW(sgRulesBullets[i], F.r, 11, C.borderBright, contentW - PANEL_W - 96, 16));
    sgRules.appendChild(rr);
  }
  sec12Notes.appendChild(sgRules);

  const sgWhy = vSec(contentW - PANEL_W - 32);
  sgWhy.cornerRadius = 8;
  setFill(sgWhy, C.panel, 1);
  setStroke(sgWhy, C.border, 1, 1);
  sgWhy.paddingTop = 16; sgWhy.paddingBottom = 16;
  sgWhy.paddingLeft = 20; sgWhy.paddingRight = 20;
  sgWhy.itemSpacing = 8;
  const sgWhyHead = hHug();
  sgWhyHead.itemSpacing = 10;
  sgWhyHead.counterAxisAlignItems = "CENTER";
  const sgWhyDot = figma.createFrame();
  sgWhyDot.resize(6, 6); sgWhyDot.cornerRadius = 3;
  setFill(sgWhyDot, C.textDim, 1);
  sgWhyHead.appendChild(sgWhyDot);
  sgWhyHead.appendChild(txt("Decision log — v2.0 (2026-04-24)", F.s, 12, C.white, undefined, 0.5));
  sgWhy.appendChild(sgWhyHead);
  sgWhy.appendChild(txtW(
    "Modal over drawer: Settings is rare-but-consequential. A drawer steals horizontal space from the folder list; a tab drops context. A modal gives room for future options and single focus. " +
    "SOT in Settings, shortcut in header: observed failure mode in Watchtower — global toggle flipped from two independent places gets confusing. One canonical store, multiple entry points. " +
    "Advanced toggle renamed from v1.2's \"Auto Sync\" (#34): the toggle now governs mode (column visibility + Defaults) + auto-sync + EYE override surface — one switch, many outcomes. \"Easy\" felt patronizing, \"Pro\" implied tiering; Advanced is neutral. " +
    "AUTO-SYNC global-inheritance demo removed from v1.2: with the new semantic, Advanced is a mode switch — not a cascade source. EYE is a per-row tier control (overridden / inherited / disabled), orthogonal to Advanced. " +
    "Both filter modes matter: Denylist for \"import everything except these\" (loose shoots, unknown codecs). Allowlist for \"strict pipeline, only these\". Not an either/or. " +
    "Hidden/service skip as its own switch: orthogonal concept. Changing extension filters shouldn't force re-managing .DS_Store / Thumbs.db every time.",
    F.r, 11, C.textDim, contentW - PANEL_W - 72, 16
  ));
  sec12Notes.appendChild(sgWhy);

  sec12Row.appendChild(sec12Notes);
  sec12.appendChild(sec12Row);
  root.appendChild(sec12);

  // ==================================================
  // §13 — Plugin responsibility boundary (spec §16)
  // Three layers: Config (owned) / FS (read-only) / Premiere (ExtendScript mediated).
  // Every cross-boundary op is explicit opt-in.
  // ==================================================

  const sec13 = vSec(contentW);
  sec13.itemSpacing = 16;
  sec13.appendChild(sectionTitle(
    "§13 — Plugin responsibility boundary (spec §16)",
    "SheepDog operates across three layers with strict ownership. Cross-boundary operations are always explicit opt-in — no silent side-effects.",
    contentW
  ));

  const layerRow = hSec(contentW);
  layerRow.itemSpacing = 20;
  layerRow.counterAxisAlignItems = "MIN";

  function layerCard(title, color, scope, owned, notOwned, crossNote) {
    const cardW = Math.floor((contentW - 40) / 3);
    const c = vSec(cardW);
    c.cornerRadius = 8;
    setFill(c, C.panel, 1);
    setStroke(c, color, 0.4, 1);
    c.paddingTop = 18; c.paddingBottom = 18;
    c.paddingLeft = 20; c.paddingRight = 20;
    c.itemSpacing = 12;

    const h = hHug();
    h.itemSpacing = 10;
    h.counterAxisAlignItems = "CENTER";
    const ch = figma.createFrame();
    ch.resize(8, 8); ch.cornerRadius = 4;
    setFill(ch, color, 1);
    h.appendChild(ch);
    h.appendChild(txt(title, F.b, 14, C.white, undefined, 0.3));
    c.appendChild(h);
    c.appendChild(txtW(scope, F.r, 11, C.borderBright, cardW - 40, 16));

    c.appendChild(txt("Owned:", F.s, 10, C.success, undefined, 0.5));
    for (const item of owned) {
      const line = hSec(cardW - 40);
      line.itemSpacing = 6;
      line.counterAxisAlignItems = "MIN";
      line.appendChild(txt("✓", F.b, 11, C.success));
      line.appendChild(txtW(item, F.r, 10, C.borderBright, cardW - 56, 14));
      c.appendChild(line);
    }

    c.appendChild(txt("Not owned:", F.s, 10, C.danger, undefined, 0.5));
    for (const item of notOwned) {
      const line = hSec(cardW - 40);
      line.itemSpacing = 6;
      line.counterAxisAlignItems = "MIN";
      line.appendChild(txt("✗", F.b, 11, C.danger));
      line.appendChild(txtW(item, F.r, 10, C.textDim, cardW - 56, 14));
      c.appendChild(line);
    }

    if (crossNote) {
      const noteBox = vSec(cardW - 40);
      noteBox.paddingTop = 8; noteBox.paddingBottom = 8;
      noteBox.paddingLeft = 10; noteBox.paddingRight = 10;
      noteBox.cornerRadius = 4;
      setFill(noteBox, C.amber, 0.1);
      setStroke(noteBox, C.amber, 0.35, 1);
      noteBox.appendChild(txt("⚠ Cross-boundary", F.s, 10, C.amber, undefined, 0.5));
      noteBox.appendChild(txtW(crossNote, F.r, 10, C.borderBright, cardW - 60, 14));
      c.appendChild(noteBox);
    }
    return c;
  }

  layerRow.appendChild(layerCard(
    "Config layer",
    C.accent,
    "SheepDog's own JSON — watch folders, settings, ui.order. Lives in %APPDATA%. Free to read/write/delete.",
    [
      "Add / remove watch folder entries",
      "Per-row overrides (SUB/REL/SEQ/FLT/EYE/LBL/DEL)",
      "Sort state (ui.order)",
      "Global settings (filters, Advanced mode, Danger zone)",
    ],
    [
      "User-level Adobe preferences (don't touch)",
      "OS / filesystem state outside of SheepDog's own files",
    ],
    null
  ));

  layerRow.appendChild(layerCard(
    "Filesystem layer",
    C.amber,
    "User's actual folders + media files on disk. READ-ONLY by default. SheepDog watches, never mutates without explicit opt-in.",
    [
      "fs.watch / chokidar — observe changes",
      "Read file metadata (size, mtime, extension)",
      "Probe path reachability (for Missing detection)",
    ],
    [
      "Create/rename/delete folders — OS owns",
      "Move files — user or Finder/CLI",
      "Modify file contents — never",
    ],
    "Mirror DEL (per §9 — revised 2026-04-25): the ONLY way SheepDog touches OS. Permission model, not commit model. Fires iff: (A) user deletes bin/file INSIDE Premiere from a tracked path, (B) row DEL=on, (C) global Mirror DEL master switch ON (default off per #45). Timer + Cancel like Import. Plugin Explorer is a mediator — no \"destroy\" button in the panel UI itself."
  ));

  layerRow.appendChild(layerCard(
    "Premiere layer",
    C.labelCerulean,
    "Active Premiere project. Mediated exclusively via ExtendScript — no direct project file I/O.",
    [
      "Create bins (app.project.rootItem.createBin)",
      "Import files into bins (importFiles)",
      "Read bin structure (for reverse-sync / Gather)",
      "Apply color labels to imported items",
    ],
    [
      "Modify sequences / timelines — never",
      "Edit other panels' state",
      "Import w/o user-visible progress (respect Media Encoder parity)",
    ],
    "Premiere guard wins: a bin with clips in active use will not purge on DEL commit. SheepDog reports \"Skipped, N clips in use\" and highlights offending rows amber. Premiere's native \"clip in use\" protection is treated as a second natural belt (defense in depth)."
  ));

  sec13.appendChild(layerRow);

  // Implications card
  const sec13Implications = vSec(contentW);
  sec13Implications.cornerRadius = 8;
  setFill(sec13Implications, C.panel, 1);
  setStroke(sec13Implications, C.textDim, 0.4, 1);
  sec13Implications.paddingTop = 18; sec13Implications.paddingBottom = 18;
  sec13Implications.paddingLeft = 22; sec13Implications.paddingRight = 22;
  sec13Implications.itemSpacing = 10;

  const implHead = hHug();
  implHead.itemSpacing = 10;
  implHead.counterAxisAlignItems = "CENTER";
  const implChip = figma.createFrame();
  implChip.resize(6, 6); implChip.cornerRadius = 3;
  setFill(implChip, C.textDim, 1);
  implHead.appendChild(implChip);
  implHead.appendChild(txt("UX implications", F.s, 12, C.white, undefined, 0.5));
  sec13Implications.appendChild(implHead);

  const implBullets = [
    "× on parent row (§6 × matrix): config-layer-only op. Instant, safe — doesn't touch FS or Premiere. Tooltip \"Remove folder from SheepDog\".",
    "× on child row: config-layer toggle (force-disable / restore). Plugin does NOT delete child files — user deletes in OS first, then × cleans up config (#44).",
    "Missing state: triggered by FS probe failure. Plugin does not try to \"recover\" missing files — user re-links via ⌕ or deletes entry.",
    "Mirror DEL (§9): not a button click. User deletes a bin/file INSIDE Premiere (from a tracked path); plugin detects → arms red timer → user can Cancel during the window → OS trash on expiry. Needs row DEL=on + global Mirror DEL master switch. Structure-lock blocks the flow if bin tree is not 1:1 with SoT (use Magnet to restore parity).",
    "Import: normal cross-boundary flow (FS read → Premiere write). User always sees progress (§10 panel). No silent imports.",
  ];
  for (const b of implBullets) {
    const line = hSec(contentW - 44);
    line.itemSpacing = 8;
    line.counterAxisAlignItems = "MIN";
    line.appendChild(txt("→", F.b, 12, C.textDim));
    line.appendChild(txtW(b, F.r, 11, C.borderBright, contentW - 60, 16));
    sec13Implications.appendChild(line);
  }
  sec13.appendChild(sec13Implications);
  root.appendChild(sec13);

  // ==================================================
  // §14 — Magnet + Herder Bucket · structure restoration (2026-04-25)
  //
  // Context: users can freely rearrange bins in Premiere, and they can mix
  // their own side-files into SheepDog-managed bins. That breaks the
  // deterministic 1:1 mapping Mirror DEL needs (§9 structure-lock). Magnet
  // is the "put-everything-back" button; Herder Bucket is the safe harbour
  // for user's own files that would otherwise get destroyed by a legitimate
  // SheepDog structural op (FLT toggle, Magnet reconciliation).
  //
  // SUB=off soft-stop: existing files stay as legitimate (our manifest); new
  // files don't come in. FLT and Magnet continue to handle them normally.
  // They do NOT move to Herder Bucket — that's for orphans only.
  // ==================================================

  const sec14 = vSec(contentW);
  sec14.itemSpacing = 16;
  sec14.appendChild(sectionTitle(
    "§14 — Magnet + Herder Bucket · structure restoration",
    "Magnet = \"pull everything back to SoT layout\". Herder Bucket = top-level safe harbour for user's side-files when a legit structural op would destroy them. Together they guarantee Mirror DEL's parity invariant without ever losing user data.",
    contentW
  ));

  // ---- Rule card: SoT parity + Magnet's job ----
  const mgRule = vSec(contentW);
  mgRule.cornerRadius = 8;
  setFill(mgRule, C.panel, 1);
  setStroke(mgRule, C.accent, 0.4, 1);
  mgRule.paddingTop = 16; mgRule.paddingBottom = 16;
  mgRule.paddingLeft = 20; mgRule.paddingRight = 20;
  mgRule.itemSpacing = 8;
  const mgRuleHead = hHug();
  mgRuleHead.itemSpacing = 10;
  mgRuleHead.counterAxisAlignItems = "CENTER";
  const mgRuleDot = figma.createFrame();
  mgRuleDot.resize(6, 6); mgRuleDot.cornerRadius = 3;
  setFill(mgRuleDot, C.accent, 1);
  mgRuleHead.appendChild(mgRuleDot);
  mgRuleHead.appendChild(txt("Rule — SoT is OS layout; Magnet restores parity", F.s, 12, C.white, undefined, 0.5));
  mgRule.appendChild(mgRuleHead);
  mgRule.appendChild(txtW(
    "Premiere bin tree MUST be 1:1 with OS folder tree (as SheepDog sees it) for Mirror DEL to be safe. User may rearrange bins freely — plugin watches and reports divergence (structure-lock per §9). Magnet click = reconcile: move bins back to their tracked positions; pull scattered legitimate files back into their bins. All user additions preserved.",
    F.m, 12, C.borderBright, contentW - 40, 18
  ));
  mgRule.appendChild(txtW(
    "Two actor classes in Magnet's world:  (1) LEGITIMATE — files/bins in SheepDog's manifest (imported by plugin, tracked).  (2) SIDE — user's own additions inside SheepDog-managed bins.  Magnet moves legitimate content to parity; user side-files either stay in place, ride along as duplicates, or land in Herder Bucket — never deleted.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  sec14.appendChild(mgRule);

  // ---- Scenario matrix: 4 scenarios (FLT-on, FLT-off flip-back, Magnet, mixed-side-files) ----
  const mgScenTitle = vSec(contentW);
  mgScenTitle.itemSpacing = 4;
  mgScenTitle.appendChild(txt("Scenario matrix — FLT / Magnet with and without user side-files", F.s, 13, C.white, undefined, 0.3));
  mgScenTitle.appendChild(txtW("Each scenario assumes a tracked bin tree and user activity inside Premiere. Outcomes show what SheepDog does, and where user side-files end up.", F.r, 11, C.textDim, contentW, 16));
  sec14.appendChild(mgScenTitle);

  function mgScenCard(label, premise, action, outcome, sideFilesPolicy) {
    const cardW = Math.floor((contentW - 32) / 2);
    const c = vSec(cardW);
    c.cornerRadius = 8;
    setFill(c, C.panel, 1);
    setStroke(c, C.border, 1, 1);
    c.paddingTop = 16; c.paddingBottom = 16;
    c.paddingLeft = 20; c.paddingRight = 20;
    c.itemSpacing = 10;

    const h = hHug();
    h.itemSpacing = 10;
    h.counterAxisAlignItems = "CENTER";
    const chipDot = figma.createFrame();
    chipDot.resize(6, 6); chipDot.cornerRadius = 3;
    setFill(chipDot, C.accent, 1);
    h.appendChild(chipDot);
    h.appendChild(txt(label, F.s, 13, C.white, undefined, 0.3));
    c.appendChild(h);

    function bullet(title, body, color) {
      const row = hSec(cardW - 40);
      row.itemSpacing = 6;
      row.counterAxisAlignItems = "MIN";
      const tag = hHug();
      tag.paddingTop = 2; tag.paddingBottom = 2;
      tag.paddingLeft = 6; tag.paddingRight = 6;
      tag.cornerRadius = 3;
      tag.counterAxisAlignItems = "CENTER";
      setFill(tag, color, 0.18);
      setStroke(tag, color, 0.45, 1);
      tag.appendChild(txt(title, F.s, 9, color, undefined, 0.3));
      row.appendChild(tag);
      row.appendChild(txtW(body, F.r, 11, C.borderBright, cardW - 40 - 80, 15));
      return row;
    }

    c.appendChild(bullet("PREMISE", premise, C.textDim));
    c.appendChild(bullet("ACTION", action, C.accent));
    c.appendChild(bullet("OUTCOME", outcome, C.success));
    c.appendChild(bullet("SIDE FILES", sideFilesPolicy, C.amber));
    return c;
  }

  const mgScenRow1 = hSec(contentW);
  mgScenRow1.itemSpacing = 16;
  mgScenRow1.counterAxisAlignItems = "MIN";

  mgScenRow1.appendChild(mgScenCard(
    "Scenario A — FLT=ON click (clean state)",
    "Bins in parity with SoT. Row's FLT currently OFF. User clicks FLT=ON.",
    "All descendant legitimate files flow up into nearest surviving ancestor bin per §6 \"double-OFF\" rule. Swallowed bins disappear from Premiere.",
    "Parity preserved — tree just got flatter. Mirror DEL stays safe.",
    "No side files in play → nothing to protect. Clean toggle."
  ));
  mgScenRow1.appendChild(mgScenCard(
    "Scenario B — FLT=OFF revert (flip back)",
    "Previously-flattened row (FLT=ON). Row's OWN bin tree dissolved; legit files live in ancestor's flat bucket. User clicks FLT=OFF.",
    "Bins get recreated according to SoT. Legit files pull back into their respective recreated bins.",
    "Parity restored. Mirror DEL re-enabled if structure-lock was triggered before.",
    "Side files in the ancestor bin that user added during the flat era — stay put as side-files in the ancestor. They're not \"ours\" to reshuffle."
  ));
  sec14.appendChild(mgScenRow1);

  const mgScenRow2 = hSec(contentW);
  mgScenRow2.itemSpacing = 16;
  mgScenRow2.counterAxisAlignItems = "MIN";

  mgScenRow2.appendChild(mgScenCard(
    "Scenario C — FLT click with user side-files mixed into our bins",
    "A sub-bin contains OUR legit files + user's side files added in Premiere. User flips FLT=ON on parent (would normally dissolve sub-bin).",
    "Sub-bin STAYS (user side files live there — can't be silently destroyed). Our files get pulled up into the parent's flat bucket, where they now co-exist with their duplicate siblings in the sub-bin.",
    "Subtree visually unexpected (duplicate-feeling) but NO LEGIT DATA LOSS. User's problem to clean up — they mixed, not us.",
    "User side files remain in their sub-bin, untouched. Our legit files produce duplicates in flat bucket + sub-bin. User can magnet-reconcile later."
  ));
  mgScenRow2.appendChild(mgScenCard(
    "Scenario D — Magnet click to restore parity",
    "Bins scattered: user moved some out of parent bin; structure-lock blocked Mirror DEL on affected rows.",
    "Magnet walks the scattered bins, restores each to its SoT position. Legit files pull back into their proper bins. Bins with user side-files come along intact — side-files ride the move, stay inside their bin.",
    "Parity restored. Structure-lock cleared. Mirror DEL re-enabled on affected rows.",
    "If a legit structural op during restore would DELETE a bin containing user side-files → side-files lift out into Herder Bucket (see below). Never silent destroy."
  ));
  sec14.appendChild(mgScenRow2);

  // ---- Herder Bucket card ----
  sec14.appendChild(divider(contentW, C.border, 0.25));

  const mgHerder = vSec(contentW);
  mgHerder.cornerRadius = 8;
  setFill(mgHerder, C.panel, 1);
  setStroke(mgHerder, C.amber, 0.45, 1);
  mgHerder.paddingTop = 18; mgHerder.paddingBottom = 18;
  mgHerder.paddingLeft = 22; mgHerder.paddingRight = 22;
  mgHerder.itemSpacing = 10;
  const mgHerderHead = hHug();
  mgHerderHead.itemSpacing = 10;
  mgHerderHead.counterAxisAlignItems = "CENTER";
  const mgHerderDot = figma.createFrame();
  mgHerderDot.resize(6, 6); mgHerderDot.cornerRadius = 3;
  setFill(mgHerderDot, C.amber, 1);
  mgHerderHead.appendChild(mgHerderDot);
  mgHerderHead.appendChild(txt("Herder Bucket — safe harbour for user side-files", F.s, 13, C.white, undefined, 0.5));
  mgHerder.appendChild(mgHerderHead);

  mgHerder.appendChild(txtW(
    "Top-level bin at the Project root called \"Herder Bucket\". Created lazily — only when a legitimate structural op (FLT toggle, Magnet reconcile) would destroy a bin that contains user side-files. The side-files land here; the structural op proceeds on our legit content as planned.",
    F.r, 12, C.borderBright, contentW - 44, 18
  ));

  const mgHerderRules = [
    "Creation: lazy. First time a legit op meets user side-files in a destroy-bound bin → bucket is created. Never pre-created (keeps clean projects clean).",
    "Location: Project root, always. Not inside any SheepDog-tracked tree — so it can't get confused with tracked structure.",
    "Content: only user side-files at the moment of rescue. SheepDog-owned files never enter the bucket — they have canonical destinations.",
    "Per-file origin: each rescued file carries an ExtendScript user metadata tag (origin-path, rescued-at, rescue-reason). User can trace \"where was this from?\".",
    "Never auto-purged. User owns this bin. SheepDog won't reorganize it, won't delete it, won't magnet-pull from it. Mirror DEL doesn't touch it either.",
    "Visible in Explorer as an UN-TRACKED bin (ghost styling TBD) — reminder that it's user territory. Out of SheepDog's management.",
  ];
  for (const rule of mgHerderRules) {
    const bl = hSec(contentW - 44);
    bl.itemSpacing = 8;
    bl.counterAxisAlignItems = "MIN";
    bl.appendChild(txt("•", F.b, 12, C.amber));
    bl.appendChild(txtW(rule, F.r, 11, C.borderBright, contentW - 60, 16));
    mgHerder.appendChild(bl);
  }
  sec14.appendChild(mgHerder);

  // ---- SUB=off soft-stop rules ----
  const mgSubOff = vSec(contentW);
  mgSubOff.cornerRadius = 8;
  setFill(mgSubOff, C.panel, 1);
  setStroke(mgSubOff, C.textDim, 0.4, 1);
  mgSubOff.paddingTop = 18; mgSubOff.paddingBottom = 18;
  mgSubOff.paddingLeft = 22; mgSubOff.paddingRight = 22;
  mgSubOff.itemSpacing = 10;
  const mgSubHead = hHug();
  mgSubHead.itemSpacing = 10;
  mgSubHead.counterAxisAlignItems = "CENTER";
  const mgSubDot = figma.createFrame();
  mgSubDot.resize(6, 6); mgSubDot.cornerRadius = 3;
  setFill(mgSubDot, C.textDim, 1);
  mgSubHead.appendChild(mgSubDot);
  mgSubHead.appendChild(txt("Soft-stop family — SUB=off · Disabled (NOT Herder Bucket material)", F.s, 13, C.white, undefined, 0.5));
  mgSubOff.appendChild(mgSubHead);

  mgSubOff.appendChild(txtW(
    "TWO ways to soft-stop a row: SUB=off (cascade-stop new imports in subtree) and Disabled (× on a healthy child). Both behave identically: existing legit files STAY legitimate — they're still in our manifest. Magnet and FLT continue to treat them as tracked content; they do NOT get moved to Herder Bucket. Soft-stop is reversible — toggle SUB back on, or click ← on the disabled row, and watching resumes with stored settings intact.",
    F.r, 12, C.borderBright, contentW - 44, 18
  ));

  const mgSubRules = [
    "Why not Herder Bucket: bucket is for ORPHAN user side-files — files we never owned. Soft-stop files are \"ours, paused\". Their state is \"soft stopped\", not \"disowned\".",
    "Disabled and SUB=off are DIFFERENT axes but same outcome class: Disabled = this whole row paused (× by user, parent SUB cascade, parent disabled); SUB=off = stop new descendants (parent itself stays alive). Both pause new imports while preserving existing ones.",
    "FLT toggle in soft-stopped subtree: still works on the pre-paused files. Magnet reconciles them normally — they ride along with reorgs as legit content.",
    "User can manually delete pre-paused files inside Premiere — Mirror DEL applies same way if DEL=on on that row AND master switch on.",
    "Resume signals: SUB=off → toggle SUB back on. Disabled → click ← (arrow-left) in the RM column (blue hover indicates restore). Both restore stored overrides + resume watching.",
    "Want them truly orphaned? User can remove them from the manifest via further actions — parked precise semantics until a use-case warrants the surface.",
  ];
  for (const rule of mgSubRules) {
    const bl = hSec(contentW - 44);
    bl.itemSpacing = 8;
    bl.counterAxisAlignItems = "MIN";
    bl.appendChild(txt("•", F.b, 12, C.textDim));
    bl.appendChild(txtW(rule, F.r, 11, C.borderBright, contentW - 60, 16));
    mgSubOff.appendChild(bl);
  }
  sec14.appendChild(mgSubOff);

  // ---- Decision log ----
  const mgWhy = vSec(contentW);
  mgWhy.cornerRadius = 8;
  setFill(mgWhy, C.panel, 1);
  setStroke(mgWhy, C.accent, 0.4, 1);
  mgWhy.paddingTop = 16; mgWhy.paddingBottom = 16;
  mgWhy.paddingLeft = 20; mgWhy.paddingRight = 20;
  mgWhy.itemSpacing = 8;
  const mgWhyHead = hHug();
  mgWhyHead.itemSpacing = 10;
  mgWhyHead.counterAxisAlignItems = "CENTER";
  const mgWhyDot = figma.createFrame();
  mgWhyDot.resize(6, 6); mgWhyDot.cornerRadius = 3;
  setFill(mgWhyDot, C.accent, 1);
  mgWhyHead.appendChild(mgWhyDot);
  mgWhyHead.appendChild(txt("Decision log — 2026-04-25", F.s, 12, C.white, undefined, 0.5));
  mgWhy.appendChild(mgWhyHead);

  mgWhy.appendChild(txtW(
    "Magnet earns its seat because Mirror DEL requires parity — and users WILL rearrange bins in Premiere. Without Magnet, structure-lock (§9) is a dead-end: \"fix it yourself\" is not a UX. With Magnet, the flow is \"rearrange → lock → click Magnet → unlock\". Self-healing.",
    F.r, 12, C.borderBright, contentW - 40, 18
  ));
  mgWhy.appendChild(txtW(
    "Duplicate-not-destroy on side-files mixed into our bins: alternative would be to either (a) refuse to operate, or (b) trash user files. (a) paints the user into a corner; (b) destroys their work silently. Duplicates are annoying but reversible — user sees the problem, understands, cleans up. Data integrity P0 wins over clean-state P2.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  mgWhy.appendChild(txtW(
    "Herder Bucket is project-root, not a sheepdog subfolder: it's user territory, should live where Premiere users expect user bins. Untracked styling + lazy creation keeps it out of sight when not needed.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  mgWhy.appendChild(txtW(
    "SUB=off NOT Herder: files are paused, not orphaned. Herder is for files we never owned (user added). Mixing the two would confuse \"where are my Sheep-pulled files?\" answers.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  sec14.appendChild(mgWhy);

  root.appendChild(sec14);

  // ==================================================
  // §REF — Palette SOT + checkbox / eye / button taxonomy tables
  // Imported from panel-v1.2 §1.5 (IIFE-scoped helpers). SOT for every
  // (class, value) pair used throughout v2.0 renderers.
  // ==================================================

  const secREF = vSec(contentW);
  secREF.itemSpacing = 16;
  secREF.appendChild(sectionTitle(
    "§REF — Palette · checkbox · eye · icon button · state taxonomy",
    "10-token palette SOT, full checkbox + eye (class, value) matrices, and Adobe-parity icon-button state ladder. Every colour used elsewhere in this doc is a lookup into the palette card. Referenced by §1 (taxonomy demos), §3 (cycle), §6 (FLT), §9 (DEL), §11 (icons).",
    contentW
  ));

  const taxBlock = (function() {
    const Ct = {
      panel:        { r: 0.145, g: 0.145, b: 0.157 },
      border:       { r: 0.302, g: 0.302, b: 0.322 },
      textDim:      { r: 0.600, g: 0.600, b: 0.631 },
      borderBright: { r: 0.843, g: 0.843, b: 0.855 },
      strokeMid:    { r: 0.486, g: 0.486, b: 0.514 },
      backMid:      { r: 0.294, g: 0.294, b: 0.306 },
      backDim:      { r: 0.196, g: 0.196, b: 0.206 },
      accent:       { r: 0.078, g: 0.471, b: 0.949 },
      accentFill:   { r: 0.122, g: 0.259, b: 0.431 },
      accentEdge:   { r: 0.118, g: 0.290, b: 0.514 },
      danger:       { r: 0.961, g: 0.322, b: 0.380 },
      white:        { r: 1, g: 1, b: 1 },
    };

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
        setFill(f, Ct.accent, 1); setStroke(f, Ct.accent, 1, 1);
        center(); f.appendChild(txt("✓", F.b, 10, Ct.white));
      } else if (cls === "overridden" && value === "off") {
        f.fills = []; setStroke(f, Ct.borderBright, 1, 1);
      } else if (cls === "inherited" && value === "on") {
        setFill(f, Ct.accentFill, 1); setStroke(f, Ct.accentEdge, 1, 1);
        center(); f.appendChild(txt("✓", F.m, 9, Ct.white));
      } else if (cls === "inherited" && value === "off") {
        f.fills = []; setStroke(f, Ct.strokeMid, 1, 1);
      } else if (cls === "locked" && value === "on") {
        setFill(f, Ct.backMid, 1); setStroke(f, Ct.strokeMid, 1, 1);
        center(); f.appendChild(txt("✓", F.m, 9, Ct.strokeMid));
      } else if (cls === "locked" && value === "off") {
        setFill(f, Ct.backMid, 1); setStroke(f, Ct.strokeMid, 1, 1);
      } else if (cls === "disabled" && value === "on") {
        f.fills = []; setStroke(f, Ct.strokeMid, 1, 1);
        f.dashPattern = [2, 2];
        center(); f.appendChild(txt("✓", F.m, 9, Ct.strokeMid));
      } else if (cls === "disabled" && value === "off") {
        f.fills = []; setStroke(f, Ct.strokeMid, 1, 1);
        f.dashPattern = [2, 2];
      } else if (cls === "disabled-inherited" && value === "on") {
        f.fills = []; setStroke(f, Ct.backMid, 1, 1);
        f.dashPattern = [2, 2];
        center(); f.appendChild(txt("✓", F.m, 9, Ct.backMid));
      } else if (cls === "disabled-inherited" && value === "off") {
        f.fills = []; setStroke(f, Ct.backMid, 1, 1);
        f.dashPattern = [2, 2];
      } else if (cls === "disabled-locked" && value === "on") {
        setFill(f, Ct.backDim, 1); setStroke(f, Ct.backMid, 1, 1);
        f.dashPattern = [2, 2];
        center(); f.appendChild(txt("✓", F.m, 9, Ct.backMid));
      } else if (cls === "disabled-locked" && value === "off") {
        setFill(f, Ct.backDim, 1); setStroke(f, Ct.backMid, 1, 1);
        f.dashPattern = [2, 2];
      }
      return f;
    }

    function refBodyChildIndex(glyph) { return glyph === "eyeClosed" ? 1 : 0; }
    function refApplyBodyBacking(node, glyph, color) {
      if (!("children" in node) || !Array.isArray(node.children)) return;
      const body = node.children[refBodyChildIndex(glyph)];
      if (body && "fills" in body) body.fills = [{ type: "SOLID", color: color, opacity: 1 }];
    }
    function refApplyBodyDash(node, glyph) {
      if (!("children" in node) || !Array.isArray(node.children)) return;
      const body = node.children[refBodyChildIndex(glyph)];
      if (body && "dashPattern" in body) body.dashPattern = [1.5, 1.5];
    }
    function refApplyBodyGradient(node, glyph, colorRGB) {
      if (!("children" in node) || !Array.isArray(node.children)) return;
      const body = node.children[refBodyChildIndex(glyph)];
      if (!body || !("fills" in body)) return;
      body.fills = [{
        type: "GRADIENT_LINEAR",
        gradientTransform: [[0, 1, 0], [-1, 0, 1]],
        gradientStops: [
          { position: 0, color: { r: colorRGB.r, g: colorRGB.g, b: colorRGB.b, a: 0 } },
          { position: 1, color: { r: colorRGB.r, g: colorRGB.g, b: colorRGB.b, a: 1 } },
        ],
      }];
    }

    function refEye(cls, value) {
      const wrap = figma.createFrame();
      wrap.resize(20, 20);
      wrap.layoutMode = "HORIZONTAL";
      wrap.layoutSizingHorizontal = "FIXED"; wrap.layoutSizingVertical = "FIXED";
      wrap.primaryAxisAlignItems = "CENTER"; wrap.counterAxisAlignItems = "CENTER";
      wrap.fills = [];
      const gs = 14;
      let glyph, color, backing = null, dashed = false, arcGradient = null;
      if (cls === "overridden" && value === "on") {
        glyph = "eye"; color = Ct.accent;
      } else if (cls === "overridden" && value === "off") {
        glyph = "eyeClosed"; color = Ct.borderBright;
      } else if (cls === "inherited" && value === "on") {
        glyph = "eye"; color = Ct.strokeMid;
      } else if (cls === "inherited" && value === "off") {
        glyph = "eyeClosed"; color = Ct.strokeMid;
      } else if (cls === "locked" && value === "on") {
        glyph = "eye"; color = Ct.strokeMid; backing = Ct.backMid;
      } else if (cls === "locked" && value === "off") {
        glyph = "eyeClosed"; color = Ct.strokeMid; arcGradient = Ct.backMid;
      } else if (cls === "disabled" && value === "on") {
        glyph = "eye"; color = Ct.strokeMid; dashed = true;
      } else if (cls === "disabled" && value === "off") {
        glyph = "eyeClosed"; color = Ct.strokeMid; dashed = true;
      } else if (cls === "disabled-inherited" && value === "on") {
        glyph = "eye"; color = Ct.backMid; dashed = true;
      } else if (cls === "disabled-inherited" && value === "off") {
        glyph = "eyeClosed"; color = Ct.backMid; dashed = true;
      } else if (cls === "disabled-locked" && value === "on") {
        glyph = "eye"; color = Ct.backMid; backing = Ct.backDim; dashed = true;
      } else if (cls === "disabled-locked" && value === "off") {
        glyph = "eyeClosed"; color = Ct.backMid; arcGradient = Ct.backDim; dashed = true;
      }
      const g = loadIcon(glyph, color, gs);
      if (backing)     refApplyBodyBacking(g, glyph, backing);
      if (dashed)      refApplyBodyDash(g, glyph);
      if (arcGradient) refApplyBodyGradient(g, glyph, arcGradient);
      wrap.appendChild(g);
      return wrap;
    }

    function covCountdown(progress01) {
      const size = 12, r = 3, sw = 1.25;
      const wrap = figma.createFrame();
      wrap.resize(size, size);
      wrap.fills = [];
      const base = figma.createFrame();
      base.resize(size, size);
      base.cornerRadius = r;
      base.fills = [];
      setStroke(base, Ct.border, 1, sw);
      wrap.appendChild(base);

      const inset = 1;
      const inner = size - 2 * inset;
      const overlay = figma.createVector();
      overlay.resize(inner, inner);
      overlay.vectorPaths = [{
        windingRule: "NONE",
        data: perimeterPathCCW(inner, inner, Math.max(1, r - inset), progress01),
      }];
      overlay.strokes = [{ type: "SOLID", color: Ct.danger }];
      overlay.strokeWeight = sw;
      overlay.strokeCap = "ROUND";
      overlay.strokeJoin = "ROUND";
      overlay.fills = [];
      wrap.appendChild(overlay);
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

    const W_CELL_COL = 48;
    const W_NAME = 180;
    const W_DESC = 260;
    const COL_W = W_CELL_COL * 2 + W_NAME + W_DESC + 16;

    function headerRow() {
      const r = hSec(COL_W);
      r.itemSpacing = 16;
      r.paddingTop = 6; r.paddingBottom = 6;
      r.counterAxisAlignItems = "CENTER";
      const onCell = hSec(W_CELL_COL); onCell.primaryAxisAlignItems = "CENTER";
      onCell.appendChild(txt("ON", F.s, 10, Ct.textDim));
      r.appendChild(onCell);
      const offCell = hSec(W_CELL_COL); offCell.primaryAxisAlignItems = "CENTER";
      offCell.appendChild(txt("OFF", F.s, 10, Ct.textDim));
      r.appendChild(offCell);
      const nameCell = hSec(W_NAME);
      nameCell.appendChild(txt("CLASS", F.s, 10, Ct.textDim));
      r.appendChild(nameCell);
      const descCell = hSec(W_DESC);
      descCell.appendChild(txt("MEANING", F.s, 10, Ct.textDim));
      r.appendChild(descCell);
      return r;
    }

    function legendRow(cellOn, cellOff, name, desc) {
      const r = hSec(COL_W);
      r.itemSpacing = 16;
      r.paddingTop = 10; r.paddingBottom = 10;
      r.counterAxisAlignItems = "CENTER";
      const onCell = hSec(W_CELL_COL);
      onCell.primaryAxisAlignItems = "CENTER";
      onCell.counterAxisAlignItems = "CENTER";
      onCell.appendChild(cellOn);
      r.appendChild(onCell);
      const offCell = hSec(W_CELL_COL);
      offCell.primaryAxisAlignItems = "CENTER";
      offCell.counterAxisAlignItems = "CENTER";
      offCell.appendChild(cellOff);
      r.appendChild(offCell);
      const nameCol = vSec(W_NAME);
      nameCol.appendChild(txt(name, F.s, 12, Ct.borderBright));
      r.appendChild(nameCol);
      const descCol = vSec(W_DESC);
      descCol.appendChild(txtW(desc, F.r, 11, Ct.textDim, W_DESC, 15));
      r.appendChild(descCol);
      return r;
    }

    function buildTable(title, subtitle, rowSpecs, noteText) {
      const card = figma.createFrame();
      card.resize(COL_W + 48, 10);
      card.layoutMode = "VERTICAL";
      card.layoutSizingHorizontal = "FIXED";
      card.layoutSizingVertical = "HUG";
      card.paddingTop = 24; card.paddingBottom = 24;
      card.paddingLeft = 24; card.paddingRight = 24;
      card.itemSpacing = 0;
      card.cornerRadius = 12;
      setFill(card, Ct.panel, 1);
      setStroke(card, Ct.border, 1, 1);

      card.appendChild(txt(title, F.b, 16, Ct.borderBright));
      card.appendChild(spacer(10, 4));
      card.appendChild(txtW(subtitle, F.r, 11, Ct.textDim, COL_W, 16));
      card.appendChild(spacer(10, 16));

      card.appendChild(headerRow());
      card.appendChild(divider(COL_W, Ct.border, 1));

      for (var i = 0; i < rowSpecs.length; i++) {
        card.appendChild(rowSpecs[i]);
        if (i < rowSpecs.length - 1) card.appendChild(divider(COL_W, Ct.border, 0.5));
      }

      if (noteText) {
        card.appendChild(spacer(10, 16));
        card.appendChild(divider(COL_W, Ct.border, 0.8));
        card.appendChild(spacer(10, 12));
        const noteFrame = vSec(COL_W);
        noteFrame.appendChild(txt("Design note", F.s, 10, Ct.textDim));
        noteFrame.appendChild(spacer(10, 6));
        noteFrame.appendChild(txtW(noteText, F.r, 11, Ct.textDim, COL_W, 16));
        card.appendChild(noteFrame);
      }
      return card;
    }

    // ---------- Checkbox rows ----------
    const chkRows = [
      legendRow(chk("overridden", "on"), chk("overridden", "off"), "Normal",
        "User explicitly set this cell. Full-saturation accent on ON; neutral bright stroke on OFF. Wins over ancestor — any cascade from above stops here."),
      legendRow(chk("inherited", "on"), chk("inherited", "off"), "Inherited",
        "Value flows from nearest ancestor override. Dim accent on ON, neutral dim stroke on OFF. Clickable — click promotes this cell to Normal (pins the value here, breaks further inheritance)."),
      legendRow(chk("locked", "on"), chk("locked", "off"), "Locked",
        "Value forced by cascade-lock source (SUB=OFF on an ancestor). Neutral grey — no accent tint. OFF has a subtle backing («крышечка»), distinguishing Locked OFF from Inherited OFF (empty) and Disabled OFF (dashed). Not clickable — unlock only at the source."),
      legendRow(chk("disabled", "on"), chk("disabled", "off"), "Disabled (row off)",
        "Row is functionally off — media missing or scan running. Dashed border + no backing in both states. Clicks are still accepted and mutate stored state — the change just has no real-world effect until the row re-enables."),
      legendRow(chk("disabled-inherited", "on"), chk("disabled-inherited", "off"), "Disabled + Inherited",
        "Row is off, and the stored value itself is Inherited from an ancestor. Dashed border (row-off signal) with a dim-accent check glyph on ON (lineage hint)."),
      legendRow(chk("disabled-locked", "on"), chk("disabled-locked", "off"), "Disabled + Locked",
        "Row is off, and the stored value is cascade-locked from above. Dashed border with the grey Locked «подложка» peeking through. Not clickable even while the row is off."),
      legendRow(txt("N/A", F.m, 10, Ct.strokeMid), coverStripCell(), "Safety Cover Countdown",
        "Orthogonal overlay — not a state class. Applies wherever the cell accepts clicks. Excluded from Locked and Disabled+Locked. Mechanic: first click arms (stroke turns red), countdown drains over ~3s, second click within the window commits. Red appears ONLY during the armed countdown."),
    ];
    const chkTable = buildTable(
      "Checkbox state taxonomy + Safety Cover",
      "Base classes: Normal → Inherited → Locked → Disabled. Compound rows (Disabled+Inherited, Disabled+Locked) show how Disabled composes orthogonally with the cascade class. SUB cascade is SYMMETRIC — SUB=OFF on an ancestor locks both ON and OFF values in descendants. Only Normal ON and Inherited ON carry accent — every OFF and every grey-tier cell is pure neutral.",
      chkRows,
      "Works at 14px because distinguishing signals are structural (fill presence, dash pattern, backing), not glyph-based. Safety Cover is red-only during the armed window."
    );

    // ---------- Eye rows ----------
    const eyeRows = [
      legendRow(refEye("overridden", "on"), refEye("overridden", "off"), "Normal",
        "User explicitly set eye state. Bare glyph — no container chrome. Full-saturation accent eye-open on ON; calm neutral borderBright eye-closed on OFF."),
      legendRow(refEye("inherited", "on"), refEye("inherited", "off"), "Inherited",
        "Ancestor cascades its value (open or closed) as SOFT INHERIT — descendants echo it, but may individually override to the opposite. Bare glyph + strokeMid outline, no подложка."),
      legendRow(refEye("locked", "on"), refEye("locked", "off"), "Locked",
        "Cascade-lock tier. **ON**: eye-open with strokeMid outline + backMid «подложка». **OFF**: eye-closed with strokeMid outline + backMid vertical gradient on the arc (weighty pressed-down look). Used for race-prevention during Busy."),
      legendRow(refEye("disabled", "on"), refEye("disabled", "off"), "Disabled (row off)",
        "Row is functionally off. Bare glyph with muted strokeMid outline in both ON and OFF. The body path alone is dashed — pupil and lashes stay solid so the silhouette still reads as an eye."),
      legendRow(refEye("disabled-inherited", "on"), refEye("disabled-inherited", "off"), "Disabled + Inherited",
        "Row is off AND the stored value is Inherited from an ancestor. Bare glyph, backMid outline, dashed body, no подложка — distinguishes from Disabled+Locked (which has a backDim body fill)."),
      legendRow(refEye("disabled-locked", "on"), refEye("disabled-locked", "off"), "Disabled + Locked",
        "Composite of Disabled + Locked. **ON**: backMid outline, backDim «подложка» body fill, dashed body. **OFF**: backMid outline (dashed), backDim vertical gradient on the arc."),
    ];
    const eyeTable = buildTable(
      "Eye state taxonomy",
      "Base classes: Normal / Inherited / Locked / Disabled (+ compound Disabled+Inherited / Disabled+Locked). Locked has full ON/OFF coverage — OFF uses a backMid vertical gradient on the arc. Cascade via Inherited is SYMMETRIC. Glyphs carry no container chrome — class signal lives inside: outline colour, optional body «подложка» solid fill, optional gradient on arc, optional dashPattern. Pupil/lashes always solid. NO Safety Cover — eye is a toggle, not destructive (cover is reserved for irreversible activations like Mirror DEL).",
      eyeRows,
      "Locked ON/OFF tiers both produced by Busy race-prevention and reserved for admin scenarios. Eye toggling never carries a Safety Cover countdown — there is nothing to undo a wrong click of, and no FS-side effect to gate. Cover stays exclusive to destructive controls (DEL, FLT migrations)."
    );

    // ---------- Icon button states — Adobe parity ----------
    const W_BTN_TABLE = 2 * (COL_W + 48) + 24;
    const W_BTN_INNER = W_BTN_TABLE - 48;
    const W_BTN_ICON = 44;
    const W_BTN_STATE = 76;
    const W_BTN_NAME = 160;
    const W_BTN_MEANING = W_BTN_INNER - W_BTN_ICON - 4 * W_BTN_STATE - W_BTN_NAME - 16 * 6;

    function btnStateCell(svgKey, iconColor, bgColor, bgOpacity, dashed) {
      const f = figma.createFrame();
      f.resize(22, 22);
      f.cornerRadius = 3;
      f.layoutMode = "HORIZONTAL";
      f.layoutSizingHorizontal = "FIXED";
      f.layoutSizingVertical = "FIXED";
      f.primaryAxisAlignItems = "CENTER";
      f.counterAxisAlignItems = "CENTER";
      if (bgColor) setFill(f, bgColor, bgOpacity != null ? bgOpacity : 1);
      else f.fills = [];
      const g = loadIcon(svgKey, iconColor, 14);
      if (dashed && (svgKey === "eye" || svgKey === "eyeClosed")) {
        refApplyBodyDash(g, svgKey);
      }
      f.appendChild(g);
      return f;
    }
    function btnCol(w, child) {
      const c = hSec(w);
      c.primaryAxisAlignItems = "CENTER";
      c.counterAxisAlignItems = "CENTER";
      c.appendChild(child);
      return c;
    }
    function btnHeader() {
      const r = hSec(W_BTN_INNER);
      r.itemSpacing = 16;
      r.paddingTop = 6; r.paddingBottom = 6;
      r.counterAxisAlignItems = "CENTER";
      r.appendChild(btnCol(W_BTN_ICON, spacer(1, 1)));
      const labels = ["DISABLED", "REST", "HOVER", "PRESSED"];
      for (var li = 0; li < labels.length; li++) {
        r.appendChild(btnCol(W_BTN_STATE, txt(labels[li], F.s, 10, Ct.textDim, undefined, 0.5)));
      }
      const nameCol = hSec(W_BTN_NAME);
      nameCol.appendChild(txt("CLASS", F.s, 10, Ct.textDim));
      r.appendChild(nameCol);
      const descCol = hSec(W_BTN_MEANING);
      descCol.appendChild(txt("MEANING", F.s, 10, Ct.textDim));
      r.appendChild(descCol);
      return r;
    }
    function btnRow(spec) {
      const r = hSec(W_BTN_INNER);
      r.itemSpacing = 16;
      r.paddingTop = 10; r.paddingBottom = 10;
      r.counterAxisAlignItems = "CENTER";
      r.appendChild(btnCol(W_BTN_ICON, loadIcon(spec.key, Ct.textDim, 14)));
      const isEye = spec.key === "eye";
      r.appendChild(btnCol(W_BTN_STATE, btnStateCell(spec.key, Ct.strokeMid, null, null, isEye)));
      r.appendChild(btnCol(W_BTN_STATE, btnStateCell(spec.key, Ct.borderBright, null, null)));
      r.appendChild(btnCol(W_BTN_STATE, btnStateCell(spec.key, Ct.borderBright, Ct.white, 0.08)));
      r.appendChild(btnCol(W_BTN_STATE, btnStateCell(spec.key, Ct.borderBright, Ct.white, 0.12)));
      const nameCol = vSec(W_BTN_NAME);
      nameCol.appendChild(txt(spec.name, F.s, 12, Ct.borderBright));
      r.appendChild(nameCol);
      const descCol = vSec(W_BTN_MEANING);
      descCol.appendChild(txtW(spec.desc, F.r, 11, Ct.textDim, W_BTN_MEANING, 15));
      r.appendChild(descCol);
      return r;
    }

    const btnIcons = [
      { key: "refresh", name: "Refresh", desc: "Manual resync — rescan the watched folder and push any new files through the queue. Action button: no toggle state." },
      { key: "search",  name: "Reveal",  desc: "Open the watched path in the OS file browser. Action button: fires and returns." },
      { key: "magnet",  name: "Attach",  desc: "Snap to / attach on a target bin (v1.3+ drag affordance). Action button: no persistent state." },
      { key: "eye",     name: "Eye (dual nature)", desc: "Both a toggle AND an action button. Its ON/OFF lives in the eye taxonomy above — this row shows only the button-layer states." },
    ];

    const btnCard = figma.createFrame();
    btnCard.resize(W_BTN_TABLE, 10);
    btnCard.layoutMode = "VERTICAL";
    btnCard.layoutSizingHorizontal = "FIXED";
    btnCard.layoutSizingVertical = "HUG";
    btnCard.paddingTop = 24; btnCard.paddingBottom = 24;
    btnCard.paddingLeft = 24; btnCard.paddingRight = 24;
    btnCard.itemSpacing = 0;
    btnCard.cornerRadius = 12;
    setFill(btnCard, Ct.panel, 1);
    setStroke(btnCard, Ct.border, 1, 1);

    btnCard.appendChild(txt("Icon button states — Adobe parity", F.b, 16, Ct.borderBright));
    btnCard.appendChild(spacer(10, 4));
    btnCard.appendChild(txtW(
      "Only TWO icon hex values across all four states. DISABLED = strokeMid (same as every Disabled/Locked checkbox stroke). REST / HOVER / PRESSED all share borderBright (same as every Normal-OFF checkbox stroke). HOVER and PRESSED don't touch the icon colour at all; they signal exclusively through the bg fill (white@8% and white@12%). Apple rule: pick the colour once, inherit everywhere.",
      F.r, 11, Ct.textDim, W_BTN_INNER, 16
    ));
    btnCard.appendChild(spacer(10, 16));
    btnCard.appendChild(btnHeader());
    btnCard.appendChild(divider(W_BTN_INNER, Ct.border, 1));
    for (var bi = 0; bi < btnIcons.length; bi++) {
      btnCard.appendChild(btnRow(btnIcons[bi]));
      if (bi < btnIcons.length - 1) btnCard.appendChild(divider(W_BTN_INNER, Ct.border, 0.5));
    }

    // ---------- Palette — single source of truth ----------
    const W_PAL_TABLE = W_BTN_TABLE;
    const W_PAL_INNER = W_BTN_INNER;
    const PAL_COLS = 4;
    const PAL_GAP = 16;
    const W_SWATCH = Math.floor((W_PAL_INNER - PAL_GAP * (PAL_COLS - 1)) / PAL_COLS);

    function rgbToHex(c) {
      function h(x) {
        const v = Math.round(x * 255).toString(16).toUpperCase();
        return v.length === 1 ? "0" + v : v;
      }
      return "#" + h(c.r) + h(c.g) + h(c.b);
    }

    function paletteSwatch(tokenName, color, usedBy) {
      const card = vSec(W_SWATCH);
      card.itemSpacing = 8;
      const chipSw = figma.createFrame();
      chipSw.resize(W_SWATCH, 32);
      chipSw.cornerRadius = 6;
      setFill(chipSw, color, 1);
      setStroke(chipSw, Ct.border, 0.6, 0.5);
      card.appendChild(chipSw);
      const meta = vSec(W_SWATCH);
      meta.itemSpacing = 3;
      const head = hSec(W_SWATCH);
      head.itemSpacing = 8;
      head.counterAxisAlignItems = "CENTER";
      head.appendChild(txt(tokenName, F.s, 10, Ct.borderBright, undefined, 0.4));
      const sp = figma.createFrame();
      sp.resize(1, 1);
      sp.fills = [];
      sp.layoutGrow = 1;
      head.appendChild(sp);
      head.appendChild(txt(rgbToHex(color), F.r, 10, Ct.textDim));
      meta.appendChild(head);
      meta.appendChild(txtW(usedBy, F.r, 10, Ct.strokeMid, W_SWATCH, 14));
      card.appendChild(meta);
      return card;
    }

    const paletteTokens = [
      { name: "strokeMid",    color: Ct.strokeMid,    usedBy: "Disabled / Locked stroke · DISABLED button icon · Locked ON ✓ · N/A em-dash" },
      { name: "borderBright", color: Ct.borderBright, usedBy: "Normal-OFF stroke · primary text · REST / HOVER / PRESSED icon" },
      { name: "textDim",      color: Ct.textDim,      usedBy: "Column headers, design-note body, secondary text" },
      { name: "white",        color: Ct.white,        usedBy: "Overridden / Inherited ON ✓ · HOVER / PRESSED bg tint (8 / 12 %)" },
      { name: "backMid",      color: Ct.backMid,      usedBy: "Locked backing — checkbox crown, eye body" },
      { name: "backDim",      color: Ct.backDim,      usedBy: "Disabled + Locked eye body, deepest fills" },
      { name: "accent",       color: Ct.accent,       usedBy: "Overridden ON — box fill, eye outline" },
      { name: "accentFill",   color: Ct.accentFill,   usedBy: "Inherited ON fill" },
      { name: "accentEdge",   color: Ct.accentEdge,   usedBy: "Inherited ON stroke" },
      { name: "danger",       color: Ct.danger,       usedBy: "Safety Cover armed-window border" },
    ];

    const palCard = figma.createFrame();
    palCard.resize(W_PAL_TABLE, 10);
    palCard.layoutMode = "VERTICAL";
    palCard.layoutSizingHorizontal = "FIXED";
    palCard.layoutSizingVertical = "HUG";
    palCard.paddingTop = 24; palCard.paddingBottom = 24;
    palCard.paddingLeft = 24; palCard.paddingRight = 24;
    palCard.itemSpacing = 0;
    palCard.cornerRadius = 12;
    setFill(palCard, Ct.panel, 1);
    setStroke(palCard, Ct.border, 1, 1);

    palCard.appendChild(txt("Palette — single source of truth", F.b, 16, Ct.borderBright));
    palCard.appendChild(spacer(10, 4));
    palCard.appendChild(txtW(
      "Ten tokens — deterministic SOT referenced by every checkbox, eye, button, row, and label in this doc. Apple rule: pick the colour once, inherit everywhere. Two workhorses (strokeMid and borderBright) carry the entire dark / bright binary. Everything else is a structural variant (backings, accent ladder) or a narrow utility (danger, white). Anything beyond these ten is a palette violation.",
      F.r, 11, Ct.textDim, W_PAL_INNER, 16
    ));
    palCard.appendChild(spacer(10, 16));

    for (var pi = 0; pi < paletteTokens.length; pi += PAL_COLS) {
      const pr = hSec(W_PAL_INNER);
      pr.itemSpacing = PAL_GAP;
      pr.counterAxisAlignItems = "MIN";
      for (var pj = 0; pj < PAL_COLS && pi + pj < paletteTokens.length; pj++) {
        const t = paletteTokens[pi + pj];
        pr.appendChild(paletteSwatch(t.name, t.color, t.usedBy));
      }
      palCard.appendChild(pr);
      if (pi + PAL_COLS < paletteTokens.length) palCard.appendChild(spacer(10, 16));
    }

    // Stack: palette on top, chk+eye pair below, button at bottom.
    const topRow = hSec(contentW);
    topRow.itemSpacing = 24;
    topRow.counterAxisAlignItems = "MIN";
    topRow.appendChild(chkTable);
    topRow.appendChild(eyeTable);

    const stack = vSec(contentW);
    stack.itemSpacing = 24;
    stack.appendChild(palCard);
    stack.appendChild(topRow);
    stack.appendChild(btnCard);
    return stack;
  })();

  secREF.appendChild(taxBlock);
  root.appendChild(secREF);

  // ---------- Position & focus ----------
  root.x = 100;
  root.y = 100;
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("SheepDog Panel Concept v2.0 — done");
}

main();
