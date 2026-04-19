// SheepDog — Panel v1 Concept Mockup for Figma Scripter
// Paste into Scripter plugin in Figma.
// Builds a Premiere/Media Encoder-style mockup of the panel described in
// "v1 Panel Architecture Concept.md" — main layout, row states, progress panel variants,
// and annotations for the state dot / inheritance / safety cover semantics.

async function main() {
  // ---------- Fonts ----------
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Italic" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // ---------- Constants ----------
  const DOC_W = 1640;
  const PAD = 40;
  const PANEL_W = 940;
  const ANN_W = 540;

  // Row column widths (sum + itemSpacing must fit inside panel content area)
  const COL = {
    ST: 14,
    TREE: 14,
    NAME: 170,
    PATH: 256,
    SUB: 32,
    REL: 32,
    SEQ: 32,
    FLT: 32,
    LABEL: 52,
    ACT: 118,
    RM: 22,
  };
  const ROW_GAP = 8;
  const ROW_PAD = 12;
  const ROW_H = 30;

  // ---------- Colors (Premiere / Media Encoder dark theme) ----------
  const C = {
    canvas:    { r: 0.08, g: 0.08, b: 0.09 },       // doc bg
    panel:     { r: 0.145, g: 0.145, b: 0.155 },    // main panel bg
    panelAlt:  { r: 0.175, g: 0.175, b: 0.185 },    // row alt / header bar
    panelHi:   { r: 0.21, g: 0.21, b: 0.22 },       // hover / selected
    border:    { r: 0.30, g: 0.30, b: 0.32 },       // 1px divider
    borderStrong: { r: 0.42, g: 0.42, b: 0.44 },

    text:      { r: 0.87, g: 0.87, b: 0.88 },       // primary body
    textDim:   { r: 0.60, g: 0.60, b: 0.63 },       // muted
    textFade:  { r: 0.42, g: 0.42, b: 0.45 },       // inherited/disabled

    accent:    { r: 0.08, g: 0.47, b: 0.95 },       // Adobe blue
    accentSoft:{ r: 0.08, g: 0.47, b: 0.95 },       // same hue, used at low opacity
    success:   { r: 0.36, g: 0.78, b: 0.30 },       // green
    danger:    { r: 0.96, g: 0.32, b: 0.38 },       // pink-red
    amber:     { r: 0.94, g: 0.69, b: 0.22 },       // scan / warn
    white:     { r: 1, g: 1, b: 1 },

    // Premiere-style color labels
    labelViolet:   { r: 0.55, g: 0.40, b: 0.95 },
    labelIris:     { r: 0.40, g: 0.50, b: 0.95 },
    labelCerulean: { r: 0.30, g: 0.70, b: 0.95 },
    labelForest:   { r: 0.30, g: 0.65, b: 0.40 },
    labelRose:     { r: 0.95, g: 0.45, b: 0.70 },
    labelMango:    { r: 0.96, g: 0.58, b: 0.22 },
  };

  const F = {
    r:  { family: "Inter", style: "Regular" },
    i:  { family: "Inter", style: "Italic" },
    m:  { family: "Inter", style: "Medium" },
    s:  { family: "Inter", style: "Semi Bold" },
    b:  { family: "Inter", style: "Bold" },
  };

  // ---------- Helpers ----------
  function setFill(node, color, opacity) {
    node.fills = [{ type: "SOLID", color, opacity: opacity != null ? opacity : 1 }];
  }
  function setStroke(node, color, opacity, weight) {
    node.strokes = [{ type: "SOLID", color, opacity: opacity != null ? opacity : 1 }];
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

  // FIXED-size circular dot (for STATE column)
  function stateDot(color, opacity, hollow) {
    const f = figma.createFrame();
    f.resize(10, 10);
    f.cornerRadius = 5;
    if (hollow) {
      f.fills = [];
      setStroke(f, color, opacity != null ? opacity : 1, 1.5);
    } else {
      setFill(f, color, opacity != null ? opacity : 1);
    }
    return f;
  }

  // STATE column cell — centers a dot in a fixed-width, fixed-height column
  function stateCell(dotNode) {
    const f = figma.createFrame();
    f.resize(COL.ST, ROW_H);
    f.fills = [];
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = "CENTER";
    f.counterAxisAlignItems = "CENTER";
    f.appendChild(dotNode);
    return f;
  }

  // TREE column cell — arrow glyph centered
  function treeCell(glyph, color, visible) {
    const f = figma.createFrame();
    f.resize(COL.TREE, ROW_H);
    f.fills = [];
    f.layoutMode = "HORIZONTAL";
    f.layoutSizingHorizontal = "FIXED";
    f.layoutSizingVertical = "FIXED";
    f.primaryAxisAlignItems = "CENTER";
    f.counterAxisAlignItems = "CENTER";
    if (visible !== false && glyph) {
      f.appendChild(txt(glyph, F.m, 11, color || C.textDim));
    }
    return f;
  }

  // Checkbox — square 14x14
  // variant: "on" | "off" | "inherited-on" | "inherited-off" | "cover" | "disabled"
  function checkbox(variant) {
    const f = figma.createFrame();
    f.resize(14, 14);
    f.cornerRadius = 3;
    if (variant === "on") {
      setFill(f, C.accent, 1);
      setStroke(f, C.accent, 1, 1);
      // tick — use text glyph
      f.layoutMode = "HORIZONTAL";
      f.layoutSizingHorizontal = "FIXED";
      f.layoutSizingVertical = "FIXED";
      f.primaryAxisAlignItems = "CENTER";
      f.counterAxisAlignItems = "CENTER";
      f.appendChild(txt("✓", F.b, 10, C.white));
    } else if (variant === "off") {
      f.fills = [];
      setStroke(f, C.borderStrong, 1, 1);
    } else if (variant === "inherited-on") {
      setFill(f, C.accent, 0.35);
      setStroke(f, C.accent, 0.45, 1);
      f.layoutMode = "HORIZONTAL";
      f.layoutSizingHorizontal = "FIXED";
      f.layoutSizingVertical = "FIXED";
      f.primaryAxisAlignItems = "CENTER";
      f.counterAxisAlignItems = "CENTER";
      f.appendChild(txt("✓", F.m, 9, C.white, undefined, undefined));
    } else if (variant === "inherited-off") {
      f.fills = [];
      setStroke(f, C.borderStrong, 0.45, 1);
    } else if (variant === "cover") {
      // safety cover — darker with lock glyph
      setFill(f, C.amber, 0.25);
      setStroke(f, C.amber, 0.8, 1);
      f.layoutMode = "HORIZONTAL";
      f.layoutSizingHorizontal = "FIXED";
      f.layoutSizingVertical = "FIXED";
      f.primaryAxisAlignItems = "CENTER";
      f.counterAxisAlignItems = "CENTER";
      f.appendChild(txt("🔒", F.r, 8, C.amber));
    } else if (variant === "disabled") {
      f.fills = [];
      setStroke(f, C.textFade, 0.5, 1);
    }
    return f;
  }

  // Column cell wrapper (FIXED width, vertically centered)
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

  // Label picker — filled circle or hollow when null
  function labelDot(color) {
    const f = figma.createFrame();
    f.resize(12, 12);
    f.cornerRadius = 6;
    if (color) {
      setFill(f, color, 1);
    } else {
      f.fills = [];
      setStroke(f, C.textDim, 0.7, 1);
    }
    return f;
  }

  // Action icon (single glyph in a 22x22 square)
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
    f.appendChild(txt(glyph, F.m, 12, color || C.text, undefined, undefined));
    if (opacity != null) f.opacity = opacity;
    return f;
  }

  function actionIconHighlight(glyph, color) {
    const f = actionIcon(glyph, color);
    setFill(f, color, 0.15);
    setStroke(f, color, 0.5, 1);
    return f;
  }

  // Button (filled)
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
    f.appendChild(txt(label, F.m, 12, C.text));
    return f;
  }

  // Header toggle (on/off pill, Adobe-style)
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

  // ---------- ROW BUILDER ----------
  // Row config:
  //   indent: px
  //   state: "ok" | "missing" | "scanning" | "disabled" | "eye-closed"
  //   tree: "expanded" | "collapsed" | "leaf" | "virtual" (no arrow)
  //   name: string
  //   path: string
  //   sub,rel,seq,flt: "on"|"off"|"inherited-on"|"inherited-off"|"cover"|"disabled"
  //   label: color or null
  //   labelInherited: bool
  //   actions: array of { glyph, color?, highlight?, opacity? }
  //   remove: bool
  //   rowFill: "normal" | "alt" | "lost" | "hover"
  //   nameItalic: bool
  //   nameColor: override
  //   pathColor: override
  function row(cfg) {
    const r = hSec(PANEL_W - 2 * ROW_PAD);
    r.paddingTop = 0; r.paddingBottom = 0;
    r.paddingLeft = 0; r.paddingRight = 0;
    r.itemSpacing = ROW_GAP;
    r.counterAxisAlignItems = "CENTER";

    // Outer row wrap to allow bg + padding + border for path-lost
    const wrap = hSec(PANEL_W);
    wrap.paddingLeft = ROW_PAD; wrap.paddingRight = ROW_PAD;
    wrap.paddingTop = 0; wrap.paddingBottom = 0;
    wrap.itemSpacing = 0;
    wrap.counterAxisAlignItems = "CENTER";
    if (cfg.rowFill === "alt") setFill(wrap, C.panelAlt, 1);
    else if (cfg.rowFill === "lost") {
      setFill(wrap, C.danger, 0.08);
      setStroke(wrap, C.danger, 0.55, 1);
    } else if (cfg.rowFill === "hover") setFill(wrap, C.panelHi, 1);
    else wrap.fills = [];

    // ST dot
    let dotNode;
    if (cfg.state === "ok")            dotNode = stateDot(C.success, 1, false);
    else if (cfg.state === "missing")  dotNode = stateDot(C.danger, 1, false);
    else if (cfg.state === "scanning") dotNode = stateDot(C.amber, 1, true); // hollow as "scanning ring"
    else if (cfg.state === "disabled") dotNode = stateDot(C.textFade, 1, false);
    else if (cfg.state === "eye-closed") dotNode = stateDot(C.textDim, 1, true);
    else dotNode = stateDot(C.textDim, 0.3, true);
    r.appendChild(stateCell(dotNode));

    // TREE arrow
    let glyph = null, treeColor = C.textDim;
    if (cfg.tree === "expanded") glyph = "⌄";
    else if (cfg.tree === "collapsed") glyph = "›";
    else if (cfg.tree === "virtual") glyph = "›";
    r.appendChild(treeCell(glyph, treeColor, cfg.tree !== "leaf"));

    // NAME — may include indent spacer in front
    const nameBox = cell(COL.NAME, null, "MIN");
    const nameInner = hHug();
    nameInner.itemSpacing = 0;
    nameInner.counterAxisAlignItems = "CENTER";
    if (cfg.indent) nameInner.appendChild(spacer(cfg.indent, 1));
    const nameFont = cfg.nameItalic ? F.i : F.m;
    const nameColor = cfg.nameColor || (cfg.state === "disabled" ? C.textFade : C.text);
    nameInner.appendChild(txt(cfg.name, nameFont, 12, nameColor));
    nameBox.appendChild(nameInner);
    r.appendChild(nameBox);

    // PATH
    const pathBox = cell(COL.PATH, null, "MIN");
    const pathColor = cfg.pathColor || (cfg.state === "missing" ? C.danger : C.textDim);
    const pathFont = cfg.pathItalic ? F.i : F.r;
    const pathInner = hHug();
    pathInner.itemSpacing = 4;
    pathInner.counterAxisAlignItems = "CENTER";
    if (cfg.state === "missing") pathInner.appendChild(txt("⚠", F.b, 11, C.danger));
    pathInner.appendChild(txt(cfg.path, pathFont, 11, pathColor));
    pathBox.appendChild(pathInner);
    r.appendChild(pathBox);

    // SUB / REL / SEQ / FLT
    r.appendChild(cell(COL.SUB, checkbox(cfg.sub)));
    r.appendChild(cell(COL.REL, checkbox(cfg.rel)));
    r.appendChild(cell(COL.SEQ, checkbox(cfg.seq)));
    r.appendChild(cell(COL.FLT, checkbox(cfg.flt)));

    // LABEL
    const labelBox = cell(COL.LABEL, labelDot(cfg.label));
    if (cfg.labelInherited) labelBox.children[0].opacity = 0.4;
    r.appendChild(labelBox);

    // ACTIONS
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

    // REMOVE
    let rmGlyph = cfg.remove === false ? "" : "×";
    const rmText = txt(rmGlyph, F.r, 14, C.textDim);
    r.appendChild(cell(COL.RM, rmGlyph ? rmText : null));

    wrap.appendChild(r);
    return wrap;
  }

  // Column header cell
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

  function columnHeaderBar() {
    const wrap = hSec(PANEL_W);
    wrap.paddingLeft = ROW_PAD; wrap.paddingRight = ROW_PAD;
    wrap.paddingTop = 6; wrap.paddingBottom = 6;
    wrap.itemSpacing = ROW_GAP;
    wrap.counterAxisAlignItems = "CENTER";
    setFill(wrap, C.panelAlt, 1);

    wrap.appendChild(colHeaderCell(COL.ST, "", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.TREE, "", "CENTER"));
    const nameHeader = colHeaderCell(COL.NAME, "NAME  ↑", "MIN", C.accent);
    wrap.appendChild(nameHeader);
    wrap.appendChild(colHeaderCell(COL.PATH, "PATH", "MIN"));
    wrap.appendChild(colHeaderCell(COL.SUB, "SUB", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.REL, "REL", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.SEQ, "SEQ", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.FLT, "FLT", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.LABEL, "LABEL", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.ACT, "ACTIONS", "MIN"));
    wrap.appendChild(colHeaderCell(COL.RM, "", "CENTER"));
    return wrap;
  }

  // Panel top header (logo / search / Auto Sync / Check&Import / ⚙)
  function panelHeader() {
    const wrap = hSec(PANEL_W);
    wrap.paddingLeft = 14; wrap.paddingRight = 14;
    wrap.paddingTop = 10; wrap.paddingBottom = 10;
    wrap.itemSpacing = 12;
    wrap.counterAxisAlignItems = "CENTER";
    setFill(wrap, C.panel, 1);

    // Logo + title
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
    logoDot.appendChild(txt("🐑", F.r, 10, C.white));
    logoBox.appendChild(logoDot);
    logoBox.appendChild(txt("SheepDog", F.b, 13, C.text));
    wrap.appendChild(logoBox);

    // Search box
    const searchBox = hSec(220);
    searchBox.paddingLeft = 10; searchBox.paddingRight = 10;
    searchBox.paddingTop = 6; searchBox.paddingBottom = 6;
    searchBox.itemSpacing = 8;
    searchBox.cornerRadius = 4;
    searchBox.counterAxisAlignItems = "CENTER";
    setFill(searchBox, C.canvas, 1);
    setStroke(searchBox, C.border, 1, 1);
    searchBox.appendChild(txt("🔍", F.r, 11, C.textDim));
    searchBox.appendChild(txt("Search watch folders…", F.r, 11, C.textFade));
    wrap.appendChild(searchBox);

    // flex spacer
    wrap.appendChild(spacer(1, 1));
    wrap.children[wrap.children.length - 1].layoutGrow = 1;

    // Auto Sync toggle
    const asBox = hHug();
    asBox.itemSpacing = 6;
    asBox.counterAxisAlignItems = "CENTER";
    asBox.appendChild(txt("Auto Sync", F.m, 11, C.text));
    asBox.appendChild(toggle(true));
    wrap.appendChild(asBox);

    wrap.appendChild(btnPrimary("Check & Import"));
    wrap.appendChild(actionIcon("⚙", C.text));
    return wrap;
  }

  // Progress panel (variant: "collapsed" | "expanded-idle" | "active")
  function progressPanel(variant) {
    const p = vSec(PANEL_W);
    p.paddingLeft = 14; p.paddingRight = 14;
    p.paddingTop = 10; p.paddingBottom = 10;
    p.itemSpacing = 8;
    setFill(p, C.panelAlt, 1);

    // Header line
    const head = hSec(PANEL_W - 28);
    head.itemSpacing = 8;
    head.counterAxisAlignItems = "CENTER";
    const caret = txt(variant === "collapsed" ? "›" : "⌄", F.m, 13, C.textDim);
    head.appendChild(caret);
    if (variant === "collapsed") {
      head.appendChild(txt("Progress — idle", F.s, 12, C.text));
      head.appendChild(txt("·", F.r, 11, C.textDim));
      head.appendChild(txt("last: 148 imported / 7 skipped · 2m ago", F.r, 11, C.textDim));
    } else if (variant === "expanded-idle") {
      head.appendChild(txt("Progress — idle", F.s, 12, C.text));
    } else {
      head.appendChild(txt("Progress — Check & Import running", F.s, 12, C.text));
      head.appendChild(spacer(1, 1)); head.children[head.children.length - 1].layoutGrow = 1;
      head.appendChild(txt("[Cancel]", F.m, 11, C.danger));
    }
    p.appendChild(head);

    if (variant === "collapsed") return p;

    if (variant === "expanded-idle") {
      p.appendChild(txt("Last run: 2026-04-19 14:22 · 148 imported / 7 skipped / 0 errors", F.r, 11, C.textDim));
      p.appendChild(txt('Last chunk: bin "03_Assets/01_Video" · 5 files · 3.2s', F.r, 11, C.textDim));
      p.appendChild(txt("Next auto-sync: in 2s (Auto Sync ON)", F.r, 11, C.textDim));
      return p;
    }

    // active
    // overall bar
    const barWrap = vSec(PANEL_W - 28);
    barWrap.itemSpacing = 4;
    const barLabel = hSec(PANEL_W - 28);
    barLabel.itemSpacing = 8;
    barLabel.counterAxisAlignItems = "CENTER";
    barLabel.appendChild(txt("Overall", F.m, 11, C.text));
    barLabel.appendChild(spacer(1, 1)); barLabel.children[barLabel.children.length - 1].layoutGrow = 1;
    barLabel.appendChild(txt("68% · 7/10 chunks · 102/148 files", F.r, 11, C.textDim));
    barWrap.appendChild(barLabel);

    const barTrack = hSec(PANEL_W - 28);
    barTrack.fills = [];
    barTrack.resize(PANEL_W - 28, 6);
    const track = figma.createFrame();
    track.resize(PANEL_W - 28, 6);
    track.cornerRadius = 3;
    setFill(track, C.canvas, 1);
    const fill = figma.createFrame();
    fill.resize(Math.round((PANEL_W - 28) * 0.68), 6);
    fill.cornerRadius = 3;
    setFill(fill, C.accent, 1);
    track.appendChild(fill);
    barWrap.appendChild(track);
    p.appendChild(barWrap);

    // per-chunk lines
    function chunkLine(glyph, label, status, color) {
      const h = hSec(PANEL_W - 28);
      h.itemSpacing = 8;
      h.counterAxisAlignItems = "CENTER";
      h.appendChild(txt(glyph, F.r, 11, C.textDim));
      h.appendChild(txt(label, F.r, 11, C.text));
      h.appendChild(spacer(1, 1)); h.children[h.children.length - 1].layoutGrow = 1;
      h.appendChild(txt(status, F.r, 11, color || C.textDim));
      return h;
    }
    p.appendChild(chunkLine("▸", 'bin "03_Assets/01_Video"', "5/5 done  ✓", C.success));
    p.appendChild(chunkLine("▸", 'bin "03_Assets/02_Image"', "8/8 done  ✓", C.success));
    p.appendChild(chunkLine("▸", 'bin "03_Assets/03_Image_Sequences"', "scanning…", C.amber));
    return p;
  }

  // Footer
  function footer(label) {
    const f = hSec(PANEL_W);
    f.paddingLeft = 14; f.paddingRight = 14;
    f.paddingTop = 8; f.paddingBottom = 8;
    f.itemSpacing = 10;
    f.counterAxisAlignItems = "CENTER";
    setFill(f, C.panel, 1);
    f.appendChild(txt("status:", F.r, 11, C.textDim));
    f.appendChild(txt(label || "Ready", F.m, 11, C.text));
    f.appendChild(spacer(1, 1)); f.children[f.children.length - 1].layoutGrow = 1;
    f.appendChild(btnGhost("Save log"));
    return f;
  }

  // ---------- BUILD DOCUMENT ----------

  const root = figma.createFrame();
  root.name = "SheepDog — Panel v1 Concept";
  root.resize(DOC_W, 10);
  root.layoutMode = "VERTICAL";
  root.layoutSizingHorizontal = "FIXED";
  root.layoutSizingVertical = "HUG";
  setFill(root, C.canvas, 1);
  root.paddingTop = PAD; root.paddingBottom = PAD;
  root.paddingLeft = PAD; root.paddingRight = PAD;
  root.itemSpacing = 48;

  const contentW = DOC_W - 2 * PAD;

  // TITLE
  const titleSec = vSec(contentW);
  titleSec.itemSpacing = 8;
  titleSec.appendChild(txt("SheepDog — Panel v1 Concept", F.b, 36, C.white, 44, 1));
  titleSec.appendChild(txt("Premiere-style columnar tree-view · mockup for Figma review", F.r, 14, C.textDim, 20));
  titleSec.appendChild(divider(contentW, C.white, 0.08));
  root.appendChild(titleSec);

  // ==================================================
  // SECTION 1 — MAIN PANEL (idle, with tree)
  // Layout: panel on the left + annotations column on the right
  // ==================================================
  const s1 = vSec(contentW);
  s1.itemSpacing = 16;
  s1.appendChild(sectionTitle("1. Main panel — idle state", "Tree expanded · mix of inherited / overridden rows · one missing path · one scanning", contentW));

  const s1Row = hSec(contentW);
  s1Row.itemSpacing = 40;
  s1Row.counterAxisAlignItems = "MIN";

  // ---- Main panel mockup ----
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

  // Rows — representative tree
  const treeRows = [
    // Root 1 — 03_Assets expanded
    {
      indent: 0, state: "ok", tree: "expanded",
      name: "03_Assets", path: "E:/Projects/2026/FILM/03_Assets",
      sub: "on", rel: "off", seq: "off", flt: "off",
      label: C.labelCerulean,
      actions: [
        { glyph: "↻", color: C.text },
        { glyph: "⌕", color: C.text },
        { glyph: "🧲", color: C.text },
        { glyph: "👁", color: C.text },
      ],
    },
    // Child — 01_Video, expanded, inherited sub/rel, own SEQ=on (override)
    {
      indent: 18, state: "ok", tree: "expanded",
      name: "01_Video", path: "…/03_Assets/01_Video",
      sub: "inherited-on", rel: "inherited-off", seq: "on", flt: "inherited-off",
      label: null, labelInherited: true,
      actions: [
        { glyph: "↻", color: C.text, opacity: 0.6 },
        { glyph: "⌕", color: C.text, opacity: 0.6 },
        { glyph: "🧲", color: C.text, opacity: 0.6 },
        { glyph: "👁", color: C.text, opacity: 0.6 },
      ],
      rowFill: "alt",
    },
    // Virtual grandchild — RAW (subfolder on disk, no record)
    {
      indent: 36, state: "ok", tree: "virtual",
      name: "RAW", path: "…/01_Video/RAW",
      sub: "inherited-on", rel: "inherited-off", seq: "inherited-on", flt: "inherited-off",
      label: null, labelInherited: true,
      nameItalic: true, nameColor: C.textDim, pathItalic: true,
      actions: [
        { glyph: "↻", color: C.text, opacity: 0.35 },
        { glyph: "⌕", color: C.text, opacity: 0.35 },
        { glyph: "🧲", color: C.text, opacity: 0.35 },
        { glyph: "👁", color: C.text, opacity: 0.35 },
      ],
      remove: false,
    },
    // Child — 02_Image, collapsed, FLT override ON with safety cover closed
    {
      indent: 18, state: "ok", tree: "collapsed",
      name: "02_Image", path: "…/03_Assets/02_Image",
      sub: "inherited-on", rel: "inherited-off", seq: "inherited-off", flt: "cover",
      label: C.labelForest,
      actions: [
        { glyph: "↻", color: C.text },
        { glyph: "⌕", color: C.text },
        { glyph: "🧲", color: C.text },
        { glyph: "👁", color: C.text },
      ],
      rowFill: "alt",
    },
    // Child — 03_Archive, MISSING PATH
    {
      indent: 18, state: "missing", tree: "leaf",
      name: "03_Archive", path: "…/03_Assets/03_Archive",
      sub: "inherited-on", rel: "inherited-off", seq: "inherited-off", flt: "inherited-off",
      label: null, labelInherited: true,
      actions: [
        { glyph: "↻", color: C.text, opacity: 0.4 },
        { glyph: "⌕", color: C.accent, highlight: true },
        { glyph: "🧲", color: C.text, opacity: 0.4 },
        { glyph: "👁", color: C.text, opacity: 0.4 },
      ],
      rowFill: "lost",
    },
    // Root 2 — day_02, SCANNING
    {
      indent: 0, state: "scanning", tree: "collapsed",
      name: "day_02", path: "D:/Shoots/2026/04/day_02",
      sub: "on", rel: "off", seq: "off", flt: "off",
      label: C.labelMango,
      actions: [
        { glyph: "↻", color: C.amber, highlight: true },
        { glyph: "⌕", color: C.text },
        { glyph: "🧲", color: C.text },
        { glyph: "👁", color: C.text },
      ],
    },
    // Root 3 — ref, EYE CLOSED (auto-watch off)
    {
      indent: 0, state: "eye-closed", tree: "collapsed",
      name: "ref", path: "E:/REFLIB/CGI",
      sub: "on", rel: "on", seq: "off", flt: "off",
      label: C.labelViolet,
      actions: [
        { glyph: "↻", color: C.text },
        { glyph: "⌕", color: C.text },
        { glyph: "🧲", color: C.text },
        { glyph: "👁", color: C.textDim, opacity: 0.8 },
      ],
      rowFill: "alt",
    },
    // Root 4 — _old, DISABLED
    {
      indent: 0, state: "disabled", tree: "leaf",
      name: "_old_backup", path: "E:/archive/2024/FILM_old",
      sub: "disabled", rel: "disabled", seq: "disabled", flt: "disabled",
      label: null, labelInherited: true,
      nameColor: C.textFade,
      actions: [
        { glyph: "↻", color: C.text, opacity: 0.3 },
        { glyph: "⌕", color: C.text, opacity: 0.3 },
        { glyph: "🧲", color: C.text, opacity: 0.3 },
        { glyph: "👁", color: C.text, opacity: 0.3 },
      ],
    },
  ];
  for (const cfg of treeRows) {
    const rr = row(cfg);
    panel.appendChild(rr);
    // thin row divider
    const rdiv = divider(PANEL_W, C.border, 0.4);
    panel.appendChild(rdiv);
  }

  // Progress collapsed + footer
  panel.appendChild(progressPanel("collapsed"));
  panel.appendChild(divider(PANEL_W, C.border, 1));
  panel.appendChild(footer("Watching 4 folders · Auto Sync ON"));

  s1Row.appendChild(panel);

  // ---- Annotations column ----
  const ann = vSec(ANN_W);
  ann.itemSpacing = 20;

  function annCard(title, color, rows) {
    const card = vSec(ANN_W);
    card.cornerRadius = 8;
    setFill(card, C.panel, 1);
    setStroke(card, color, 0.35, 1);
    card.paddingTop = 14; card.paddingBottom = 14;
    card.paddingLeft = 16; card.paddingRight = 16;
    card.itemSpacing = 10;

    const head = hHug();
    head.itemSpacing = 10;
    head.counterAxisAlignItems = "CENTER";
    const chip = figma.createFrame();
    chip.resize(6, 6); chip.cornerRadius = 3;
    setFill(chip, color, 1);
    head.appendChild(chip);
    head.appendChild(txt(title, F.s, 12, C.white, undefined, 0.5));
    card.appendChild(head);

    for (const rw of rows) {
      const line = hSec(ANN_W - 32);
      line.itemSpacing = 10;
      line.counterAxisAlignItems = "MIN";
      // glyph/demo node
      const g = rw.demo;
      line.appendChild(g);
      // text
      const tx = vSec(ANN_W - 32 - 34);
      tx.itemSpacing = 2;
      tx.appendChild(txt(rw.title, F.s, 11, C.text));
      tx.appendChild(txtW(rw.desc, F.r, 11, C.textDim, ANN_W - 32 - 34, 16));
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

  // State dot legend
  ann.appendChild(annCard("STATE dot · priority top→bottom wins", C.accent, [
    { demo: demoBox(24, 18, stateDot(C.textFade, 1, false)),
      title: "Disabled",
      desc: "Row enabled=false. Whole row is paused; nothing runs." },
    { demo: demoBox(24, 18, stateDot(C.danger, 1, false)),
      title: "Missing path",
      desc: "Folder on disk doesn't exist. Row gets red border + faint danger backdrop. ⌕ Relink is highlighted." },
    { demo: demoBox(24, 18, stateDot(C.amber, 1, true)),
      title: "Scanning",
      desc: "Active scan/import running for this folder. Row's ↻ action is highlighted." },
    { demo: demoBox(24, 18, stateDot(C.textDim, 1, true)),
      title: "Eye closed",
      desc: "Per-folder auto-watch off (globally Auto Sync is still ON, this folder is ignored)." },
    { demo: demoBox(24, 18, stateDot(C.success, 1, false)),
      title: "Idle OK",
      desc: "Default green. Watcher is live, path resolved, nothing pending." },
  ]));

  // Checkbox variants
  ann.appendChild(annCard("Checkbox variants — inheritance visible at a glance", C.success, [
    { demo: demoBox(24, 18, checkbox("on")),
      title: "Overridden ON",
      desc: "User explicitly ticked it. Solid fill. Wins over parent setting." },
    { demo: demoBox(24, 18, checkbox("off")),
      title: "Overridden OFF",
      desc: "User explicitly unticked. Solid outline. Wins over parent." },
    { demo: demoBox(24, 18, checkbox("inherited-on")),
      title: "Inherited ON",
      desc: "Value flows from nearest ancestor row with an override. Faded 35% opacity." },
    { demo: demoBox(24, 18, checkbox("inherited-off")),
      title: "Inherited OFF",
      desc: "Same, from ancestor OFF. Faded outline." },
    { demo: demoBox(24, 18, checkbox("cover")),
      title: "Safety cover (locked)",
      desc: "Amber padlock. Click once → unlocks (4s timer). Click again within 4s → applies. Only one cover unlocked at a time." },
    { demo: demoBox(24, 18, checkbox("disabled")),
      title: "Disabled (row off)",
      desc: "Row's enabled=false greys out all toggles. Settings remembered, not lost." },
  ]));

  // Row variants
  ann.appendChild(annCard("Row fill & text states", C.amber, [
    { demo: demoBox(24, 18, stateDot(C.text, 0.3, false)),
      title: "Alt zebra fill",
      desc: "Every other row uses a +3% brightness fill for scanning ease." },
    { demo: demoBox(24, 18, txt("Italic", F.i, 11, C.textDim)),
      title: "Virtual row",
      desc: "Subfolder seen on disk but no record in JSON. Italic + muted. One click on any control materializes it (creates record, becomes solid)." },
    { demo: demoBox(24, 18, stateDot(C.danger, 1, false)),
      title: "Path-lost row",
      desc: "Red 1px border + 8% danger backdrop. Path text turns red with ⚠ prefix. ⌕ Relink pulses." },
  ]));

  s1Row.appendChild(ann);
  s1.appendChild(s1Row);
  root.appendChild(s1);

  // ==================================================
  // SECTION 2 — Progress panel variants
  // ==================================================
  const s2 = vSec(contentW);
  s2.itemSpacing = 16;
  s2.appendChild(sectionTitle(
    "2. Progress panel — three states",
    "Media Encoder-inspired. Collapsed by default. Expands during import with chunk-level progress.",
    contentW
  ));

  const s2Row = hSec(contentW);
  s2Row.itemSpacing = 20;
  s2Row.counterAxisAlignItems = "MIN";

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

  // We'll stack three stacked vertically since each is PANEL_W wide
  const s2Stack = vSec(contentW);
  s2Stack.itemSpacing = 24;
  s2Stack.appendChild(progressWrap("collapsed", "COLLAPSED — idle default. Single line in footer area."));
  s2Stack.appendChild(progressWrap("expanded-idle", "EXPANDED IDLE — last run summary when user toggles caret open."));
  s2Stack.appendChild(progressWrap("active", "ACTIVE IMPORT — overall bar + chunk breakdown. Grows up to ~200px with own scroll."));
  root.appendChild(s2);
  root.appendChild(s2Stack);

  // ==================================================
  // SECTION 3 — Safety cover timer sequence
  // ==================================================
  const s3 = vSec(contentW);
  s3.itemSpacing = 16;
  s3.appendChild(sectionTitle(
    "3. Safety cover — 3-state + timer",
    "Applies to SUB, FLT, DEL (hidden), Gather Sheep, Danger Zone actions. REL/SEQ/👁 do NOT use cover (non-destructive).",
    contentW
  ));

  const s3Row = hSec(contentW);
  s3Row.itemSpacing = 20;
  s3Row.counterAxisAlignItems = "MIN";

  function coverStep(titleText, captionText, demo, ring) {
    const w = vSec(280);
    w.cornerRadius = 8;
    setFill(w, C.panel, 1);
    setStroke(w, C.border, 1, 1);
    w.paddingTop = 20; w.paddingBottom = 20;
    w.paddingLeft = 20; w.paddingRight = 20;
    w.itemSpacing = 12;

    const demoBoxF = figma.createFrame();
    demoBoxF.resize(240, 72);
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

    if (ring) {
      const ringBox = hHug();
      ringBox.itemSpacing = 4;
      ringBox.counterAxisAlignItems = "CENTER";
      ringBox.appendChild(txt("⏱", F.r, 10, C.amber));
      ringBox.appendChild(txt("4s timer active", F.m, 10, C.amber));
      w.appendChild(ringBox);
    }
    return w;
  }

  // Step 1: locked
  const lockedDemo = figma.createFrame();
  lockedDemo.resize(40, 40);
  lockedDemo.cornerRadius = 6;
  setFill(lockedDemo, C.amber, 0.22);
  setStroke(lockedDemo, C.amber, 0.9, 1.5);
  lockedDemo.layoutMode = "HORIZONTAL";
  lockedDemo.layoutSizingHorizontal = "FIXED";
  lockedDemo.layoutSizingVertical = "FIXED";
  lockedDemo.primaryAxisAlignItems = "CENTER";
  lockedDemo.counterAxisAlignItems = "CENTER";
  lockedDemo.appendChild(txt("🔒", F.r, 18, C.amber));
  s3Row.appendChild(coverStep(
    "1 · Locked (default)",
    "Control is sealed. One click unlocks it and starts the 4s timer.",
    lockedDemo,
    false
  ));

  // Step 2: unlocked (with countdown ring)
  const unlockedDemo = figma.createFrame();
  unlockedDemo.resize(40, 40);
  unlockedDemo.cornerRadius = 6;
  setFill(unlockedDemo, C.amber, 0.08);
  setStroke(unlockedDemo, C.amber, 1, 2);
  unlockedDemo.layoutMode = "HORIZONTAL";
  unlockedDemo.layoutSizingHorizontal = "FIXED";
  unlockedDemo.layoutSizingVertical = "FIXED";
  unlockedDemo.primaryAxisAlignItems = "CENTER";
  unlockedDemo.counterAxisAlignItems = "CENTER";
  unlockedDemo.appendChild(txt("🔓", F.r, 18, C.amber));
  s3Row.appendChild(coverStep(
    "2 · Unlocked (4s)",
    "Click again within 4 seconds to apply. Unlocking another cover re-locks this one (single-unlock rule).",
    unlockedDemo,
    true
  ));

  // Step 3: active / applied
  const activeDemo = figma.createFrame();
  activeDemo.resize(40, 40);
  activeDemo.cornerRadius = 6;
  setFill(activeDemo, C.accent, 1);
  activeDemo.layoutMode = "HORIZONTAL";
  activeDemo.layoutSizingHorizontal = "FIXED";
  activeDemo.layoutSizingVertical = "FIXED";
  activeDemo.primaryAxisAlignItems = "CENTER";
  activeDemo.counterAxisAlignItems = "CENTER";
  activeDemo.appendChild(txt("✓", F.b, 22, C.white));
  s3Row.appendChild(coverStep(
    "3 · Active (applied)",
    "Value flipped. The destructive/structural change executes. Control is now a normal solid checkbox.",
    activeDemo,
    false
  ));

  // Arrow 4: auto re-lock
  const relockDemo = figma.createFrame();
  relockDemo.resize(40, 40);
  relockDemo.cornerRadius = 6;
  setFill(relockDemo, C.amber, 0.22);
  setStroke(relockDemo, C.amber, 0.9, 1.5);
  relockDemo.layoutMode = "HORIZONTAL";
  relockDemo.layoutSizingHorizontal = "FIXED";
  relockDemo.layoutSizingVertical = "FIXED";
  relockDemo.primaryAxisAlignItems = "CENTER";
  relockDemo.counterAxisAlignItems = "CENTER";
  relockDemo.appendChild(txt("🔒", F.r, 18, C.amber));
  s3Row.appendChild(coverStep(
    "— · Auto re-lock",
    "If no second click arrives, timer expires and cover returns to state 1. Also re-locks on project reload, import start/cancel.",
    relockDemo,
    false
  ));

  s3.appendChild(s3Row);
  root.appendChild(s3);

  // ==================================================
  // SECTION 4 — FLT override model (β)
  // ==================================================
  const s4 = vSec(contentW);
  s4.itemSpacing = 16;
  s4.appendChild(sectionTitle(
    "4. FLT override model (β) — child bin nests inside parent bin",
    "Parent 03_Assets FLT=ON (flatten into own bin). Child 01_Video FLT=OFF (override). Disk→project stays 1:1.",
    contentW
  ));

  // Two mini diagrams side by side
  const s4Row = hSec(contentW);
  s4Row.itemSpacing = 40;
  s4Row.counterAxisAlignItems = "MIN";

  function treeMini(title, lines, colorAccent) {
    const box = vSec(680);
    box.cornerRadius = 8;
    setFill(box, C.panel, 1);
    setStroke(box, colorAccent, 0.4, 1);
    box.paddingTop = 18; box.paddingBottom = 18;
    box.paddingLeft = 22; box.paddingRight = 22;
    box.itemSpacing = 6;

    const head = hHug();
    head.itemSpacing = 10;
    head.counterAxisAlignItems = "CENTER";
    const chip = figma.createFrame();
    chip.resize(6, 6); chip.cornerRadius = 3;
    setFill(chip, colorAccent, 1);
    head.appendChild(chip);
    head.appendChild(txt(title, F.s, 12, C.white, undefined, 0.5));
    box.appendChild(head);
    box.appendChild(spacer(1, 6));

    for (const ln of lines) {
      const h = hSec(640);
      h.itemSpacing = 8;
      h.counterAxisAlignItems = "CENTER";
      h.appendChild(txt(ln.glyph || "  ", F.m, 11, ln.color || C.textDim));
      h.appendChild(txt(ln.text, ln.bold ? F.s : F.r, 12, ln.textColor || C.text));
      if (ln.tag) h.appendChild(txt(ln.tag, F.i, 10, ln.tagColor || C.textDim));
      box.appendChild(h);
    }
    return box;
  }

  const diskBox = treeMini("On disk", [
    { glyph: "📁", text: "03_Assets", bold: true },
    { glyph: "  📁", text: "01_Video", bold: true },
    { glyph: "    📄", text: "shot_A.mp4" },
    { glyph: "    📁", text: "RAW" },
    { glyph: "      📄", text: "take_01.mov" },
    { glyph: "  📄", text: "poster.png" },
    { glyph: "  📄", text: "notes.txt" },
  ], C.textDim);

  const projectBox = treeMini("In Premiere project (result)", [
    { glyph: "📂", text: "03_Assets", bold: true, tag: "FLT=ON (parent)", tagColor: C.success },
    { glyph: "  📄", text: "poster.png" },
    { glyph: "  📄", text: "notes.txt" },
    { glyph: "  📂", text: "01_Video", bold: true, tag: "FLT=OFF (override, β: stays nested)", tagColor: C.accent },
    { glyph: "    📄", text: "shot_A.mp4" },
    { glyph: "    📂", text: "RAW" },
    { glyph: "      📄", text: "take_01.mov" },
  ], C.accent);

  s4Row.appendChild(diskBox);
  s4Row.appendChild(projectBox);
  s4.appendChild(s4Row);

  const s4Note = txtW(
    "Rule: FLT is row-local. It controls the shape of its own bin's contents and does not reach through child rows. " +
    "Direct files of 03_Assets land flat in its bin (FLT=ON). 01_Video's own settings define its sub-structure, " +
    "and its bin lives inside 03_Assets because that's where it lives on disk — SOT = disk structure.",
    F.r, 12, C.textDim, contentW, 20
  );
  s4.appendChild(s4Note);
  root.appendChild(s4);

  // ==================================================
  // SECTION 5 — Sort & reorder (§9)
  // ==================================================
  const s5 = vSec(contentW);
  s5.itemSpacing = 16;
  s5.appendChild(sectionTitle(
    "5. Sort / reorder — ClickUp pattern",
    "No sort → drag works. Any sort → drag disabled. Tree-aware: sort applies per level, never flattens.",
    contentW
  ));

  const s5Row = hSec(contentW);
  s5Row.itemSpacing = 24;
  s5Row.counterAxisAlignItems = "MIN";

  // Sort state card
  function sortCard(title, subtitle, badge, badgeColor, enabledLabel, disabledLabel) {
    const w = vSec(560);
    w.cornerRadius = 8;
    setFill(w, C.panel, 1);
    setStroke(w, badgeColor, 0.4, 1);
    w.paddingTop = 18; w.paddingBottom = 18;
    w.paddingLeft = 22; w.paddingRight = 22;
    w.itemSpacing = 12;

    const head = hSec(520);
    head.itemSpacing = 10;
    head.counterAxisAlignItems = "CENTER";
    head.appendChild(txt(title, F.s, 13, C.white));
    const b = hHug();
    b.paddingLeft = 8; b.paddingRight = 8;
    b.paddingTop = 3; b.paddingBottom = 3;
    b.cornerRadius = 10;
    setFill(b, badgeColor, 0.18);
    b.counterAxisAlignItems = "CENTER";
    b.appendChild(txt(badge, F.s, 9, badgeColor, undefined, 0.5));
    head.appendChild(b);
    w.appendChild(head);

    w.appendChild(txtW(subtitle, F.r, 11, C.textDim, 520, 16));

    const l1 = hSec(520);
    l1.itemSpacing = 8;
    l1.counterAxisAlignItems = "CENTER";
    l1.appendChild(txt("✓", F.b, 11, C.success));
    l1.appendChild(txt(enabledLabel, F.r, 11, C.text));
    w.appendChild(l1);

    const l2 = hSec(520);
    l2.itemSpacing = 8;
    l2.counterAxisAlignItems = "CENTER";
    l2.appendChild(txt("—", F.b, 11, C.textDim));
    l2.appendChild(txt(disabledLabel, F.r, 11, C.textDim));
    w.appendChild(l2);
    return w;
  }

  s5Row.appendChild(sortCard(
    "No active sort",
    "Rows ordered by ui.order (insertion or last manual drag). User can group important projects on top manually.",
    "DRAG ENABLED", C.success,
    "Drag row up/down, order persisted in JSON",
    "Column headers show no arrow indicator"
  ));
  s5Row.appendChild(sortCard(
    "Sort by Name ↑",
    "Rules take over. activeSort = {field:'name', direction:'asc'}. Tree-aware: siblings sorted, parent-child preserved (Finder metaphor).",
    "DRAG DISABLED", C.accent,
    "Click NAME column header to toggle ↑ / ↓ / off",
    "Manual drag ignored while sort active. ui.order preserved for when sort is cleared."
  ));

  s5.appendChild(s5Row);

  const s5Table = vSec(contentW);
  s5Table.itemSpacing = 0;
  s5Table.cornerRadius = 8;
  s5Table.clipsContent = true;
  setStroke(s5Table, C.border, 1, 1);

  // Header row
  const thRow = hSec(contentW);
  thRow.paddingLeft = 16; thRow.paddingRight = 16;
  thRow.paddingTop = 10; thRow.paddingBottom = 10;
  thRow.itemSpacing = 12;
  setFill(thRow, C.panelAlt, 1);
  const th1 = cell(140, txt("FIELD", F.s, 10, C.textDim, undefined, 1), "MIN"); th1.resize(140, 20);
  const th2 = cell(240, txt("SOURCE", F.s, 10, C.textDim, undefined, 1), "MIN"); th2.resize(240, 20);
  const th3 = cell(200, txt("DIRECTION", F.s, 10, C.textDim, undefined, 1), "MIN"); th3.resize(200, 20);
  const th4 = cell(contentW - 140 - 240 - 200 - 32 - 36, txt("NOTES", F.s, 10, C.textDim, undefined, 1), "MIN");
  th4.resize(contentW - 140 - 240 - 200 - 32 - 36, 20);
  thRow.appendChild(th1); thRow.appendChild(th2); thRow.appendChild(th3); thRow.appendChild(th4);
  s5Table.appendChild(thRow);

  function sortRow(f, src, dir, note) {
    const r = hSec(contentW);
    r.paddingLeft = 16; r.paddingRight = 16;
    r.paddingTop = 10; r.paddingBottom = 10;
    r.itemSpacing = 12;
    setFill(r, C.panel, 1);
    const c1 = cell(140, txt(f, F.s, 12, C.text), "MIN"); c1.resize(140, 20);
    const c2 = cell(240, txt(src, F.r, 11, C.textDim), "MIN"); c2.resize(240, 20);
    const c3 = cell(200, txt(dir, F.r, 11, C.textDim), "MIN"); c3.resize(200, 20);
    const c4Txt = txtW(note, F.r, 11, C.textDim, contentW - 140 - 240 - 200 - 32 - 36, 16);
    const c4 = cell(contentW - 140 - 240 - 200 - 32 - 36, c4Txt, "MIN");
    c4.resize(contentW - 140 - 240 - 200 - 32 - 36, 20);
    r.appendChild(c1); r.appendChild(c2); r.appendChild(c3); r.appendChild(c4);
    return r;
  }
  s5Table.appendChild(sortRow("Name", "folder.name", "A→Z / Z→A", "Primary sort for quick navigation."));
  s5Table.appendChild(divider(contentW, C.border, 0.6));
  s5Table.appendChild(sortRow("Date added", "folder.addedAt (ISO)", "new→old / old→new", "SheepDog-owned timestamp (written at add-time). NOT fs.statSync birthtime — cross-platform unreliable."));
  s5Table.appendChild(divider(contentW, C.border, 0.6));
  s5Table.appendChild(sortRow("Path", "folder.path (resolved abs)", "A→Z / Z→A", "For users who think in file tree terms."));
  s5Table.appendChild(divider(contentW, C.border, 0.6));
  s5Table.appendChild(sortRow("State", "computed STATE dot", "problems first / ok first", "Triage: 'where's red?' — all issues rise to top in one click."));
  s5.appendChild(s5Table);
  root.appendChild(s5);

  // ==================================================
  // SECTION 6 — Legend (action icons quick ref)
  // ==================================================
  const s6 = vSec(contentW);
  s6.itemSpacing = 16;
  s6.appendChild(sectionTitle(
    "6. Actions column — icon reference",
    "Always-on per row. Hover tooltip gives the full label. No safety cover on these (reversible).",
    contentW
  ));

  const s6Row = hSec(contentW);
  s6Row.itemSpacing = 16;
  s6Row.counterAxisAlignItems = "MIN";

  function iconLegend(glyph, title, desc, color) {
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
    ic.resize(32, 32); ic.cornerRadius = 6;
    setFill(ic, color, 0.12);
    setStroke(ic, color, 0.4, 1);
    ic.layoutMode = "HORIZONTAL";
    ic.layoutSizingHorizontal = "FIXED";
    ic.layoutSizingVertical = "FIXED";
    ic.primaryAxisAlignItems = "CENTER";
    ic.counterAxisAlignItems = "CENTER";
    ic.appendChild(txt(glyph, F.m, 15, color));
    head.appendChild(ic);
    head.appendChild(txt(title, F.s, 13, C.white));
    card.appendChild(head);

    card.appendChild(txtW(desc, F.r, 11, C.textDim, 320, 16));
    return card;
  }

  s6Row.appendChild(iconLegend("↻", "Manual Sync",
    "Re-scan this folder only, import new files. Works regardless of Auto Sync global.", C.accent));
  s6Row.appendChild(iconLegend("⌕", "Relink / pick path",
    "Choose a new location for this watch folder. Used when original path moved/renamed (Missing state).", C.amber));
  s6Row.appendChild(iconLegend("🧲", "Gather Sheep",
    "Pull all imported items from this folder back into their configured bin. Safety cover protected.", C.danger));

  const s6Row2 = hSec(contentW);
  s6Row2.itemSpacing = 16;
  s6Row2.counterAxisAlignItems = "MIN";
  s6Row2.appendChild(iconLegend("👁", "Auto-watch (per-folder)",
    "Eye open = this folder participates in Auto Sync. Eye closed = still visible and manually syncable, but watcher ignores. Hidden entirely when global Auto Sync is OFF.", C.accent));
  s6Row2.appendChild(iconLegend("×", "Remove row",
    "Deletes the row from JSON. If auto-sync was active on this folder, plain confirm modal. No cover — dialog is enough.", C.textDim));
  s6Row2.appendChild(iconLegend("○ / ●", "Color label",
    "Optional Premiere color label (violet / iris / cerulean / forest / rose / mango…). Propagates to imported items' labels. Null by default (hollow dot).", C.labelCerulean));

  s6.appendChild(s6Row);
  s6.appendChild(s6Row2);
  root.appendChild(s6);

  // ---------- Position & focus ----------
  root.x = 100;
  root.y = 100;
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("SheepDog Panel v1 Concept generated");
}

main();
