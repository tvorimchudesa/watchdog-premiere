// SheepDog — Tier Cycle & Bulk Grammar v1 · Figma Scripter mockup
// Companion to figma-sheepdog-states-v1.js (4 row states).
// This file visualizes §12 from sheepdog-state-design-v1.md:
//   - 3-click cycle (pin · toggle · unpin)
//   - Root constraint (2-state only)
//   - Bulk selection grammar: cascade via root click, children-only cycle
//   - Selection bar + Reset inheritance
//   - Asymmetry tooltips
//
// Helpers copied verbatim from figma-sheepdog-states-v1.js.
// No modifications to existing helpers.
// DOC_W = 1840 (wider for sequence diagrams).
// All other constants match states-v1.js.

async function main() {
  // ---------- Fonts ----------
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Italic" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // ---------- Constants ----------
  const DOC_W   = 1840;
  const PAD     = 40;
  const PANEL_W = 940;
  const ANN_W   = 540;

  const COL = {
    LABEL: 20,
    TREE:  14,
    NAME:  204,
    PATH:  210,
    STATE: 32,
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

  // ---------- Colors (verbatim from states-v1.js) ----------
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

  // ---------- SVG icons (verbatim from states-v1.js) ----------
  const SVG = {
    refresh:      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>',
    search:       '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>',
    magnet:       '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.87891 7.87891H4.22205" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.7784 4.13388C19.7784 3.81433 19.6514 3.50787 19.4255 3.28191C19.1995 3.05595 18.893 2.92899 18.5735 2.92897L15.3265 2.92897C15.0069 2.92899 14.7004 3.05595 14.4745 3.28191C14.2485 3.50787 14.1216 3.81433 14.1215 4.13388V12.6602C14.1215 12.9387 14.0667 13.2146 13.9601 13.472C13.8535 13.7293 13.6972 13.9632 13.5002 14.1602C13.3032 14.3572 13.0694 14.5134 12.812 14.62C12.5546 14.7266 12.2788 14.7815 12.0002 14.7815C11.7216 14.7815 11.4458 14.7266 11.1884 14.62C10.9311 14.5134 10.6972 14.3572 10.5002 14.1602C10.3032 13.9632 10.147 13.7293 10.0404 13.472C9.93377 13.2146 9.8789 12.9387 9.8789 12.6602L9.8789 4.13388C9.87888 3.81433 9.75193 3.50787 9.52597 3.28191C9.30001 3.05595 8.99355 2.92899 8.67399 2.92897L5.42696 2.92897C5.1074 2.92899 4.80094 3.05595 4.57498 3.28191C4.34903 3.50787 4.22207 3.81433 4.22205 4.13388L4.22346 13.1368C4.22365 15.1997 5.04331 17.178 6.50214 18.6366C7.96096 20.0951 9.93944 20.9144 12.0023 20.9142C13.0238 20.9141 14.0352 20.7129 14.9789 20.3219C15.9225 19.9309 16.7799 19.3579 17.5021 18.6356C18.9607 17.1767 19.78 15.1983 19.7798 13.1353L19.7784 4.13388Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.7783 7.87891H14.1215" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    eye:          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeClosed:    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>',
    settings:     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>',
    chevronDown:  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  };

  // ---------- Helpers — copied verbatim from states-v1.js ----------

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

  // TC — solid taxonomy palette (verbatim from states-v1.js).
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

  // checkbox() — verbatim from states-v1.js.
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

  // eyeToggle() — verbatim from states-v1.js.
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
      const isOn = (variant === "on" || variant === "inherited-on");
      if (isOn) { cls = "inherited"; value = "on"; }
      else       { cls = "inherited"; value = "off"; }
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
    let glyph, color, backing = null, dashed = false;
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
    } else if (cls === "disabled" && value === "on") {
      glyph = "eye"; color = TC.strokeMid; dashed = true;
    } else if (cls === "disabled" && value === "off") {
      glyph = "eyeClosed"; color = TC.strokeMid; dashed = true;
    } else if (cls === "disabled-inherited" && value === "on") {
      glyph = "eye"; color = TC.strokeMid; dashed = true;
    } else if (cls === "disabled-inherited" && value === "off") {
      glyph = "eyeClosed"; color = TC.backMid; dashed = true;
    } else if (cls === "disabled-locked" && value === "on") {
      glyph = "eye"; color = TC.backMid; backing = TC.backDim; dashed = true;
    } else {
      glyph = "eye"; color = TC.strokeMid;
    }

    const g = loadIcon(glyph, color, glyphSize);
    if (backing) applyBodyBacking(g, glyph, backing);
    if (dashed)  applyBodyDash(g, glyph);
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

  // ---------- Local helpers (this file only) ----------

  // arrowLabel — compact horizontal strip: left glyph + label text + right glyph.
  // Used for directional arrows between states.
  // arrowStr: e.g. ">" or "<". label: step name.
  function arrowLabel(label, w) {
    const f = hSec(w || 60);
    f.itemSpacing = 6;
    f.counterAxisAlignItems = "CENTER";
    f.primaryAxisAlignItems = "CENTER";
    f.appendChild(txt("-->", F.r, 11, C.textDim));
    if (label) f.appendChild(txt(label, F.m, 11, C.text));
    return f;
  }

  // bigArrow — tall centered arrow for before/after panels.
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

  // cycleCell — cell for cycle diagrams. Contains glyph widget + label.
  // kind: "checkbox" | "eye". variant: eyeToggle/checkbox variant string.
  // label: text below glyph.
  function cycleCell(kind, variant, label, stepLabel) {
    const wrap = vHug();
    wrap.itemSpacing = 6;
    wrap.counterAxisAlignItems = "CENTER";

    // Step badge if provided (e.g. "1", "2", "3").
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

    // Glyph in a centered container.
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

  // compactArrow — inline arrow text for cycle row separators.
  function compactArrow(label) {
    const f = vHug();
    f.itemSpacing = 4;
    f.counterAxisAlignItems = "CENTER";
    f.appendChild(txt(">", F.b, 12, C.borderStrong));
    if (label) f.appendChild(txt(label, F.m, 9, C.accent, 12));
    return f;
  }

  // miniPanel — compact panel frame for before/after demos.
  // Takes a fixed width. Contains rows appended by caller.
  function miniPanel(w) {
    const p = vSec(w);
    p.cornerRadius = 6;
    p.clipsContent = true;
    setFill(p, C.panel, 1);
    setStroke(p, C.border, 1, 1);
    p.itemSpacing = 0;
    return p;
  }

  // miniColHeader — thin column-header bar for mini panels.
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

  // miniRow — compact row for mini panels. Shows name + optional indent + eye variant.
  // cfg: { name, indent, eyeVariant, selected }
  function miniRow(cfg, panelW) {
    const wrap = hSec(panelW);
    wrap.paddingLeft = 10; wrap.paddingRight = 10;
    wrap.paddingTop = 0; wrap.paddingBottom = 0;
    wrap.itemSpacing = 0;
    wrap.counterAxisAlignItems = "CENTER";
    // Selection = slightly lightened bg only. No accent stroke — less chrome,
    // matches Finder/Photos macOS selection style (subtle tint, no border).
    if (cfg.selected) {
      setFill(wrap, C.panelHi, 1);
    } else {
      wrap.fills = [];
    }

    const inner = hSec(panelW - 20);
    inner.itemSpacing = 6;
    inner.counterAxisAlignItems = "CENTER";
    inner.paddingTop = 5; inner.paddingBottom = 5;

    if (cfg.indent) inner.appendChild(spacer(cfg.indent, 1));

    const nameText = txt(cfg.name, cfg.root ? F.m : F.r, 11, cfg.root ? C.text : C.textDim);
    inner.appendChild(nameText);

    // Spacer to push eye to right.
    const sp = spacer(1, 1);
    inner.appendChild(sp);
    sp.layoutGrow = 1;

    inner.appendChild(eyeToggle(cfg.eyeVariant));

    wrap.appendChild(inner);
    return wrap;
  }

  // tooltipBox — static floating tooltip (§6).
  // text: tooltip content. pointDown: triangle pointing down (toward cell below).
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
    box.appendChild(txtW(text, F.r, 11, C.text, 200, 16));
    wrap.appendChild(box);

    if (pointDown) {
      // Triangle pointer — small rotated rectangle as visual cue.
      const tri = figma.createRectangle();
      tri.resize(8, 8);
      tri.rotation = 45;
      tri.fills = [{ type: "SOLID", color: C.border, opacity: 1 }];
      // We can't perfectly position the rotated rect in auto layout,
      // so we use a small 8x4 spacer that suggests the pointer direction.
      const triWrap = figma.createFrame();
      triWrap.resize(16, 6);
      triWrap.fills = [];
      wrap.appendChild(triWrap);
    }

    return wrap;
  }

  // ================================================================
  // BUILD DOCUMENT
  // ================================================================

  const root = figma.createFrame();
  root.name = "SheepDog — Tier Cycle & Bulk Grammar v1";
  root.resize(DOC_W, 10);
  root.layoutMode = "VERTICAL";
  root.layoutSizingHorizontal = "FIXED";
  root.layoutSizingVertical = "HUG";
  setFill(root, C.canvas, 1);
  root.paddingTop = PAD; root.paddingBottom = PAD;
  root.paddingLeft = PAD; root.paddingRight = PAD;
  root.itemSpacing = 56;

  const contentW = DOC_W - 2 * PAD;

  // ---------- TITLE ----------
  const titleSec = vSec(contentW);
  titleSec.itemSpacing = 8;
  titleSec.appendChild(txt(
    "SheepDog — Tier Cycle & Bulk Grammar v1  ·  §12 interaction model",
    F.b, 36, C.white, 44, 1
  ));
  titleSec.appendChild(txt(
    "3-click cycle (pin · toggle · unpin)  ·  Root 2-state constraint  ·  Bulk cascade via root click  ·  Children-only 3-cycle  ·  Asymmetry tooltips  ·  2026-04-22",
    F.r, 14, C.textDim, 20
  ));
  titleSec.appendChild(divider(contentW, C.white, 0.08));
  root.appendChild(titleSec);

  // ==================================================================
  // SECTION 1 — 3-click cycle (checkbox + eye)
  // ==================================================================

  const sec1 = vSec(contentW);
  sec1.itemSpacing = 20;
  sec1.appendChild(sectionTitle(
    "§1 — 3-click cycle: pin · toggle · unpin",
    "Single click cycles through 3 tier states. Discord-precedent. Both checkbox and eye follow identical cycle logic.",
    contentW
  ));

  const sec1Row = hSec(contentW);
  sec1Row.itemSpacing = 40;
  sec1Row.counterAxisAlignItems = "MIN";

  // ---- Cycle diagrams (left) ----
  const cycleCol = vSec(680);
  cycleCol.itemSpacing = 32;

  // Checkbox cycle row
  const chkCycleWrap = vSec(680);
  chkCycleWrap.itemSpacing = 12;
  chkCycleWrap.appendChild(txt("Checkbox cycle", F.s, 13, C.text));

  const chkCycleRow = hHug();
  chkCycleRow.itemSpacing = 16;
  chkCycleRow.counterAxisAlignItems = "CENTER";

  chkCycleRow.appendChild(cycleCell("checkbox", "inherited-on", "inherited-on\n(dim)", "1"));
  chkCycleRow.appendChild(compactArrow("pin"));
  chkCycleRow.appendChild(cycleCell("checkbox", "on", "overridden-on\n(bright)", "2"));
  chkCycleRow.appendChild(compactArrow("toggle"));
  chkCycleRow.appendChild(cycleCell("checkbox", "off", "overridden-off\n(bright)", "3"));
  chkCycleRow.appendChild(compactArrow("unpin"));
  // Wrap-around label.
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

  // Eye cycle row
  const eyeCycleWrap = vSec(680);
  eyeCycleWrap.itemSpacing = 12;
  eyeCycleWrap.appendChild(txt("Eye cycle", F.s, 13, C.text));

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

  sec1Row.appendChild(cycleCol);

  // ---- Annotation (right) ----
  sec1Row.appendChild(annCard("3-click cycle — data model", C.accent, [
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

  sec1.appendChild(sec1Row);
  root.appendChild(sec1);

  // ==================================================================
  // SECTION 2 — Root vs Child state-space
  // ==================================================================

  const sec2 = vSec(contentW);
  sec2.itemSpacing = 20;
  sec2.appendChild(sectionTitle(
    "§2 — Root vs Child: 2-state vs 3-state",
    "Root rows have no parent → inherited state impossible. Cycle degrades to simple toggle.",
    contentW
  ));

  const sec2Row = hSec(contentW);
  sec2Row.itemSpacing = 40;
  sec2Row.counterAxisAlignItems = "MIN";

  const stateSpaceCol = vSec(700);
  stateSpaceCol.itemSpacing = 24;

  // Root panel
  const rootPanel = vSec(330);
  rootPanel.itemSpacing = 12;
  rootPanel.appendChild(txt("Root — 2-state toggle (no inherited)", F.s, 13, C.text));

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
  rootPanel.appendChild(txt(
    "No inherited state. Tooltip: \"Toggle (root, no inherited state)\".",
    F.r, 11, C.textDim, 17
  ));

  stateSpaceCol.appendChild(rootPanel);
  stateSpaceCol.appendChild(divider(700, C.border, 0.3));

  // Child panel
  const childPanel = vSec(700);
  childPanel.itemSpacing = 12;
  childPanel.appendChild(txt("Child — 3-state cycle (full)", F.s, 13, C.text));

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
  childPanel.appendChild(txt(
    "Full 3-state. Tooltip: \"Cycle: pin · toggle · reset.\"",
    F.r, 11, C.textDim, 17
  ));

  stateSpaceCol.appendChild(childPanel);

  sec2Row.appendChild(stateSpaceCol);

  sec2Row.appendChild(annCard("Root constraint — physics, not design choice", C.borderBright, [
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

  sec2.appendChild(sec2Row);
  root.appendChild(sec2);

  // ==================================================================
  // SECTION 3 — Bulk: cascade via root click (root + children selected)
  // ==================================================================

  const sec3 = vSec(contentW);
  sec3.itemSpacing = 20;
  sec3.appendChild(sectionTitle(
    "§3 — Bulk: cascade via root click",
    "Click root's eye cell with root + children selected. Root drives 2-cycle. All rows unify.",
    contentW
  ));

  const sec3Row = hSec(contentW);
  sec3Row.itemSpacing = 24;
  sec3Row.counterAxisAlignItems = "MIN";

  // Mini panel widths for §3.
  const MP3W = 320;

  // ---- BEFORE panel ----
  const before3Wrap = vSec(MP3W);
  before3Wrap.itemSpacing = 8;
  before3Wrap.appendChild(txt("BEFORE", F.s, 12, C.textDim, undefined, 1));

  const before3Panel = miniPanel(MP3W);
  before3Panel.appendChild(miniColHeader(MP3W));
  before3Panel.appendChild(divider(MP3W, C.border, 1));

  // Row: root "Projects", eye = overridden-on (bright), selected.
  before3Panel.appendChild(miniRow({ name: "Projects", root: true, eyeVariant: "on", selected: true }, MP3W));
  before3Panel.appendChild(divider(MP3W, C.border, 0.2));
  // Child rows: mix of inherited-on and overridden-off.
  before3Panel.appendChild(miniRow({ name: "01_Clients", indent: 16, eyeVariant: "inherited-on", selected: true }, MP3W));
  before3Panel.appendChild(divider(MP3W, C.border, 0.2));
  before3Panel.appendChild(miniRow({ name: "02_Internal", indent: 16, eyeVariant: "inherited-on", selected: true }, MP3W));
  before3Panel.appendChild(divider(MP3W, C.border, 0.2));
  before3Panel.appendChild(miniRow({ name: "03_Archive", indent: 16, eyeVariant: "off", selected: true }, MP3W));
  before3Panel.appendChild(divider(MP3W, C.border, 0.2));
  before3Panel.appendChild(miniRow({ name: "04_Trash", indent: 16, eyeVariant: "off", selected: true }, MP3W));

  before3Wrap.appendChild(before3Panel);
  before3Wrap.appendChild(txt("Root: overridden-on (bright). Children: mixed.", F.r, 10, C.textDim, 14));

  // ---- Middle arrow ----
  const arrow3Wrap = vHug();
  arrow3Wrap.itemSpacing = 8;
  arrow3Wrap.counterAxisAlignItems = "CENTER";
  const arrowBox3 = figma.createFrame();
  arrowBox3.resize(48, 48);
  arrowBox3.layoutMode = "HORIZONTAL";
  arrowBox3.layoutSizingHorizontal = "FIXED";
  arrowBox3.layoutSizingVertical = "FIXED";
  arrowBox3.primaryAxisAlignItems = "CENTER";
  arrowBox3.counterAxisAlignItems = "CENTER";
  setFillFlat(arrowBox3, C.accent, 0.12);
  setStroke(arrowBox3, C.accent, 0.4, 1);
  arrowBox3.cornerRadius = 24;
  arrowBox3.appendChild(txt(">", F.b, 18, C.accent));
  arrow3Wrap.appendChild(arrowBox3);
  arrow3Wrap.appendChild(txt("Click root's", F.r, 10, C.textDim, 13));
  arrow3Wrap.appendChild(txt("eye cell", F.m, 10, C.text, 13));

  // ---- AFTER panel ----
  const after3Wrap = vSec(MP3W);
  after3Wrap.itemSpacing = 8;
  after3Wrap.appendChild(txt("AFTER", F.s, 12, C.textDim, undefined, 1));

  const after3Panel = miniPanel(MP3W);
  after3Panel.appendChild(miniColHeader(MP3W));
  after3Panel.appendChild(divider(MP3W, C.border, 1));

  // Root toggled to overridden-off. All children forced to overridden-off.
  after3Panel.appendChild(miniRow({ name: "Projects", root: true, eyeVariant: "off", selected: true }, MP3W));
  after3Panel.appendChild(divider(MP3W, C.border, 0.2));
  after3Panel.appendChild(miniRow({ name: "01_Clients", indent: 16, eyeVariant: "off", selected: true }, MP3W));
  after3Panel.appendChild(divider(MP3W, C.border, 0.2));
  after3Panel.appendChild(miniRow({ name: "02_Internal", indent: 16, eyeVariant: "off", selected: true }, MP3W));
  after3Panel.appendChild(divider(MP3W, C.border, 0.2));
  after3Panel.appendChild(miniRow({ name: "03_Archive", indent: 16, eyeVariant: "off", selected: true }, MP3W));
  after3Panel.appendChild(divider(MP3W, C.border, 0.2));
  after3Panel.appendChild(miniRow({ name: "04_Trash", indent: 16, eyeVariant: "off", selected: true }, MP3W));

  after3Wrap.appendChild(after3Panel);
  after3Wrap.appendChild(txt("All rows: overridden-off. Unified in 1 click.", F.r, 10, C.textDim, 14));

  sec3Row.appendChild(before3Wrap);
  sec3Row.appendChild(arrow3Wrap);
  sec3Row.appendChild(after3Wrap);

  sec3Row.appendChild(annCard("Root-driven bulk cascade", C.success, [
    {
      demo: demoBox(32, 20, eyeToggle("on")),
      title: "Root drives 2-cycle",
      desc: "Root has no inherited state. Click on root's cell with active selection = 2-state cycle applies. All selected rows sync to root's new value.",
    },
    {
      demo: demoBox(32, 20, eyeToggle("off")),
      title: "All rows unified",
      desc: "After click: root = overridden-off, all children = overridden-off. Mixed state eliminated in 1 click. Use case: set eye on whole subtree to off.",
    },
    {
      demo: demoBox(32, 20, txt("sel", F.m, 9, C.accent)),
      title: "Selection highlight preserved",
      desc: "Rows remain selected post-click. Accent fill 8% + 1px accent stroke at 30% opacity. Non-dashed (per Premiere-panel parity). Next click continues the cycle.",
    },
  ]));

  sec3.appendChild(sec3Row);
  root.appendChild(sec3);

  // ==================================================================
  // SECTION 4 — Bulk: children-only cycle (click child x3)
  // ==================================================================

  const sec4 = vSec(contentW);
  sec4.itemSpacing = 20;
  sec4.appendChild(sectionTitle(
    "§4 — Bulk: children-only cycle (click child × 3)",
    "4 children selected, no root. 3 clicks walk full cycle → bulk reset to inherited on click 3.",
    contentW
  ));

  const sec4Row = hSec(contentW);
  sec4Row.itemSpacing = 16;
  sec4Row.counterAxisAlignItems = "MIN";

  const MP4W = 210;

  // Helper to build one children-only state panel.
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

  // State 0 — before: mixed.
  sec4Row.appendChild(childrenPanel("BEFORE (mixed)", [
    { name: "Alpha",   eye: "inherited-on" },
    { name: "Beta",    eye: "inherited-on" },
    { name: "Gamma",   eye: "on" },
    { name: "Delta",   eye: "off" },
  ]));

  // Arrow → click 1.
  const arr4a = vHug();
  arr4a.itemSpacing = 4; arr4a.counterAxisAlignItems = "CENTER";
  arr4a.appendChild(txt(">", F.b, 14, C.borderStrong));
  arr4a.appendChild(txt("click 1", F.m, 9, C.accent, 12));
  sec4Row.appendChild(arr4a);

  // State 1 — all overridden-on.
  sec4Row.appendChild(childrenPanel("After click 1", [
    { name: "Alpha",   eye: "on" },
    { name: "Beta",    eye: "on" },
    { name: "Gamma",   eye: "on" },
    { name: "Delta",   eye: "on" },
  ]));

  // Arrow → click 2.
  const arr4b = vHug();
  arr4b.itemSpacing = 4; arr4b.counterAxisAlignItems = "CENTER";
  arr4b.appendChild(txt(">", F.b, 14, C.borderStrong));
  arr4b.appendChild(txt("click 2", F.m, 9, C.accent, 12));
  sec4Row.appendChild(arr4b);

  // State 2 — all overridden-off.
  sec4Row.appendChild(childrenPanel("After click 2", [
    { name: "Alpha",   eye: "off" },
    { name: "Beta",    eye: "off" },
    { name: "Gamma",   eye: "off" },
    { name: "Delta",   eye: "off" },
  ]));

  // Arrow → click 3.
  const arr4c = vHug();
  arr4c.itemSpacing = 4; arr4c.counterAxisAlignItems = "CENTER";
  arr4c.appendChild(txt(">", F.b, 14, C.borderStrong));
  arr4c.appendChild(txt("click 3", F.m, 9, C.accent, 12));
  sec4Row.appendChild(arr4c);

  // State 3 — all inherited.
  sec4Row.appendChild(childrenPanel("After click 3 (reset)", [
    { name: "Alpha",   eye: "inherited-on" },
    { name: "Beta",    eye: "inherited-on" },
    { name: "Gamma",   eye: "inherited-on" },
    { name: "Delta",   eye: "inherited-on" },
  ]));

  sec4Row.appendChild(annCard("Children-only bulk cycle", C.amber, [
    {
      demo: demoBox(32, 20, txt("3x", F.b, 12, C.amber)),
      title: "3 clicks = bulk reset to inherited",
      desc: "Children-only selection → full 3-cycle available. Click 1 unifies to overridden-on. Click 2 flips to off. Click 3 unpins all → inherited. Clicked cell determines the cycle path; others follow as capable.",
    },
    {
      demo: demoBox(32, 20, eyeToggle("inherited-on")),
      title: "Inherited after reset",
      desc: "Click 3 deletes stored overrides. All children re-adopt parent cascade value. If parent is on, all show inherited-on (dim). Effective value consistent with cascade.",
    },
  ], 380));

  sec4.appendChild(sec4Row);
  root.appendChild(sec4);

  // ==================================================================
  // SECTION 4b — Bulk: mixed root + children, click on child cell
  // Demonstrates "follow as capable, pass when can't" rule.
  // ==================================================================

  const sec4b = vSec(contentW);
  sec4b.itemSpacing = 20;
  sec4b.appendChild(sectionTitle(
    "§4b — Bulk: mixed root + children, click child cell",
    "Root in selection. 3 clicks on child cell → children walk full cycle; root follows as capable, HOLDS at overridden step when child reaches inherited (physics: root has no parent to inherit from). Effective value stays consistent across rows.",
    contentW
  ));

  const sec4bRow = hSec(contentW);
  sec4bRow.itemSpacing = 16;
  sec4bRow.counterAxisAlignItems = "MIN";

  // Helper: mixed panel — 1 root row + N children rows, all selected.
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

  // BEFORE: root overridden-on, children mixed.
  sec4bRow.appendChild(mixedPanel("BEFORE (mixed)",
    { name: "Projects", eye: "on" },
    [
      { name: "Alpha", eye: "inherited-on" },
      { name: "Beta",  eye: "inherited-on" },
      { name: "Gamma", eye: "off" },
    ]
  ));

  const arr4ba = vHug();
  arr4ba.itemSpacing = 4; arr4ba.counterAxisAlignItems = "CENTER";
  arr4ba.appendChild(txt(">", F.b, 14, C.borderStrong));
  arr4ba.appendChild(txt("click 1", F.m, 9, C.accent, 12));
  sec4bRow.appendChild(arr4ba);

  // After click 1 on child → all overridden-on. Root stays at overridden-on (unchanged).
  sec4bRow.appendChild(mixedPanel("After click 1",
    { name: "Projects", eye: "on" },
    [
      { name: "Alpha", eye: "on" },
      { name: "Beta",  eye: "on" },
      { name: "Gamma", eye: "on" },
    ]
  ));

  const arr4bb = vHug();
  arr4bb.itemSpacing = 4; arr4bb.counterAxisAlignItems = "CENTER";
  arr4bb.appendChild(txt(">", F.b, 14, C.borderStrong));
  arr4bb.appendChild(txt("click 2", F.m, 9, C.accent, 12));
  sec4bRow.appendChild(arr4bb);

  // After click 2 → all flip to overridden-off. Root matches (2-state cycle can do).
  sec4bRow.appendChild(mixedPanel("After click 2",
    { name: "Projects", eye: "off" },
    [
      { name: "Alpha", eye: "off" },
      { name: "Beta",  eye: "off" },
      { name: "Gamma", eye: "off" },
    ]
  ));

  const arr4bc = vHug();
  arr4bc.itemSpacing = 4; arr4bc.counterAxisAlignItems = "CENTER";
  arr4bc.appendChild(txt(">", F.b, 14, C.borderStrong));
  arr4bc.appendChild(txt("click 3", F.m, 9, C.accent, 12));
  sec4bRow.appendChild(arr4bc);

  // After click 3 → children → inherited-off (adopt root). Root HOLDS at overridden-off
  // (can't go inherited, no parent). Two tiers visible: root bright overridden,
  // children dim inherited. Effective value still "all off" (child inherits root's off).
  sec4bRow.appendChild(mixedPanel("After click 3 (root holds)",
    { name: "Projects", eye: "off" },
    [
      { name: "Alpha", eye: "inherited-off" },
      { name: "Beta",  eye: "inherited-off" },
      { name: "Gamma", eye: "inherited-off" },
    ]
  ));

  sec4bRow.appendChild(annCard("Mixed selection — follow / pass rule", C.amber, [
    {
      demo: demoBox(32, 20, txt("hold", F.b, 10, C.amber)),
      title: "Root holds at click 3",
      desc: "Children reach inherited step; root can't inherit (no parent cascade) → holds at its last overridden value (here: overridden-off). This is the \"pass when can't\" rule. Root stays bright (overridden tier), children dim (inherited tier) — two tiers visible side-by-side in same column.",
    },
    {
      demo: demoBox(32, 20, txt("=", F.b, 14, C.amber)),
      title: "Effective value consistent",
      desc: "At click 3: root overridden-off + children inherited-off = all rows effectively OFF. \"Inherited\" means \"adopt parent's current\" → children adopt root's overridden-off. Visual tier differs, semantic state identical.",
    },
    {
      demo: demoBox(32, 20, txt("vs §3", F.b, 10, C.amber)),
      title: "Click on root vs click on child",
      desc: "Clicking ROOT cell (§3) triggers 2-state cycle — children follow, all stay in overridden tier, never reach inherited. Clicking CHILD cell (this §4b) triggers 3-state cycle — children can reach inherited, root holds. Clicked-cell state-space determines cycle depth.",
    },
  ], 380));

  sec4b.appendChild(sec4bRow);
  root.appendChild(sec4b);

  // ==================================================================
  // SECTION 5 — Asymmetry tooltips
  // ==================================================================

  const sec6 = vSec(contentW);
  sec6.itemSpacing = 20;
  sec6.appendChild(sectionTitle(
    "§5 — Asymmetry tooltips (first-hover education)",
    "Mixed selection triggers variant tooltips. Root cell vs child cell show different text. Standard hover elsewhere.",
    contentW
  ));

  const sec6Row = hSec(contentW);
  sec6Row.itemSpacing = 48;
  sec6Row.counterAxisAlignItems = "MIN";

  const tooltipDemos = hSec(700);
  tooltipDemos.itemSpacing = 48;
  tooltipDemos.counterAxisAlignItems = "MIN";

  // Root tooltip demo.
  const rootTipWrap = vSec(300);
  rootTipWrap.itemSpacing = 8;
  rootTipWrap.appendChild(txt("Root's eye cell", F.s, 12, C.text));

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

  // Child tooltip demo.
  const childTipWrap = vSec(320);
  childTipWrap.itemSpacing = 8;
  childTipWrap.appendChild(txt("Child's eye cell", F.s, 12, C.text));

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

  sec6Row.appendChild(tooltipDemos);

  sec6Row.appendChild(annCard("Asymmetric tooltips — physics education", C.labelRose, [
    {
      demo: demoBox(32, 20, eyeToggle("on")),
      title: "Root cell hover (mixed selection)",
      desc: "\"Toggle (root — no inherited state)\". Educates that this is a 2-cycle, not a bug. Root state-space is smaller by physics, not design choice.",
    },
    {
      demo: demoBox(32, 20, eyeToggle("inherited-on")),
      title: "Child cell hover (mixed selection)",
      desc: "\"Cycle: pin · toggle · reset. Selected roots hold at last value.\" Two lines. Explains the asymmetry and what happens to roots at the inherited step (they hold, not cycle backward).",
    },
    {
      demo: demoBox(32, 20, txt("std", F.m, 9, C.textDim)),
      title: "Standard tooltip elsewhere",
      desc: "Single-type selection (roots only or children only) shows simple column name or action description. Mixed-selection variant tooltips appear only when the asymmetry is relevant.",
    },
  ]));

  sec6.appendChild(sec6Row);
  root.appendChild(sec6);

  // ================================================================
  // Finalize
  // ================================================================

  root.x = 100;
  root.y = 100;
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("SheepDog Tier Cycle v1 — done");
}

main();
