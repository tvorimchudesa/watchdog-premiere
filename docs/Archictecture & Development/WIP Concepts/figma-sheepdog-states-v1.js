// SheepDog — State Model v1 · Figma Scripter mockup
// Derived from figma-sheepdog-panel-v1.2.js (section 1 only).
//
// What is new vs v1.2:
//   - STATE column (leftmost, 32 px). Rack-server LED indicator per row:
//     green = healthy-alive, amber = busy (pulses in real impl), hollow gray =
//     disabled (off, not broken), red = missing.
//   - Chevron shifts together with name (subfolder = indented chevron + name).
//   - 4-state + cause-variation row scenarios in one panel.
//   - 4 annotation cards (one per state).
//   - row() extended with cfg.stateIndicator ("healthy"|"busy"|"disabled"|"missing").
//   - No colored buttons anywhere. Color is reserved for state signal (LED).
//   - Scan is NOT busy (silent). Busy = import in-flight only.
//
// NOT included: S5 Plugin Unhealthy (parked per spec).
// NOT included: §§ 2–9 from v1.2 (this is a standalone states-focused doc).

async function main() {
  // ---------- Fonts ----------
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Italic" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // ---------- Constants ----------
  const DOC_W  = 1640;
  const PAD    = 40;
  const PANEL_W = 940;
  const ANN_W   = 540;

  // Column widths — same as v1.2 except STATE is new.
  const COL = {
    LABEL: 20,
    TREE:  14, // kept for backward compat; chevron now lives inside NAME cell
    NAME:  204,
    PATH:  210,
    STATE: 32,   // NEW — state indicator glyph
    SUB:   32,
    REL:   32,
    SEQ:   32,
    FLT:   32,
    EYE:   32,
    ACT:   88,
    RM:    22,
  };
  const ROW_GAP = 8;
  const ROW_PAD = 12;
  const ROW_H   = 30;

  // ---------- Colors (Premiere / Media Encoder dark theme) — from v1.2 ----------
  const C = {
    canvas:    { r: 0.08,  g: 0.08,  b: 0.09  },
    panel:     { r: 0.145, g: 0.145, b: 0.155 },
    panelAlt:  { r: 0.175, g: 0.175, b: 0.185 },
    panelHi:   { r: 0.21,  g: 0.21,  b: 0.22  },
    border:    { r: 0.30,  g: 0.30,  b: 0.32  },
    borderStrong: { r: 0.42, g: 0.42, b: 0.44 },

    text:      { r: 0.87,  g: 0.87,  b: 0.88  },
    textDim:   { r: 0.60,  g: 0.60,  b: 0.63  },
    strokeMid: { r: 0.486, g: 0.486, b: 0.514 },
    borderBright: { r: 0.843, g: 0.843, b: 0.855 },

    accent:    { r: 0.08,  g: 0.47,  b: 0.95  },
    success:   { r: 0.302, g: 0.780, b: 0.388 }, // #4DC763 — emerald green for LED
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

  // ---------- SVG icons (same set as v1.2) ----------
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
  };

  // ---------- Helpers — copied verbatim from v1.2 ----------

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

  // TC — solid taxonomy palette (mirrors v1.2 values exactly).
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

  // applyBodyGradient — fills the eyeClosed arc with a top→bottom vertical gradient.
  // Used for "locked-off" eye (race-prevention visual during Busy) and
  // "disabled-locked-off" eye (composite disabled + locked).
  // Gradient: top 0% alpha → bottom 100% alpha (color the same throughout).
  // Creates a "weighty closed eyelid" look — the arc feels filled/pressed.
  function applyBodyGradient(node, glyph, colorRGB) {
    if (!("children" in node) || !Array.isArray(node.children)) return;
    const body = node.children[bodyChildIndex(glyph)];
    if (!body || !("fills" in body)) return;
    body.fills = [{
      type: "GRADIENT_LINEAR",
      // Top-to-bottom gradient on the body's bounding box.
      gradientTransform: [[0, 1, 0], [-1, 0, 1]],
      gradientStops: [
        { position: 0, color: { r: colorRGB.r, g: colorRGB.g, b: colorRGB.b, a: 0 } },
        { position: 1, color: { r: colorRGB.r, g: colorRGB.g, b: colorRGB.b, a: 1 } },
      ],
    }];
  }

  // checkbox() — copied verbatim from v1.2.
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

  // eyeToggle() — copied verbatim from v1.2.
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
      // locked=true flag renders as LOCKED tier (hard-lock visual).
      // Use-cases: Busy race-prevention, future admin-locked cells.
      // SUB-cascade dormancy uses explicit disabled-inherited-* variants instead.
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
      // NEW: inherited-off base (strokeMid stroke) + gradient fill on arc (backMid).
      // Race-prevention visual during Busy. Gradient fades from top-transparent
      // to bottom-opaque, giving the closed eyelid a "weighty" pressed-down look.
      glyph = "eyeClosed"; color = TC.strokeMid; arcGradient = TC.backMid;
    } else if (cls === "disabled" && value === "on") {
      glyph = "eye"; color = TC.strokeMid; dashed = true;
    } else if (cls === "disabled" && value === "off") {
      glyph = "eyeClosed"; color = TC.strokeMid; dashed = true;
    } else if (cls === "disabled-inherited" && value === "on") {
      // backMid stroke — paired with OFF. Distinguishes from plain Disabled ON (strokeMid).
      glyph = "eye"; color = TC.backMid; dashed = true;
    } else if (cls === "disabled-inherited" && value === "off") {
      glyph = "eyeClosed"; color = TC.backMid; dashed = true;
    } else if (cls === "disabled-locked" && value === "on") {
      glyph = "eye"; color = TC.backMid; backing = TC.backDim; dashed = true;
    } else if (cls === "disabled-locked" && value === "off") {
      // NEW: disabled-inherited-off base (backMid stroke, dashed) + gradient fill
      // on arc (backDim — darker than locked-off since the whole row is disabled).
      glyph = "eyeClosed"; color = TC.backMid; arcGradient = TC.backDim; dashed = true;
    } else {
      // Fallback: bare eye in strokeMid — safe, not silent-crash.
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
    const svgKeyMap = { "↻": "refresh", "⌕": "search", "🧲": "magnet", "👁": "eye", "⚙": "settings" };
    const svgKey = svgKeyMap[glyph];
    const base = color || C.text;
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

  // recolorPath — apply solid color to one path's strokes + fills (bypasses recolor()
  // tree-walk, used for selective per-path coloring inside multi-path SVG icons).
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

  // loadFunnelXIcon — 2-color funnel-x rendering. Funnel body + × parts coloured
  // independently. × stays bright (always "active modifier"), funnel body shifts
  // with toggle state (dim when filter OFF, bright when ON).
  // SVG paths: [0] = funnel body, [1] = × first stroke, [2] = × second stroke.
  function loadFunnelXIcon(funnelColor, xColor, size) {
    size = size || 14;
    const f = figma.createNodeFromSvg(SVG.funnelX);
    f.fills = [];
    f.resize(size, size);
    rescaleStrokes(f, size / 24);
    if (f.children && f.children.length >= 3) {
      recolorPath(f.children[0], funnelColor); // funnel body
      recolorPath(f.children[1], xColor);      // × stroke 1
      recolorPath(f.children[2], xColor);      // × stroke 2
    }
    return f;
  }

  // btnHeader — unified outlined square button for header toolbar actions.
  // No fill, C.border stroke, cornerRadius 4. Icon color reflects state.
  // Content rendered via builder callback (supports single-color ↻ and
  // multi-color funnel-x).
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

  // btnFilter — funnel-x hide filter toggle.
  //   OFF: funnel body + × both dim (#9999A1) — whole icon quiet
  //   ON:  funnel body bright (#D7D7DA), × stays dim (#9999A1) — funnel lights up
  //        as the "engaged" signal, × is always-subtle modifier (less visual noise).
  function btnFilter(active) {
    const funnelColor = active ? C.borderBright : C.textDim;
    const xColor      = C.textDim; // always dim — subtle modifier regardless of state
    return btnHeader(function() { return loadFunnelXIcon(funnelColor, xColor, 14); });
  }

  // btnCheckImport — ↻ rescan-import button. Whole icon dim when idle, bright
  // when import running. No fill — feedback via icon color only.
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
      tx.appendChild(txt(rw.title, F.s, 11, C.text));
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

  // ---------- panelHeader ----------
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
    logoBox.appendChild(txt("SheepDog", F.b, 13, C.text));
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

    // Spacer — grows to fill remaining width.
    wrap.appendChild(spacer(1, 1));
    wrap.children[wrap.children.length - 1].layoutGrow = 1;

    const asBox = hHug();
    asBox.itemSpacing = 6;
    asBox.counterAxisAlignItems = "CENTER";
    asBox.appendChild(txt("Advanced", F.m, 11, C.text));
    asBox.appendChild(toggle(true));
    wrap.appendChild(asBox);

    wrap.appendChild(btnFilter(false));       // hide-filter, OFF state
    wrap.appendChild(btnCheckImport(false));  // ↻ rescan-import, idle state
    wrap.appendChild(actionIcon("⚙", C.text));
    return wrap;
  }

  // ---------- colHeaderCell ----------
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

  // ---------- columnHeaderBar — extended with STATE column ----------
  function columnHeaderBar() {
    const wrap = hSec(PANEL_W);
    wrap.paddingLeft = ROW_PAD; wrap.paddingRight = ROW_PAD;
    wrap.paddingTop = 6; wrap.paddingBottom = 6;
    wrap.itemSpacing = ROW_GAP;
    wrap.counterAxisAlignItems = "CENTER";
    setFill(wrap, C.panelAlt, 1);

    // STATE — leftmost column. Per-row state indicator, read before any other content.
    wrap.appendChild(colHeaderCell(COL.STATE, "STATE",  "CENTER"));
    // TREE header merged into NAME — chevron now lives inside nameInner.
    wrap.appendChild(colHeaderCell(COL.NAME,  "NAME",   "MIN", C.textDim));
    wrap.appendChild(colHeaderCell(COL.PATH,  "PATH",   "MIN"));
    wrap.appendChild(colHeaderCell(COL.SUB,   "SUB",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.REL,   "REL",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.SEQ,   "SEQ",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.FLT,   "FLT",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.EYE,   "EYE",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.ACT,   "ACTIONS","MIN"));
    wrap.appendChild(colHeaderCell(COL.LABEL, "LBL",    "CENTER"));
    wrap.appendChild(colHeaderCell(COL.RM,    "",       "CENTER"));
    return wrap;
  }

  // ---------- stateCell(stateIndicator) — STATE column content ----------
  // See detailed palette rationale inside the function body.
  function stateCell(stateIndicator) {
    const f = figma.createFrame();
    f.resize(COL.STATE, ROW_H);
    f.fills = [];
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = "CENTER";
    f.counterAxisAlignItems = "CENTER";

    // LED palette (2026-04-23 FINAL v2 — size-asymmetric, hue-coherent):
    //
    //             | hollow 6px (transient/off) | solid 4px (steady)
    //   blue      | busy (pulses in prod)      | idle (baseline alive)
    //   red       | —                          | missing (alarm)
    //   gray      | disabled (off)             | —
    //
    // Size encoding: hollow rings need room to read (6px + 1px stroke). Solid
    // dots are dense at any size — 4px stays visible. Size asymmetry also
    // reinforces "persistent states (idle/missing) are small anchor, transient/off
    // (busy/disabled) have ring shape that attracts via outline".
    //
    // Hue mapping: blue = healthy channel (idle muted via small size, busy full
    // via ring + pulse). Red = problem. Gray = off.
    //
    // Visual hierarchy: big hollow blue pulsing (busy) > big hollow gray (disabled,
    // present but muted) > small solid red (missing alarm) > small solid blue (idle,
    // baseline alive). Missing/idle small BUT hue carries weight.
    const led = figma.createFrame();
    if (stateIndicator === "healthy") {
      led.resize(4, 4); led.cornerRadius = 2;
      setFill(led, C.accent, 1);
    } else if (stateIndicator === "busy") {
      led.resize(6, 6); led.cornerRadius = 3;
      led.fills = [];
      setStroke(led, C.accent, 1, 1);
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

  // ---------- ROW BUILDER — extended version of v1.2 row() ----------
  // New prop: cfg.stateIndicator — "healthy"|"busy"|"disabled"|"missing"
  // Row bg stays calm across all states (no tints). State signal lives in the
  // STATE column LED (see stateCell) + inline content (path color, ⚠ prefix).
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

    // Row bg stays calm across all states. State signal lives in the STATE
    // column glyph + inline content (path color, ⚠ prefix, Relink highlight).
    // Per Premiere-panel parity: no row tints, no row borders, no dashed rows.
    wrap.fills = [];

    // Label dot.
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

    // STATE cell — leftmost, read first.
    r.appendChild(stateCell(cfg.stateIndicator || "healthy"));

    // NAME cell — chevron integrated. Chevron shifts TOGETHER with the name on indent
    // (subfolder = indented chevron + indented name). Leaf rows get a 12 px spacer so
    // text stays aligned across all rows in the column.
    const nameBox = cell(COL.NAME, null, "MIN");
    const nameInner = hHug();
    nameInner.itemSpacing = 6;
    nameInner.counterAxisAlignItems = "CENTER";
    if (cfg.indent) nameInner.appendChild(spacer(cfg.indent, 1));
    let svgKey = null;
    if (cfg.tree === "expanded")       svgKey = "chevronDown";
    else if (cfg.tree === "collapsed") svgKey = "chevronRight";
    else if (cfg.tree === "virtual")   svgKey = "chevronRight";
    if (svgKey) {
      nameInner.appendChild(loadIcon(svgKey, C.textDim, 12));
    } else {
      nameInner.appendChild(spacer(12, 1));
    }
    const nameFont = cfg.nameItalic ? F.i : F.m;
    const nameColor = cfg.nameColor || ((cfg.stateIndicator === "disabled" || cfg.subLocked) ? C.strokeMid : C.text);
    nameInner.appendChild(txt(cfg.name, nameFont, 12, nameColor));
    nameBox.appendChild(nameInner);
    r.appendChild(nameBox);

    // PATH cell.
    const pathBox = cell(COL.PATH, null, "MIN");
    const isPathMissing = (cfg.stateIndicator === "missing");
    const pathColor = cfg.pathColor || (isPathMissing ? C.danger : (cfg.subLocked ? C.strokeMid : C.textDim));
    const pathFont = cfg.pathItalic ? F.i : F.r;
    const pathInner = hHug();
    pathInner.itemSpacing = 4;
    pathInner.counterAxisAlignItems = "CENTER";
    if (isPathMissing) pathInner.appendChild(txt("⚠", F.b, 11, C.danger));
    pathInner.appendChild(txt(cfg.path, pathFont, 11, pathColor));
    pathBox.appendChild(pathInner);
    r.appendChild(pathBox);

    // Settings columns.
    r.appendChild(cell(COL.SUB, checkbox(cfg.sub, cfg.subLocked)));
    r.appendChild(cell(COL.REL, checkbox(cfg.rel, cfg.subLocked)));
    r.appendChild(cell(COL.SEQ, checkbox(cfg.seq, cfg.subLocked)));
    r.appendChild(cell(COL.FLT, checkbox(cfg.flt, cfg.subLocked)));
    r.appendChild(cell(COL.EYE, eyeToggle(cfg.eye || "on", cfg.subLocked)));

    // ACTIONS cell.
    const actWrap = cell(COL.ACT, null, "MIN");
    const actInner = hHug();
    actInner.itemSpacing = 4;
    actInner.counterAxisAlignItems = "CENTER";
    for (const a of (cfg.actions || [])) {
      let ic;
      if (a.highlight) ic = actionIconHighlight(a.glyph, a.color || C.accent);
      else ic = actionIcon(a.glyph, a.color || C.text, a.opacity);
      actInner.appendChild(ic);
    }
    actWrap.appendChild(actInner);
    r.appendChild(actWrap);

    r.appendChild(labelBox);

    const rmGlyph = cfg.remove === false ? "" : "×";
    // × disabled visual during Busy (race-prevention: can't remove during import).
    const rmColor = (cfg.stateIndicator === "busy") ? C.strokeMid : C.textDim;
    r.appendChild(cell(COL.RM, rmGlyph ? txt(rmGlyph, F.r, 14, rmColor) : null));

    wrap.appendChild(r);
    return wrap;
  }

  // ---------- Simplified mode helpers (§13) ----------
  // Panel columns: STATE · NAME · LNK(⌕) · LBL · × (2026-04-23 Tier A).
  // Drops SUB/SEQ checkboxes + DEL column. Globals:
  //   EYE forced ON  — "auto-import everything"
  //   SEQ forced ON  — "auto-detect sequences" (delegated to Premiere's native
  //                     importAsNumberedStills handling; no SheepDog detector)
  //   SUB default ON — implicit recursive watching
  //   DEL hidden     — regardless of Settings toggle
  // Stored per-row values preserved silently, reapplied when Advanced toggles ON.
  const PANEL_SIMP_W  = 540;
  const COL_SIMP_NAME = 346; // grew by 80 to absorb SUB+SEQ drop (32+8+32+8)
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
    logoBox.appendChild(txt("SheepDog", F.b, 13, C.text));
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
    asBox.appendChild(txt("Advanced", F.m, 11, C.text));
    asBox.appendChild(toggle(false)); // OFF = Simplified
    wrap.appendChild(asBox);

    wrap.appendChild(btnFilter(false));       // hide-filter, OFF state
    wrap.appendChild(btnCheckImport(false));  // ↻ rescan-import, idle state
    wrap.appendChild(actionIcon("⚙", C.text));
    return wrap;
  }

  function columnHeaderBarSimplified(w) {
    const wrap = hSec(w);
    wrap.paddingLeft = ROW_PAD; wrap.paddingRight = ROW_PAD;
    wrap.paddingTop = 6; wrap.paddingBottom = 6;
    wrap.itemSpacing = ROW_GAP;
    wrap.counterAxisAlignItems = "CENTER";
    setFill(wrap, C.panelAlt, 1);

    wrap.appendChild(colHeaderCell(COL.STATE,    "STATE", "CENTER"));
    wrap.appendChild(colHeaderCell(COL_SIMP_NAME, "NAME",  "MIN", C.textDim));
    wrap.appendChild(colHeaderCell(COL_SIMP_ACT, "LNK",   "CENTER"));
    wrap.appendChild(colHeaderCell(COL.LABEL,    "LBL",   "CENTER"));
    wrap.appendChild(colHeaderCell(COL.RM,       "",      "CENTER"));
    return wrap;
  }

  // rowSimplified — compact row. Same stateIndicator/tree/indent contract as row().
  // ⌕ inline after name text on Missing rows only. No PATH / REL / FLT / EYE / ACTIONS.
  function rowSimplified(cfg, panelW) {
    const r = hSec(panelW - 2 * ROW_PAD);
    r.itemSpacing = ROW_GAP;
    r.counterAxisAlignItems = "CENTER";

    const wrap = hSec(panelW);
    wrap.paddingLeft = ROW_PAD; wrap.paddingRight = ROW_PAD;
    wrap.itemSpacing = 0;
    wrap.counterAxisAlignItems = "CENTER";
    wrap.fills = [];

    // Label dot — created early, appended near end (mirror main row()).
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

    // STATE cell.
    r.appendChild(stateCell(cfg.stateIndicator || "healthy"));

    // NAME cell with integrated chevron (left-stick).
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
    const nameColor = cfg.nameColor || ((cfg.stateIndicator === "disabled") ? C.strokeMid : C.text);
    nameInner.appendChild(txt(cfg.name, nameFont, 12, nameColor));

    nameBox.appendChild(nameInner);
    r.appendChild(nameBox);

    // SUB + SEQ checkboxes REMOVED from Simplified (Tier A).
    // SUB defaults to ON globally. SEQ forced ON via Premiere's
    // importAsNumberedStills. Per-row override available only in Advanced.
    // Stored values in cfg.sub / cfg.seq preserved silently for Advanced-switch.

    // ACT cell — single relink (⌕) icon. Not red. Color follows row state:
    // strokeMid for disabled/missing/busy (muted visual — can't act now).
    // borderBright for healthy (active, clickable).
    const actColor = (cfg.stateIndicator === "disabled"
                   || cfg.stateIndicator === "missing"
                   || cfg.stateIndicator === "busy")
      ? C.strokeMid
      : C.borderBright;
    r.appendChild(cell(COL_SIMP_ACT, actionIcon("⌕", actColor)));

    r.appendChild(labelBox);

    const rmGlyph = cfg.remove === false ? "" : "×";
    // × disabled visual during Busy (race-prevention).
    const rmColor = (cfg.stateIndicator === "busy") ? C.strokeMid : C.textDim;
    r.appendChild(cell(COL.RM, rmGlyph ? txt(rmGlyph, F.r, 14, rmColor) : null));

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
    f.appendChild(txt(label || "Ready", F.m, 11, C.text));
    return f;
  }

  // ---------- footer ----------
  function footer(label) {
    const f = hSec(PANEL_W);
    f.paddingLeft = 14; f.paddingRight = 14;
    f.paddingTop = 8; f.paddingBottom = 8;
    f.itemSpacing = 10;
    f.counterAxisAlignItems = "CENTER";
    setFill(f, C.panel, 1);
    f.appendChild(txt("status:", F.r, 11, C.textDim));
    f.appendChild(txt(label || "Ready", F.m, 11, C.text));
    return f;
  }

  // ---------- BUILD DOCUMENT ----------

  const root = figma.createFrame();
  root.name = "SheepDog — State Model v1";
  root.resize(DOC_W, 10);
  root.layoutMode = "VERTICAL";
  root.layoutSizingHorizontal = "FIXED";
  root.layoutSizingVertical = "HUG";
  setFill(root, C.canvas, 1);
  root.paddingTop = PAD; root.paddingBottom = PAD;
  root.paddingLeft = PAD; root.paddingRight = PAD;
  root.itemSpacing = 48;

  const contentW = DOC_W - 2 * PAD;

  // ---------- TITLE ----------
  const titleSec = vSec(contentW);
  titleSec.itemSpacing = 8;
  titleSec.appendChild(txt(
    "SheepDog — State Model v1  ·  4 states + orthogonal settings",
    F.b, 36, C.white, 44, 1
  ));
  titleSec.appendChild(txt(
    "Path > Enabled > Busy priority  ·  SUB/EYE/LBL are settings not states  ·  Scan silent, import = Busy  ·  Disabled: 3 causes, 1 runtime  ·  Missing: 4 subtypes, 1 indicator  ·  2026-04-22",
    F.r, 14, C.textDim, 20
  ));
  titleSec.appendChild(divider(contentW, C.white, 0.08));
  root.appendChild(titleSec);

  // ==================================================
  // SECTION — STATE SHOWCASE
  // Panel + annotation column (right)
  // ==================================================

  const sec = vSec(contentW);
  sec.itemSpacing = 16;
  sec.appendChild(sectionTitle(
    "State showcase — one panel, 4 states, cause variations",
    "STATE column (new) shows per-row indicator. SUB/EYE/LBL are orthogonal settings — shown at right of STATE, unchanged by state.",
    contentW
  ));

  const secRow = hSec(contentW);
  secRow.itemSpacing = 40;
  secRow.counterAxisAlignItems = "MIN";

  // ---------- Panel ----------
  const panel = vSec(PANEL_W);
  panel.cornerRadius = 6;
  panel.clipsContent = true;
  setFill(panel, C.panel, 1);
  setStroke(panel, C.border, 1, 1);
  panel.itemSpacing = 0;

  panel.appendChild(panelHeader());
  panel.appendChild(divider(PANEL_W, C.border, 1));
  panel.appendChild(columnHeaderBar());
  panel.appendChild(divider(PANEL_W, C.border, 1));

  // ---------- Row scenarios ----------
  // NOTE: This file renders STATIC tier snapshots (how each tier looks).
  // The 3-click cycle (pin · toggle · unpin) is an INTERACTION behavior,
  // not a rendering concern. Cycle behavior + bulk-selection grammar lives
  // in sheepdog-state-design-v1.md §12. Separate mock file
  // figma-sheepdog-tier-cycle-v1.js visualizes cycle sequences.
  const rows = [

    // ── S1 HEALTHY ────────────────────────────────────────────────────────────

    // Row 1: Healthy root — 03_Assets (Cerulean label, sub=on eye=on)
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

    // Row 2: Healthy child — 01_Video (indent 18, inherited tier, activity dot)
    // Shows subtle healthy variation: dot in STATE column, inherited checkboxes.
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

    // ── S2 BUSY ───────────────────────────────────────────────────────────────

    // Row 3: Busy root — day_02 (Mango label, import in-flight)
    // STATE LED: solid blue (pulses in prod). Row bg calm.
    // subLocked: true → all toggles (SUB/REL/SEQ/FLT/EYE) render as LOCKED tier
    // (race-prevention during import). Actions all strokeMid = disabled visual.
    // LBL remains fully editable (metadata, no race with in-flight import).
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

    // ── S3 DISABLED — cause: own × force-disable ──────────────────────────────

    // Row 4: Disabled (own force) — _old_backup
    // STATE LED: hollow gray. All controls dashed. Name dim (user-disabled intent).
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

    // ── S3 DISABLED — cause: parent SUB=off cascade ───────────────────────────

    // Row 5a: Parent "ref" — Healthy, sub=OFF (the cause).
    // Parent itself is NOT disabled. Row is calm. SUB checkbox is overridden-off.
    // Tree: expanded so the cascade child is visible as a child.
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

    // Row 5b: Child of "ref" — cascade-disabled because parent SUB=off.
    // The child itself has no override — it's disabled BY cascade.
    // STATE LED: hollow gray. Controls disabled-inherited tier. Name dim.
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

    // ── S3 DISABLED — cause: parent itself force-disabled (cascade) ────────────

    // Row 6a: Parent "_trash" — force-disabled (own ×). Dashed row.
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

    // Row 6b: Child of "_trash" — cascade-disabled (parent is disabled).
    // Both parent and child have hollow gray LED + dim names. Child uses disabled-inherited tier.
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

    // ── S4 MISSING — enoent ───────────────────────────────────────────────────

    // Row 7: Missing (enoent) — 03_Archive (subfolder of 03_Assets)
    // Showcase: MIXED inheritance under Missing state.
    //   - sub/rel/seq/flt → disabled-inherited-* (defaults, user didn't touch)
    //   - eye → disabled-on (OVERRIDDEN — user explicitly turned eye=on on this
    //     child before path went missing; the override persists even though
    //     runtime is off, will reapply when path returns)
    // Visual difference: inherited tier uses backMid stroke (dimmer), overridden
    // uses strokeMid (brighter) — both dashed for disabled state.
    // Path red + ⚠ prefix. State LED = red. No colored buttons.
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

    // Row 8: Missing (offline drive) — F:/external/footage
    // Stored values were overridden → render as disabled (overridden-disabled) tier.
    // Name stays bright — user's intent was "active", path is the blocker.
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

    // Row 9: Missing (eacces) — E:/locked
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

    // ── EDGE CASE — Missing AND user-disabled ─────────────────────────────────

    // Row 10: Two independent axes visible simultaneously.
    //   - path: missing (offline drive) → LED red
    //   - user intent: force-disabled via × → name DIM
    // Unlike Row 8 (missing-only, name stays bright), here the user had already
    // turned this row off BEFORE the path went offline. Both signals persist:
    // LED carries operational state (red = path blocker), name carries user
    // intent (dim = user's "off"). Tooltip says: "Offline · disabled by user".
    //
    // Real impl: cfg.userDisabled:true persisted in config, path:missing derived
    // from fs probe. The two axes are ORTHOGONAL in data — visual composes them.
    // Mock: explicit nameColor:strokeMid on a missing row.
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

  for (const cfg of rows) {
    panel.appendChild(row(cfg));
    panel.appendChild(divider(PANEL_W, C.border, 0.25));
  }

  panel.appendChild(footer("Watching 12 rows  ·  1 busy  ·  4 missing  ·  4 disabled  ·  1 edge (missing + user-disabled)"));

  secRow.appendChild(panel);

  // ---------- Annotation column (right) ----------
  const ann = vSec(ANN_W);
  ann.itemSpacing = 20;

  // ── ANNOTATION CARD: S1 Healthy ─────────────────────────────────────────────
  ann.appendChild(annCard("S1 — Healthy", C.accent, [
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

  // ── ANNOTATION CARD: S2 Busy ─────────────────────────────────────────────────
  ann.appendChild(annCard("S2 — Busy (import in-flight)", C.accent, [
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
        g.appendChild(checkbox("on", true)); // locked on
        g.appendChild(eyeToggle("on", true)); // locked on
        return g;
      })()),
      title: "Race-prevention lock — toggles + actions",
      desc: "Toggles (SUB/REL/SEQ/FLT/EYE) render as LOCKED tier (backMid backing on checkboxes, backing+gradient on eye) — not clickable during import. Action icons (↻ ⌕ 🧲) render strokeMid = disabled visual. × also disabled (can't remove folder mid-import). LBL stays editable — metadata edits don't race with in-flight import.",
    },
    {
      demo: demoBox(32, 20, txt("N/M", F.m, 10, C.textDim)),
      title: "N/M counter (future)",
      desc: "Busy row can carry a file counter (e.g. 12/40) via tooltip on the LED. Not rendered in this mock — LED slot is too narrow for counter text.",
    },
  ]));

  // ── ANNOTATION CARD: S3 Disabled ─────────────────────────────────────────────
  ann.appendChild(annCard("S3 — Disabled (3 causes, 1 runtime)", C.strokeMid, [
    {
      demo: demoBox(32, 20, (function() {
        const led = figma.createFrame();
        led.resize(6, 6); led.cornerRadius = 3;
        led.fills = []; setStroke(led, C.strokeMid, 1, 1);
        return led;
      })()),
      title: "Hollow gray LED — off, not broken",
      desc: "Apple-lead rationale: 2×2 grammar (shape × hue). Solid=active-attention (busy/missing), hollow=passive-baseline (idle/disabled). Hollow strokeMid stroke reads as \"muted, off by user\" without claiming red/alarm. Disabled-but-healthy does NOT get a bright stroke — that would read as \"still alive\". Stroke brightness encodes \"channel: baseline-ok vs turned-off\".",
    },
    {
      demo: demoBox(32, 20, (function() {
        const f = figma.createFrame(); f.resize(14, 14); f.cornerRadius = 3;
        f.fills = []; setStroke(f, TC.strokeMid, 1, 1); f.dashPattern = [2,2]; return f;
      })()),
      title: "Cause A — own × force-disable",
      desc: "User explicitly disabled this row. × on a child sets force-disable (blacklist). × on a root removes from config. Tooltip: \"Disabled by user.\"",
    },
    {
      demo: demoBox(32, 20, (function() {
        const f = figma.createFrame(); f.resize(14, 14); f.cornerRadius = 3;
        f.fills = []; setStroke(f, TC.backMid, 1, 1); f.dashPattern = [2,2]; return f;
      })()),
      title: "Cause B — parent SUB=off cascade",
      desc: "Parent has SUB=off (parent is Healthy, LED hollow bright, not disabled). Descendants inherit disabled-cause. Controls show disabled-inherited tier (backMid dashed border — dimmer than Cause A). Tooltip: \"Watching disabled — parent SUB=off.\"",
    },
    {
      demo: demoBox(32, 20, (function() {
        const f = figma.createFrame(); f.resize(14, 14); f.cornerRadius = 3;
        f.fills = []; setStroke(f, TC.backMid, 1, 1); f.dashPattern = [2,2]; return f;
      })()),
      title: "Cause C — parent itself disabled",
      desc: "Parent row is Disabled (any cause). Whole subtree cascades. Controls use disabled-inherited tier. Tooltip: \"Watching disabled — parent disabled.\" Both parent and child carry the hollow gray LED.",
    },
  ]));

  // ── ANNOTATION CARD: S4 Missing ─────────────────────────────────────────────
  ann.appendChild(annCard("S4 — Missing (path unreachable)", C.danger, [
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
      desc: "Controls (checkboxes, eye, action icons) render as disabled-tier because runtime is off. Stored values preserved via disabled / disabled-inherited styling. Relink is still the primary action semantically — the red LED and ⚠ on path are the cues, not a button highlight. × alive, LBL editable. Toggles store-not-apply.",
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
      desc: "enoent: folder deleted/renamed — periodic re-probe. offline: drive disconnected — aggressive re-probe. eacces: permission denied — retry useless. other: IO error / broken symlink. Subtype stored in config, affects retry strategy. LED is red across all 4.",
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
      desc: "Row was force-disabled by × and path is ALSO offline. Two independent axes visible: LED solid red (path = operational blocker), name dim (user intent = \"off\"). Restore path → LED becomes hollow bright (healthy)? No — user-disabled persists, LED becomes hollow dim (disabled). To reactivate: fix path AND × (restore). See Row 10 in the panel.",
    },
  ]));

  // ── ANNOTATION CARD: Simplified / Advanced mode (§13) ──────────────────────
  ann.appendChild(annCard("Simplified / Advanced mode (§13)", C.accent, [
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("Advanced", F.m, 9, C.text));
        g.appendChild(toggle(true));
        return g;
      })()),
      title: "Toggle \"Advanced\" in panel header",
      desc: "Default state OFF → Simplified view (fewer columns). Toggle ON reveals advanced columns inline. Panel shown here is in Advanced mode (all columns visible). Renamed / expanded from v1.2 \"Auto Sync\" — one toggle governs both behavior + chrome.",
    },
    {
      demo: demoBox(32, 20, txt("S · N · ⌕ · □ · □ · L · ×", F.m, 8, C.textDim)),
      title: "Simplified columns",
      desc: "STATE · NAME (hover=path) · LNK · LBL · × — only 5 columns. Hidden: PATH · SUB · REL · SEQ · FLT · EYE · DEL · ACTIONS. SUB defaults ON (recursive). SEQ forced ON via Premiere's native sequence detection — no SheepDog detector needed. EYE forced ON. DEL hidden regardless of Settings toggle.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("▾ 03_Archive", F.m, 9, C.text));
        g.appendChild(loadIcon("search", C.danger, 10));
        return g;
      })()),
      title: "⌕ symmetric with chevron",
      desc: "Relink icon inline after NAME text — Missing rows only. Chevron left-sticks, ⌕ right-sticks. Zero chrome on Healthy / Busy / Disabled rows. Semantic binding: ⌕ is a row-level recovery action, not a column-level generic.",
    },
    {
      demo: demoBox(32, 20, eyeToggle("on")),
      title: "EYE only in Advanced",
      desc: "In Simplified, EYE forced ON globally — \"auto-import everything\". Per-row EYE override requires Advanced. Stored EYE values preserved across toggle: switch Advanced → Simplified preserves overrides silently, reapplied on switch back.",
    },
  ]));

  // ── ANNOTATION CARD: × action matrix — what clicking does per row state ────
  ann.appendChild(annCard("× action matrix (§14)", C.textDim, [
    {
      demo: demoBox(42, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("root", F.s, 8, C.textDim, undefined, 0.5));
        g.appendChild(txt("×", F.r, 14, C.textDim));
        return g;
      })()),
      title: "Parent → remove from tracking",
      desc: "Tooltip: \"Remove folder from SheepDog\". Click → confirm → config entry deleted. Disk files UNTOUCHED (plugin doesn't own FS). Always available — parent is config-layer only.",
    },
    {
      demo: demoBox(42, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("child", F.s, 8, C.textDim, undefined, 0.5));
        g.appendChild(txt("×", F.r, 14, C.textDim));
        return g;
      })()),
      title: "Child healthy → disable (toggle)",
      desc: "Tooltip: \"Disable watching\". Click → watching stops on this row, stored values (SUB/SEQ/LBL) preserved. Reversible via × again. Plugin CAN'T delete child file — OS owns disk.",
    },
    {
      demo: demoBox(42, 20, (function() {
        const g = hHug(); g.itemSpacing = 6; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("off", F.s, 8, C.strokeMid, undefined, 0.5));
        g.appendChild(txt("×", F.r, 14, C.textDim));
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
        g.appendChild(txt("×", F.r, 14, C.textDim));
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
        g.appendChild(txt("×", F.r, 14, C.strokeMid));
        return g;
      })()),
      title: "Busy → × locked",
      desc: "× renders in strokeMid, click ignored. Race prevention: removing row mid-import would corrupt in-flight bin writes. Re-available when busy clears (usually seconds).",
    },
    {
      demo: demoBox(42, 20, txt("OS", F.s, 10, C.textDim)),
      title: "Want to delete a child? Use OS first",
      desc: "Plugin does NOT offer child delete. To remove a child folder: delete in Finder/CLI → row becomes missing → × cleans up plugin config. Explicit two-step respects OS ownership. Mirror DEL is separate opt-in (Settings) for cross-boundary cascade.",
    },
  ]));

  // ── ANNOTATION CARD: Hide filter (§15) ──────────────────────────────────────
  ann.appendChild(annCard("Hide filter — funnel-x (§15)", C.accent, [
    {
      demo: demoBox(72, 32, (function() {
        const g = hHug(); g.itemSpacing = 8; g.counterAxisAlignItems = "CENTER";
        g.appendChild(btnFilter(false)); // OFF state
        g.appendChild(btnFilter(true));  // ON state
        return g;
      })()),
      title: "funnel-x — OFF / ON states",
      desc: "Left (OFF): funnel + × both #9999A1 — whole icon quiet. Right (ON): funnel #D7D7DA bright, × stays #9999A1 dim. Funnel body alone lights up as the \"engaged\" signal — × is always-subtle modifier. Click toggles immediately.",
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
        g.appendChild(txt("03_Assets", F.m, 9, C.text));
        return g;
      })()),
      title: "Chevron — only if has children",
      desc: "Parent with children → chevron shown (even if all hidden by filter). Leaf row → no chevron. Chevron = structural signal (\"container\"), not visibility signal. Click on all-hidden parent's chevron → silent empty expansion (MVP).",
    },
    {
      demo: demoBox(42, 20, txt("polish", F.s, 9, C.strokeMid)),
      title: "Parked: bold border + hint",
      desc: "Google Sheets style: thick border where rows hidden between visible ones. Parked polish. Also parked: inline \"N children hidden — toggle filter\" hint on empty expansions. MVP: silent behavior + footer counter carry the signal.",
    },
  ]));

  // ── ANNOTATION CARD: Check & Import button behavior ─────────────────────────
  ann.appendChild(annCard("↻ Check & Import — activity-driven", C.borderBright, [
    {
      demo: demoBox(72, 32, (function() {
        const g = hHug(); g.itemSpacing = 8; g.counterAxisAlignItems = "CENTER";
        g.appendChild(btnCheckImport(false)); // idle
        g.appendChild(btnCheckImport(true));  // active
        return g;
      })()),
      title: "Idle / active states (same chrome)",
      desc: "Outlined 28×28 square, no fill. Idle (left): icon #9999A1 dim. Active (right): icon #D7D7DA bright. Feedback purely via icon brightness — no blue fill, matches filter button chrome.",
    },
    {
      demo: demoBox(32, 20, txt("user", F.m, 9, C.textDim)),
      title: "Click → triggers mass check+import",
      desc: "User-initiated action. Click starts bulk fs walk + Premiere importFiles for all (or selected) rows. Icon brightens to active state for duration of import job.",
    },
    {
      demo: demoBox(32, 20, txt("auto", F.m, 9, C.textDim)),
      title: "Dims back when import completes",
      desc: "Icon brightness follows operation state, not user toggle state. When mass check+import finishes (all files imported or aborted), icon auto-dims back to #9999A1 idle. User sees \"system done\" through visual cue.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(btnFilter(false));
        g.appendChild(btnCheckImport(false));
        return g;
      })()),
      title: "Why no blue fill — chrome unification",
      desc: "Earlier draft had ↻ on accent-blue fill. Revised: both header buttons (filter + ↻) share outlined chrome. Chromatic hierarchy lives in icon color, not button background. Keeps toolbar calm — blue fill drew too much attention for \"idle primary\" state.",
    },
  ]));

  // ── ANNOTATION CARD: × context-aware actions + hover semantics (§14) ────────
  ann.appendChild(annCard("× row action (§14) — context + hover", C.danger, [
    {
      demo: demoBox(32, 20, txt("×", F.r, 16, C.textDim)),
      title: "Rest state — neutral textDim",
      desc: "Default color across all row types. Tooltip describes intended action per state: \"Remove folder\" (parent), \"Disable watching\" / \"Enable watching\" (child), \"Delete entry\" (missing). Same visual at rest — semantic lives in tooltip + hover color.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 8; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("×", F.r, 16, C.textDim));
        g.appendChild(txt("→", F.r, 10, C.textDim));
        g.appendChild(txt("×", F.b, 16, C.danger));
        return g;
      })()),
      title: "Destructive hover — RED (parent + missing)",
      desc: "Parent row (remove-from-tracking) and missing row (delete-from-config) → hover turns × red. Pre-action warning: irreversible, no Cmd+Z after confirm dialog. Red reserved for \"cannot undo\" semantics — matches LED red (missing), path red, ⚠ prefix. Consistent grammar: red = think before commit.",
    },
    {
      demo: demoBox(32, 20, (function() {
        const g = hHug(); g.itemSpacing = 8; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("×", F.r, 16, C.textDim));
        g.appendChild(txt("→", F.r, 10, C.textDim));
        g.appendChild(txt("×", F.b, 16, C.text));
        return g;
      })()),
      title: "Safe hover — one tier brighter (child toggle)",
      desc: "Child healthy (disable action) + child disabled (enable action) → hover brightens × to C.text. Reversible operation, Cmd+Z undoes. Neutral visual signals \"tap, it's fine\". No red = no permanent destruction.",
    },
    {
      demo: demoBox(32, 20, txt("×", F.r, 16, C.strokeMid)),
      title: "Busy — disabled, no hover effect",
      desc: "During import (Busy state), × renders in C.strokeMid and ignores hover. Race-prevention: removing row mid-import would corrupt in-flight bin writes. Re-available immediately when busy clears.",
    },
    {
      demo: demoBox(32, 20, txt("§14", F.s, 10, C.textDim)),
      title: "Plugin responsibility boundary (§16)",
      desc: "Parent × = config-level destroy (no disk touch). Child × = watching toggle only (OS owns the file — plugin doesn't delete). Missing × = config cleanup (file already gone from FS). Mirror DEL is separate opt-in for plugin→disk cascade. × never touches filesystem directly.",
    },
  ]));

  secRow.appendChild(ann);
  sec.appendChild(secRow);
  root.appendChild(sec);

  // ==================================================
  // SECTION 2 — SIMPLIFIED VIEW (§13)
  // Advanced toggle OFF. Same rows, stripped chrome.
  // ==================================================

  const sec2 = vSec(contentW);
  sec2.itemSpacing = 16;
  sec2.appendChild(sectionTitle(
    "Simplified view — Advanced toggle OFF",
    "Minimal chrome. STATE · NAME (hover=path) · LNK · LBL · ×. Only 5 columns. Globals: EYE forced ON · SEQ forced ON (Premiere auto-detect) · SUB default ON · DEL hidden · REL/FLT default OFF. Default view for new users.",
    contentW
  ));

  const sec2Row = hSec(contentW);
  sec2Row.itemSpacing = 40;
  sec2Row.counterAxisAlignItems = "MIN";

  // ---------- Simplified Panel ----------
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

  // Subset of rows showing each state — demonstrates contrast with Advanced panel.
  // Tree order: children of 03_Assets live INSIDE its expansion (rows 2–3),
  // then roots follow (day_02, _old_backup, external_footage).
  const simpRows = [
    // Row 1: Healthy root — 03_Assets, expanded
    {
      tree: "expanded", stateIndicator: "healthy",
      name: "03_Assets",
      sub: "on", seq: "off",
      label: C.labelCerulean,
    },
    // Row 2: Healthy child of 03_Assets
    {
      indent: 18, tree: "expanded", stateIndicator: "healthy",
      name: "01_Video",
      sub: "inherited-on", seq: "on",
      label: null, labelInherited: true,
    },
    // Row 3: Missing child of 03_Assets — lives inside parent's expansion (moved from row 5)
    {
      indent: 18, tree: "collapsed", stateIndicator: "missing",
      name: "03_Archive",
      sub: "disabled-inherited-on", seq: "disabled-inherited-off",
      label: null, labelInherited: true,
    },
    // Row 4: Busy root — day_02. subLocked: true locks all toggles (race-prevention).
    // Actions render strokeMid (disabled visual). LBL stays editable (metadata, no race).
    {
      tree: "collapsed", stateIndicator: "busy", subLocked: true,
      name: "day_02",
      sub: "on", seq: "off",
      label: C.labelMango,
    },
    // Row 5: Disabled root (own force)
    {
      tree: "collapsed", stateIndicator: "disabled",
      name: "_old_backup",
      sub: "disabled", seq: "disabled",
      label: null, labelInherited: true,
      nameColor: C.strokeMid,
    },
    // Row 6: Missing root — offline drive
    {
      tree: "collapsed", stateIndicator: "missing",
      name: "external_footage",
      sub: "disabled-on", seq: "disabled",
      label: C.labelIris,
    },
  ];

  for (const cfg of simpRows) {
    simpPanel.appendChild(rowSimplified(cfg, PANEL_SIMP_W));
    simpPanel.appendChild(divider(PANEL_SIMP_W, C.border, 0.25));
  }

  simpPanel.appendChild(footerSimplified("6 rows  ·  1 busy  ·  2 missing  ·  1 disabled", PANEL_SIMP_W));

  sec2Row.appendChild(simpPanel);

  // ---------- Annotation column ----------
  const simpAnn = vSec(ANN_W);
  simpAnn.itemSpacing = 20;

  simpAnn.appendChild(annCard("Simplified — what differs from Advanced", C.accent, [
    {
      demo: demoBox(40, 20, (function() {
        const g = hHug(); g.itemSpacing = 4; g.counterAxisAlignItems = "CENTER";
        g.appendChild(txt("Advanced", F.m, 9, C.text));
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
      desc: "All three checkbox-based controls hidden in Simplified. Reasoning: SUB toggle only affects FUTURE fs events — initial walk is irreversible, so post-hoc SUB=off helps little for casual users. SEQ delegated to Premiere's importAsNumberedStills (native sequence detection — no SheepDog detector). EYE forced ON = \"auto-import all\". Stored per-row values preserved silently; reapplied when Advanced toggles ON.",
    },
    {
      demo: demoBox(32, 20, txt("R F D", F.s, 9, C.strokeMid)),
      title: "REL · FLT · DEL hidden",
      desc: "REL/FLT default OFF in Settings. DEL hidden regardless of its Settings toggle (delete-related-bins is a destructive feature → kept out of Easy mode entirely). All three available in Advanced.",
    },
  ]));

  sec2Row.appendChild(simpAnn);
  sec2.appendChild(sec2Row);
  root.appendChild(sec2);

  // ---------- Focus & notify ----------
  root.x = 100;
  root.y = 100;
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("SheepDog State Model v1 — done");
}

main();
