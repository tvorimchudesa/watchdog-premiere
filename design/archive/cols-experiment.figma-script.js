// SheepDog — Column Architecture Sandbox v1 · Figma Scripter mockup
// Baseline: helpers + §0 title + §1 main panel copied verbatim from
// figma-sheepdog-panel-v2.js (proven to render). Will layer ST rename +
// ACTIONS centering + Column Architecture annotation card on top.
// If renders without collapse, lift changes back into v2.

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
  root.name = "SheepDog — Column Architecture Sandbox v1";
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
  // ---------- Position & focus ----------
  root.x = 100;
  root.y = 100;
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("Column Architecture Sandbox v1 — baseline copy");
}

main();
