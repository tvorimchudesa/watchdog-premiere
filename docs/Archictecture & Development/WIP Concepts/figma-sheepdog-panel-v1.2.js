// SheepDog — Panel v1.2 Concept Mockup for Figma Scripter
// Paste into Scripter plugin in Figma.
// Updates over v1 (2026-04-19):
//   - §1 STATE refactor: no more dedicated STATE column / dots. State lives
//     only as row-bg tint. Palette: red (missing) + amber (scanning) + calm
//     (everything else, no signal). LABEL moves to leftmost position —
//     Premiere parity + behavioral: feedback only on deviation.
//   - §3 safety cover (iter 3): padlock icon REMOVED. Literal flip-up cover
//     metaphor — matte gray fill = cover down. Unlocked = empty checkbox whose
//     OWN border drains CCW from blue → gray over 4s (VectorNode with sampled
//     rounded-rect perimeter path). Active = blue fill + ✓. Palette reduced to
//     gray + blue on controls; amber reserved for informational Migration
//     preview only.
//   - §4 FLT model: flat-override semantic. FLT=ON row stays as bin, its
//     OWN subs dissolve into it. Children inherit parent's FLT by default.
//     Explicit FLT=OFF on a child inside an FLT=ON region = anchor — survives
//     as sub-bin with its own sub-structure.
//   - FLT border states in row(): "swallowed" = dark-gray border (sub
//     dissolved by ancestor), "anchor" = accent-blue border (explicit
//     override inside flat region). State tints (red/amber) win over FLT
//     border when both would apply.
//   - §4.5 NEW: FLT UI guards — 5 mandatory helpers. Guard 4 now shows the
//     three FLT border states (swallowed vs anchor vs calm).
//   - §4.6 NEW: SUB=OFF subtree lockout. No subs watched → no bins → all
//     descendant controls (SUB/REL/SEQ/FLT) rendered as inherited-off,
//     NAME/PATH dimmed to textFade. row() supports cfg.subLocked that cascades
//     the dim. Parent keeps its SUB checkbox active (SOT, toggleable).
//   - §4.7 NEW (2026-04-20): DEL column. Danger-zone opt-in, never inherits,
//     safety cover on first click. checkbox() gains 3rd param `danger` that
//     swaps accent to C.danger. columnHeaderBar({showDel:true}) + row({showDel
//     :true,del:...}) conditionally insert DEL between FLT and ACTIONS. Red
//     reserved for activation signals only — filled on-state + `cover-armed`
//     countdown. Column header and calm states render identically to other
//     columns (no red backdrop, no red label). Settings → Danger zone preview
//     keeps a red border as the gate-warning signal (outside the column).
//   - §5 sort/reorder: replaced binary "drag enabled/disabled" with the
//     auto-clear-on-drag flow + micro-toast with Undo
//   - §7 NEW (2026-04-20): Settings panel — modal overlay. Canonical store
//     for every global flag; header toggles are shortcuts to the same
//     state. Five sections: General (incl. New watch folder defaults as a
//     row of 8 big-checkbox cells), Import filters (Allowlist / Denylist
//     + orthogonal Skip hidden/service files), Behavior (cover / undo /
//     writeFinish durations), Danger zone (Enable DEL column, red border),
//     Advanced / Logs (Save log, Dump now migrated here). Introduces
//     globalOverride visual: when global Auto Sync = ON, per-row 👁
//     renders at opacity 0.4 (dormant — state preserved, editable, but
//     currently not in effect). Distinct from subLocked (color-swap):
//     opacity-reduce ≠ color-swap = two axes, two meanings.

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

  const COL = {
    LABEL: 20,
    TREE: 14,
    NAME: 200,
    PATH: 262,
    SUB: 32,
    REL: 32,
    SEQ: 32,
    FLT: 32,
    DEL: 32,   // hidden by default; appears only when Settings → Danger zone enables it
    ACT: 118,
    RM: 22,
  };
  const ROW_GAP = 8;
  const ROW_PAD = 12;
  const ROW_H = 30;

  // ---------- Colors (Premiere / Media Encoder dark theme) ----------
  const C = {
    canvas:    { r: 0.08, g: 0.08, b: 0.09 },
    panel:     { r: 0.145, g: 0.145, b: 0.155 },
    panelAlt:  { r: 0.175, g: 0.175, b: 0.185 },
    panelHi:   { r: 0.21, g: 0.21, b: 0.22 },
    border:    { r: 0.30, g: 0.30, b: 0.32 },
    borderStrong: { r: 0.42, g: 0.42, b: 0.44 },

    text:      { r: 0.87, g: 0.87, b: 0.88 },
    textDim:   { r: 0.60, g: 0.60, b: 0.63 },
    textFade:  { r: 0.42, g: 0.42, b: 0.45 },

    accent:    { r: 0.08, g: 0.47, b: 0.95 },
    accentSoft:{ r: 0.08, g: 0.47, b: 0.95 },
    success:   { r: 0.36, g: 0.78, b: 0.30 },
    danger:    { r: 0.96, g: 0.32, b: 0.38 },
    amber:     { r: 0.94, g: 0.69, b: 0.22 },
    white:     { r: 1, g: 1, b: 1 },

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

  // checkbox(variant, locked?, danger?)
  //   locked=true → semantic shape preserved (on/off/inherited-on/inherited-off)
  //     but accent color swaps to textDim (SUB=OFF subtree lockout on descendants).
  //   danger=true → red ONLY on activation signals (filled on-state + lifted
  //     cover countdown). Calm states (off, inherited-off, disabled) render
  //     identically to non-danger columns — column header also stays neutral.
  //     Rationale: red everywhere would desensitize. The danger signal fires
  //     only when the control is actually being used. Locked always wins
  //     over danger (inactive cell is neutral, not red).
  function checkbox(variant, locked, danger) {
    const f = figma.createFrame();
    f.resize(14, 14);
    f.cornerRadius = 3;
    const baseAccent = danger ? C.danger : C.accent;
    const tint = locked ? C.textDim : baseAccent;
    const markColor = locked ? { r: 0.75, g: 0.75, b: 0.77 } : C.white;
    if (variant === "on") {
      // Active signal — red fill + red stroke in danger mode.
      setFill(f, tint, locked ? 0.55 : 1);
      setStroke(f, tint, locked ? 0.7 : 1, 1);
      f.layoutMode = "HORIZONTAL";
      f.layoutSizingHorizontal = "FIXED";
      f.layoutSizingVertical = "FIXED";
      f.primaryAxisAlignItems = "CENTER";
      f.counterAxisAlignItems = "CENTER";
      f.appendChild(txt("✓", F.b, 10, markColor));
    } else if (variant === "off") {
      // Calm state — identical to non-danger, no red hint.
      f.fills = [];
      setStroke(f, locked ? C.textFade : C.borderStrong, locked ? 0.65 : 1, 1);
    } else if (variant === "inherited-on") {
      setFill(f, tint, locked ? 0.2 : 0.35);
      setStroke(f, tint, locked ? 0.3 : 0.45, 1);
      f.layoutMode = "HORIZONTAL";
      f.layoutSizingHorizontal = "FIXED";
      f.layoutSizingVertical = "FIXED";
      f.primaryAxisAlignItems = "CENTER";
      f.counterAxisAlignItems = "CENTER";
      f.appendChild(txt("✓", F.m, 9, markColor));
    } else if (variant === "inherited-off") {
      // Calm state — identical to non-danger.
      f.fills = [];
      setStroke(f, locked ? C.textFade : C.borderStrong, locked ? 0.3 : 0.45, 1);
    } else if (variant === "cover") {
      // Cover down = calm (matte gray, same as other columns).
      // Cover lifted / countdown running is a separate variant — see "cover-armed".
      setFill(f, C.white, 0.06);
      setStroke(f, C.borderStrong, 1, 1.5);
    } else if (variant === "cover-armed") {
      // DEL-specific: cover lifted, ~3s countdown running. Red stroke is
      // the signal "destructive commit imminent". Second click commits → "on".
      setFill(f, C.white, 0.06);
      setStroke(f, C.danger, 0.85, 1.5);
    } else if (variant === "disabled") {
      f.fills = [];
      setStroke(f, C.textFade, 0.5, 1);
    }
    return f;
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
      setStroke(f, C.textDim, 0.7, 1);
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
    f.appendChild(txt(glyph, F.m, 12, color || C.text));
    if (opacity != null) f.opacity = opacity;
    return f;
  }

  function actionIconHighlight(glyph, color) {
    const f = actionIcon(glyph, color);
    setFill(f, color, 0.15);
    setStroke(f, color, 0.5, 1);
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
    f.appendChild(txt(label, F.m, 12, C.text));
    return f;
  }

  // Small pill/chip — for "→ Footage" target preview, toast label, etc.
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
  // extraTargetChip: optional small chip shown inside NAME column after the name,
  //                  visualizes guard 1 "effective target preview" (e.g. "→ Footage")
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
    // State → row-bg tint. Red = missing, amber = scanning. Everything else
    // (ok, disabled, eye-closed) = calm, signal-free.
    // FLT border (fltBorder prop) is a second visual channel — only applies on
    // calm rows. "swallowed" = dark-gray border (sub dissolved by ancestor
    // FLT=ON). "anchor" = accent-blue border (explicit FLT=OFF override inside
    // a flat region). State tints always win over FLT border.
    if (cfg.state === "missing") {
      setFill(wrap, C.danger, 0.08);
      setStroke(wrap, C.danger, 0.55, 1);
    } else if (cfg.state === "scanning") {
      setFill(wrap, C.amber, 0.10);
      setStroke(wrap, C.amber, 0.45, 1);
    } else {
      if (cfg.rowFill === "alt") setFill(wrap, C.panelAlt, 1);
      else if (cfg.rowFill === "hover") setFill(wrap, C.panelHi, 1);
      else wrap.fills = [];
      if (cfg.fltBorder === "swallowed") setStroke(wrap, C.borderStrong, 0.7, 1);
      else if (cfg.fltBorder === "anchor") setStroke(wrap, C.accent, 0.55, 1);
    }

    // Label cell (leftmost — Premiere parity). Empty circle = no label.
    const labelBoxEarly = cell(COL.LABEL, labelDot(cfg.label));
    if (cfg.labelInherited) labelBoxEarly.children[0].opacity = 0.4;
    if (cfg.state === "disabled" || cfg.subLocked) labelBoxEarly.children[0].opacity = 0.35;
    r.appendChild(labelBoxEarly);

    let glyph = null, treeColor = C.textDim;
    if (cfg.tree === "expanded") glyph = "⌄";
    else if (cfg.tree === "collapsed") glyph = "›";
    else if (cfg.tree === "virtual") glyph = "›";
    r.appendChild(treeCell(glyph, treeColor, cfg.tree !== "leaf"));

    const nameBox = cell(COL.NAME, null, "MIN");
    const nameInner = hHug();
    nameInner.itemSpacing = 6;
    nameInner.counterAxisAlignItems = "CENTER";
    if (cfg.indent) nameInner.appendChild(spacer(cfg.indent, 1));
    const nameFont = cfg.nameItalic ? F.i : F.m;
    const nameColor = cfg.nameColor || ((cfg.state === "disabled" || cfg.subLocked) ? C.textFade : C.text);
    nameInner.appendChild(txt(cfg.name, nameFont, 12, nameColor));
    if (cfg.extraTargetChip) {
      nameInner.appendChild(chip(cfg.extraTargetChip, C.amber, 0.15));
    }
    nameBox.appendChild(nameInner);
    r.appendChild(nameBox);

    const pathBox = cell(COL.PATH, null, "MIN");
    const pathColor = cfg.pathColor || (cfg.state === "missing" ? C.danger : (cfg.subLocked ? C.textFade : C.textDim));
    const pathFont = cfg.pathItalic ? F.i : F.r;
    const pathInner = hHug();
    pathInner.itemSpacing = 4;
    pathInner.counterAxisAlignItems = "CENTER";
    if (cfg.state === "missing") pathInner.appendChild(txt("⚠", F.b, 11, C.danger));
    pathInner.appendChild(txt(cfg.path, pathFont, 11, pathColor));
    pathBox.appendChild(pathInner);
    r.appendChild(pathBox);

    r.appendChild(cell(COL.SUB, checkbox(cfg.sub, cfg.subLocked)));
    r.appendChild(cell(COL.REL, checkbox(cfg.rel, cfg.subLocked)));
    r.appendChild(cell(COL.SEQ, checkbox(cfg.seq, cfg.subLocked)));
    r.appendChild(cell(COL.FLT, checkbox(cfg.flt, cfg.subLocked)));
    if (cfg.showDel) {
      // DEL cell — transparent bg. Danger palette applied via `danger=true`
      // on checkbox, but red ONLY renders on activation signals (on-state +
      // cover-armed countdown). Calm states identical to other columns.
      const delVariant = cfg.del || "off";
      r.appendChild(cell(COL.DEL, checkbox(delVariant, cfg.subLocked, true)));
    }

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

    let rmGlyph = cfg.remove === false ? "" : "×";
    const rmText = txt(rmGlyph, F.r, 14, C.textDim);
    r.appendChild(cell(COL.RM, rmGlyph ? rmText : null));

    wrap.appendChild(r);
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

    const nameLabel = (opts && opts.nameSort) ? "NAME  " + opts.nameSort : "NAME  ↑";
    wrap.appendChild(colHeaderCell(COL.LABEL, "LBL", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.TREE, "", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.NAME, nameLabel, "MIN", (opts && opts.nameSort === "") ? C.textDim : C.accent));
    wrap.appendChild(colHeaderCell(COL.PATH, "PATH", "MIN"));
    wrap.appendChild(colHeaderCell(COL.SUB, "SUB", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.REL, "REL", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.SEQ, "SEQ", "CENTER"));
    wrap.appendChild(colHeaderCell(COL.FLT, "FLT", "CENTER"));
    if (opts && opts.showDel) {
      // DEL header — neutral, identical to other columns. The red signal
      // is reserved for the checkbox itself (on-state + cover-armed).
      wrap.appendChild(colHeaderCell(COL.DEL, "DEL", "CENTER"));
    }
    wrap.appendChild(colHeaderCell(COL.ACT, "ACTIONS", "MIN"));
    wrap.appendChild(colHeaderCell(COL.RM, "", "CENTER"));
    return wrap;
  }

  function panelHeader(opts) {
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
    logoDot.appendChild(txt("🐑", F.r, 10, C.white));
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
    searchBox.appendChild(txt("🔍", F.r, 11, C.textDim));
    searchBox.appendChild(txt("Search watch folders…", F.r, 11, C.textFade));
    wrap.appendChild(searchBox);

    // Optional "Show targets" toggle (guard 3)
    if (opts && opts.showTargets != null) {
      const t = hHug();
      t.itemSpacing = 6;
      t.counterAxisAlignItems = "CENTER";
      t.paddingLeft = 8; t.paddingRight = 8;
      t.paddingTop = 4; t.paddingBottom = 4;
      t.cornerRadius = 4;
      if (opts.showTargets) {
        setFill(t, C.amber, 0.18);
        setStroke(t, C.amber, 0.55, 1);
        t.appendChild(txt("◉", F.b, 11, C.amber));
        t.appendChild(txt("Show targets", F.m, 11, C.amber));
      } else {
        t.fills = [];
        setStroke(t, C.border, 1, 1);
        t.appendChild(txt("○", F.r, 11, C.textDim));
        t.appendChild(txt("Show targets", F.m, 11, C.textDim));
      }
      wrap.appendChild(t);
    }

    wrap.appendChild(spacer(1, 1));
    wrap.children[wrap.children.length - 1].layoutGrow = 1;

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

  function progressPanel(variant) {
    const p = vSec(PANEL_W);
    p.paddingLeft = 14; p.paddingRight = 14;
    p.paddingTop = 10; p.paddingBottom = 10;
    p.itemSpacing = 8;
    setFill(p, C.panelAlt, 1);

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

    const barWrap = vSec(PANEL_W - 28);
    barWrap.itemSpacing = 4;
    const barLabel = hSec(PANEL_W - 28);
    barLabel.itemSpacing = 8;
    barLabel.counterAxisAlignItems = "CENTER";
    barLabel.appendChild(txt("Overall", F.m, 11, C.text));
    barLabel.appendChild(spacer(1, 1)); barLabel.children[barLabel.children.length - 1].layoutGrow = 1;
    barLabel.appendChild(txt("68% · 7/10 chunks · 102/148 files", F.r, 11, C.textDim));
    barWrap.appendChild(barLabel);

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

  // ---------- Reusable card helpers ----------
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
      h.appendChild(txt(ln.text, ln.bold ? F.s : F.r, 12, ln.textColor || C.text));
      if (ln.tag) h.appendChild(txt(ln.tag, F.i, 10, ln.tagColor || C.textDim));
      box.appendChild(h);
    }
    return box;
  }

  // ---------- BUILD DOCUMENT ----------

  const root = figma.createFrame();
  root.name = "SheepDog — Panel v1.2 Concept";
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
  titleSec.appendChild(txt("SheepDog — Panel v1.2 Concept", F.b, 36, C.white, 44, 1));
  titleSec.appendChild(txt("STATE → row-bg tint · LBL leftmost · FLT flat-override · FLT border states · SUB=OFF subtree lockout · DEL danger-zone opt-in · sort auto-clear on drag · 2026-04-20", F.r, 14, C.textDim, 20));
  titleSec.appendChild(divider(contentW, C.white, 0.08));
  root.appendChild(titleSec);

  // ==================================================
  // SECTION 1 — MAIN PANEL (idle, with tree)
  // ==================================================
  const s1 = vSec(contentW);
  s1.itemSpacing = 16;
  s1.appendChild(sectionTitle("1. Main panel — idle state", "Tree expanded · mix of inherited / overridden rows · one missing path · one scanning", contentW));

  const s1Row = hSec(contentW);
  s1Row.itemSpacing = 40;
  s1Row.counterAxisAlignItems = "MIN";

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

  const treeRows = [
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
    },
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
    panel.appendChild(row(cfg));
    panel.appendChild(divider(PANEL_W, C.border, 0.4));
  }

  panel.appendChild(progressPanel("collapsed"));
  panel.appendChild(divider(PANEL_W, C.border, 1));
  panel.appendChild(footer("Watching 4 folders · Auto Sync ON"));

  s1Row.appendChild(panel);

  const ann = vSec(ANN_W);
  ann.itemSpacing = 20;

  // State tint swatch — mini row-bg preview (matches row() palette).
  function stateTintDemo(color) {
    const f = figma.createFrame();
    f.resize(28, 16);
    f.cornerRadius = 2;
    setFill(f, color, 0.1);
    setStroke(f, color, 0.45, 1);
    return f;
  }
  function calmTintDemo() {
    const f = figma.createFrame();
    f.resize(28, 16);
    f.cornerRadius = 2;
    setFill(f, C.panel, 1);
    setStroke(f, C.border, 0.8, 1);
    return f;
  }

  ann.appendChild(annCard("STATE — row-bg tint only (v1.2 refactor)", C.accent, [
    { demo: demoBox(32, 20, stateTintDemo(C.danger)),
      title: "Missing path",
      desc: "Red 8% backdrop + red 1px border. Path text turns red with ⚠ prefix. ⌕ Relink action highlighted." },
    { demo: demoBox(32, 20, stateTintDemo(C.amber)),
      title: "Scanning",
      desc: "Amber 10% backdrop + amber border. ↻ action icon highlighted. Transient — only one row at a time during chunked import." },
    { demo: demoBox(32, 20, calmTintDemo()),
      title: "Calm (everything else)",
      desc: "Ok, disabled, eye-closed → no tint. Behavioral: feedback only on deviation. Disabled = faded text. Eye-closed = 👁 action icon. No green state dot — default IS the signal." },
  ]));

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
      desc: "Matte gray fill = flip-up cover down. Click once → cover lifts (4s). Click again within window → applies. See §3 for full flow." },
    { demo: demoBox(24, 18, checkbox("disabled")),
      title: "Disabled (row off)",
      desc: "Row's enabled=false greys out all toggles. Settings remembered, not lost." },
    { demo: demoBox(24, 18, checkbox("on", true)),
      title: "Overridden ON · SUB locked",
      desc: "Descendant of a SUB=OFF ancestor. Shape preserved (user's override still stored), accent swapped to textDim to signal \"currently frozen\". Flipping parent's SUB back restores the blue." },
    { demo: demoBox(24, 18, checkbox("inherited-on", true)),
      title: "Inherited ON · SUB locked",
      desc: "Same cascade, applied to an inherited value. Faded grey — preserves the \"this flows from somewhere\" reading while signalling inactivity." },
  ]));

  // FLT-border demo — mini row-like swatch showing border state
  function fltBorderDemo(borderColor, borderOpacity) {
    const f = figma.createFrame();
    f.resize(28, 16);
    f.cornerRadius = 2;
    setFill(f, C.panel, 1);
    setStroke(f, borderColor, borderOpacity, 1);
    return f;
  }

  ann.appendChild(annCard("Row ornamentation", C.amber, [
    { demo: demoBox(32, 20, calmTintDemo()),
      title: "Alt zebra fill",
      desc: "Every other calm row uses +3% brightness. State tints (red/amber) override zebra." },
    { demo: demoBox(32, 20, txt("Italic", F.i, 11, C.textDim)),
      title: "Virtual row",
      desc: "Subfolder on disk, no record in JSON. Italic + muted. One click on any control materializes it." },
    { demo: demoBox(32, 20, labelDot(null)),
      title: "No label / disabled",
      desc: "Empty circle = user hasn't assigned a Premiere color label. Disabled row = label dot muted to 35%." },
    { demo: demoBox(32, 20, fltBorderDemo(C.borderStrong, 0.7)),
      title: "FLT swallowed (dark-gray border)",
      desc: "Row's bin dissolves into nearest FLT=ON ancestor. Dark-gray 1px border marks the sub as part of a flat region. Files land in the flat ancestor's bin." },
    { demo: demoBox(32, 20, fltBorderDemo(C.accent, 0.55)),
      title: "FLT anchor (accent border)",
      desc: "Explicit FLT=OFF inside an FLT=ON region — this row survives as its own sub-bin. Accent-blue 1px border signals \"I broke the cascade on purpose\". Its own subs follow its own FLT." },
  ]));

  // Subtree lockout demo — mini 4-checkbox strip at two states.
  function lockoutStripDemo(variants, locked) {
    const f = hHug();
    f.itemSpacing = 4;
    f.counterAxisAlignItems = "CENTER";
    for (const v of variants) f.appendChild(checkbox(v, locked));
    return f;
  }

  ann.appendChild(annCard("SUB=OFF subtree lockout", C.textDim, [
    { demo: demoBox(100, 18, lockoutStripDemo(["off", "off", "off", "off"], false)),
      title: "Parent — SUB unchecked (SOT)",
      desc: "User explicitly turned SUB off. Checkbox stays solid-outline (active control, toggleable). Row itself stays calm — no lockout on parent." },
    { demo: demoBox(100, 18, lockoutStripDemo(["inherited-off", "on", "inherited-off", "off"], true)),
      title: "Descendants — stored values, frozen",
      desc: "All 4 controls stay legible (their stored values remain visible) but accent is swapped to textDim. NAME/PATH dim to textFade. Flipping parent SUB back restores accent instantly." },
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

  const s2Stack = vSec(contentW);
  s2Stack.itemSpacing = 24;
  s2Stack.appendChild(progressWrap("collapsed", "COLLAPSED — idle default. Single line in footer area."));
  s2Stack.appendChild(progressWrap("expanded-idle", "EXPANDED IDLE — last run summary when user toggles caret open."));
  s2Stack.appendChild(progressWrap("active", "ACTIVE IMPORT — overall bar + chunk breakdown. Grows up to ~200px with own scroll."));
  root.appendChild(s2);
  root.appendChild(s2Stack);

  // ==================================================
  // SECTION 3 — Safety cover — flip-up metaphor (iter 2, 2026-04-19)
  //   Dropped padlock icon entirely. Palette reduced to gray + blue.
  //   Locked    = matte gray fill over empty checkbox (cover is DOWN)
  //   Unlocked  = empty checkbox, blue stroke, blue countdown ring (CCW drain)
  //   Active    = normal blue fill + white ✓
  //   Re-lock   = Locked
  //   Amber reserved for informational Migration preview only — never on controls.
  // ==================================================
  const s3 = vSec(contentW);
  s3.itemSpacing = 16;
  s3.appendChild(sectionTitle(
    "3. Safety cover — flip-up metaphor, no iconography",
    "Matte fill = cover down. Empty + blue stroke + countdown ring = cover lifted (4s). Blue fill + ✓ = applied.",
    contentW
  ));

  const s3Row = hSec(contentW);
  s3Row.itemSpacing = 20;
  s3Row.counterAxisAlignItems = "MIN";

  // Locked state demo — literal "cover" (matte fill, thicker gray stroke, no glyph)
  function coveredBigDemo() {
    const f = figma.createFrame();
    f.resize(44, 44);
    f.cornerRadius = 7;
    setFill(f, C.white, 0.06);
    setStroke(f, C.borderStrong, 1, 1.75);
    return f;
  }

  // Active state demo — regular on-state checkbox
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

  // Sample rounded-rect perimeter into polyline points.
  // Starts at top-center, walks CCW (left first). Returns array of [x,y].
  function roundedRectPerimeter(w, h, r, steps) {
    const L1 = w / 2 - r;           // top edge, center → left
    const L2 = Math.PI * r / 2;     // top-left arc
    const L3 = h - 2 * r;           // left edge, top → bottom
    const L4 = Math.PI * r / 2;     // bottom-left arc
    const L5 = w - 2 * r;           // bottom edge, left → right
    const L6 = Math.PI * r / 2;     // bottom-right arc
    const L7 = h - 2 * r;           // right edge, bottom → top
    const L8 = Math.PI * r / 2;     // top-right arc
    const L9 = w / 2 - r;           // top edge, right → center
    const total = L1 + L2 + L3 + L4 + L5 + L6 + L7 + L8 + L9;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const s = (i / steps) * total;
      let x, y;
      if (s <= L1) {
        x = w / 2 - s; y = 0;
      } else if (s <= L1 + L2) {
        // top-left corner, center (r, r). Angle from -π/2 (top) → -π (left), y-down screen CCW.
        const phi = -Math.PI / 2 - (s - L1) / r;
        x = r + r * Math.cos(phi);
        y = r + r * Math.sin(phi);
      } else if (s <= L1 + L2 + L3) {
        x = 0; y = r + (s - L1 - L2);
      } else if (s <= L1 + L2 + L3 + L4) {
        // bottom-left corner, center (r, h-r). Angle from π → π/2.
        const phi = Math.PI - (s - L1 - L2 - L3) / r;
        x = r + r * Math.cos(phi);
        y = (h - r) + r * Math.sin(phi);
      } else if (s <= L1 + L2 + L3 + L4 + L5) {
        x = r + (s - L1 - L2 - L3 - L4); y = h;
      } else if (s <= L1 + L2 + L3 + L4 + L5 + L6) {
        // bottom-right corner, center (w-r, h-r). Angle from π/2 → 0.
        const phi = Math.PI / 2 - (s - L1 - L2 - L3 - L4 - L5) / r;
        x = (w - r) + r * Math.cos(phi);
        y = (h - r) + r * Math.sin(phi);
      } else if (s <= L1 + L2 + L3 + L4 + L5 + L6 + L7) {
        x = w; y = (h - r) - (s - L1 - L2 - L3 - L4 - L5 - L6);
      } else if (s <= L1 + L2 + L3 + L4 + L5 + L6 + L7 + L8) {
        // top-right corner, center (w-r, r). Angle from 0 → -π/2.
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

  // Checkbox with countdown DRAINING along its own rounded-rect border (CCW).
  // Base border is gray; blue overlay covers the remaining portion.
  // progress01 = 1 → full blue border; progress01 = 0 → all gray (= about to re-lock).
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
    // Flip horizontally around x = inset + inner. Inverts CCW walk → CW walk,
    // so the end-point retreats CCW as progress drains (time rolls back).
    overlay.relativeTransform = [[-1, 0, inset + inner], [0, 1, inset]];

    return wrap;
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
      // Countdown strip — 3 frames of the ring draining CCW (100% → 50% → 10%)
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
      hintBox.appendChild(txtW(migrationHint, F.r, 10, C.text, 220, 14));
      w.appendChild(hintBox);
    }
    return w;
  }

  s3Row.appendChild(coverStep(
    "1 · Locked (default)",
    "Cover is down. Matte fill over empty control — nothing clickable through it. One click lifts the cover.",
    coveredBigDemo(),
    false
  ));

  s3Row.appendChild(coverStep(
    "2 · Unlocked (4s)",
    "Cover lifted. Blue border previews the committed state and drains CCW along its own perimeter. Gray shows through as time runs out. Second click commits.",
    borderCountdown(44, 7, 0.75),
    true,
    "12 files move from bin \"day1\" → bin \"Footage\". Timeline links unaffected."
  ));

  s3Row.appendChild(coverStep(
    "3 · Active (applied)",
    "2nd click within the window commits. Structural change executes. Now just a regular on-checkbox.",
    activeBigDemo(),
    false
  ));

  s3Row.appendChild(coverStep(
    "— · Auto re-lock",
    "Ring completed with no 2nd click, OR project reload / import start / cancel. Cover drops back down.",
    coveredBigDemo(),
    false
  ));

  s3.appendChild(s3Row);
  root.appendChild(s3);

  // ==================================================
  // SECTION 4 — FLT model (flat-override semantic)
  // Three card pairs show the full rule set:
  //   pair A — simple flat (subs inherit, all swallowed)
  //   pair B — explicit anchor (FLT=OFF breaks the cascade locally)
  //   pair C — nested override (FLT=ON inside an anchor)
  // ==================================================
  const s4 = vSec(contentW);
  s4.itemSpacing = 16;
  s4.appendChild(sectionTitle(
    "4. FLT model — flat-override (resolved 2026-04-19)",
    "FLT on X controls X's own subs: ON dissolves them, OFF preserves them. X itself always stays as bin (unless an ancestor ate it). Children inherit parent's FLT; explicit flip = anchor.",
    contentW
  ));

  // ---- shared layout helper ----
  const pairW = Math.floor((contentW - 20) / 2);

  function s4Pair(labelText, diskLines, projectLines) {
    const pairWrap = vSec(contentW);
    pairWrap.itemSpacing = 8;

    // Label strip above pair
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
    pairRow.appendChild(treeMini("On disk (SOT)", diskLines, C.textDim, pairW));
    pairRow.appendChild(treeMini("In Premiere (resolved)", projectLines, C.accent, pairW));
    pairWrap.appendChild(pairRow);
    return pairWrap;
  }

  // ---- PAIR A — simple flat ----
  // day1=ON, RAW inherited → both dissolved into day1
  s4.appendChild(s4Pair(
    "A · Simple flat — only day1=ON, everything below inherits",
    [
      { glyph: "📁", text: "Footage", bold: true, tag: "FLT=OFF (keeps subs)", tagColor: C.success },
      { glyph: "  📄", text: "promo.mp4" },
      { glyph: "  📁", text: "day1", bold: true, tag: "FLT=ON (eats subs)", tagColor: C.amber },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📄", text: "shot_B.mp4" },
      { glyph: "    📁", text: "RAW", tag: "inherited ON (from day1)", tagColor: C.textDim },
      { glyph: "      📄", text: "take_01.mxf" },
      { glyph: "      📄", text: "take_02.mxf" },
    ],
    [
      { glyph: "📂", text: "Footage", bold: true, tag: "bin (own)", tagColor: C.accent },
      { glyph: "  📄", text: "promo.mp4" },
      { glyph: "  📂", text: "day1", bold: true, tag: "bin (own, flat inside)", tagColor: C.accent },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📄", text: "shot_B.mp4" },
      { glyph: "    📄", text: "take_01.mxf", tag: "from RAW (swallowed)", tagColor: C.textDim },
      { glyph: "    📄", text: "take_02.mxf", tag: "from RAW (swallowed)", tagColor: C.textDim },
    ]
  ));

  // ---- PAIR B — explicit anchor ----
  // day1=ON, RAW=OFF (explicit) → RAW survives as sub-bin, its files stay in RAW
  s4.appendChild(s4Pair(
    "B · Explicit anchor — RAW flips to FLT=OFF inside day1=ON flat region",
    [
      { glyph: "📁", text: "Footage", bold: true, tag: "FLT=OFF", tagColor: C.success },
      { glyph: "  📄", text: "promo.mp4" },
      { glyph: "  📁", text: "day1", bold: true, tag: "FLT=ON (eats subs)", tagColor: C.amber },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📄", text: "shot_B.mp4" },
      { glyph: "    📁", text: "RAW", bold: true, tag: "FLT=OFF (anchor)", tagColor: C.accent },
      { glyph: "      📄", text: "take_01.mxf" },
      { glyph: "      📄", text: "take_02.mxf" },
    ],
    [
      { glyph: "📂", text: "Footage", bold: true, tag: "bin", tagColor: C.accent },
      { glyph: "  📄", text: "promo.mp4" },
      { glyph: "  📂", text: "day1", bold: true, tag: "bin (flat inside)", tagColor: C.accent },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📄", text: "shot_B.mp4" },
      { glyph: "    📂", text: "RAW", bold: true, tag: "anchor · bin (own subs)", tagColor: C.accent },
      { glyph: "      📄", text: "take_01.mxf" },
      { glyph: "      📄", text: "take_02.mxf" },
    ]
  ));

  // ---- PAIR C — nested override ----
  // day1=ON, RAW=OFF (anchor), TEMP=ON inside RAW → TEMP's subs dissolve into RAW
  s4.appendChild(s4Pair(
    "C · Nested override — TEMP=ON inside RAW=OFF anchor",
    [
      { glyph: "📁", text: "Footage", bold: true, tag: "FLT=OFF", tagColor: C.success },
      { glyph: "  📁", text: "day1", bold: true, tag: "FLT=ON", tagColor: C.amber },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📁", text: "RAW", bold: true, tag: "FLT=OFF (anchor)", tagColor: C.accent },
      { glyph: "      📄", text: "take_01.mxf" },
      { glyph: "      📁", text: "TEMP", bold: true, tag: "FLT=ON (flat inside RAW)", tagColor: C.amber },
      { glyph: "        📄", text: "draft1.mxf" },
      { glyph: "        📁", text: "scratch", tag: "inherited ON (from TEMP)", tagColor: C.textDim },
      { glyph: "          📄", text: "alt_take.mxf" },
    ],
    [
      { glyph: "📂", text: "Footage", bold: true, tag: "bin", tagColor: C.accent },
      { glyph: "  📂", text: "day1", bold: true, tag: "bin (flat)", tagColor: C.accent },
      { glyph: "    📄", text: "shot_A.mp4" },
      { glyph: "    📂", text: "RAW", bold: true, tag: "anchor · bin (flat inside via TEMP=ON)", tagColor: C.accent },
      { glyph: "      📄", text: "take_01.mxf" },
      { glyph: "      📄", text: "draft1.mxf", tag: "from TEMP (swallowed)", tagColor: C.textDim },
      { glyph: "      📄", text: "alt_take.mxf", tag: "from TEMP/scratch (swallowed)", tagColor: C.textDim },
    ]
  ));

  // ---- Resolution rules table (covers pair C to show every lookup) ----
  const s4Table = vSec(contentW);
  s4Table.itemSpacing = 0;
  s4Table.cornerRadius = 8;
  s4Table.clipsContent = true;
  setStroke(s4Table, C.border, 1, 1);

  const s4ColW1 = 320;
  const s4ColW2 = 300;
  const s4ColW3 = contentW - s4ColW1 - s4ColW2 - 48;

  const s4Head = hSec(contentW);
  s4Head.paddingLeft = 16; s4Head.paddingRight = 16;
  s4Head.paddingTop = 10; s4Head.paddingBottom = 10;
  s4Head.itemSpacing = 16;
  setFill(s4Head, C.panelAlt, 1);
  const h1 = cell(s4ColW1, txt("FILE  (pair C)", F.s, 10, C.textDim, undefined, 1), "MIN"); h1.resize(s4ColW1, 20);
  const h2 = cell(s4ColW2, txt("NEAREST NON-SWALLOWED BIN", F.s, 10, C.textDim, undefined, 1), "MIN"); h2.resize(s4ColW2, 20);
  const h3 = cell(s4ColW3, txt("LANDS IN BIN", F.s, 10, C.textDim, undefined, 1), "MIN"); h3.resize(s4ColW3, 20);
  s4Head.appendChild(h1); s4Head.appendChild(h2); s4Head.appendChild(h3);
  s4Table.appendChild(s4Head);

  function s4TableRow(file, ancestor, bin, binColor) {
    const r = hSec(contentW);
    r.paddingLeft = 16; r.paddingRight = 16;
    r.paddingTop = 10; r.paddingBottom = 10;
    r.itemSpacing = 16;
    setFill(r, C.panel, 1);
    const c1 = cell(s4ColW1, txt(file, F.r, 12, C.text), "MIN"); c1.resize(s4ColW1, 20);
    const c2 = cell(s4ColW2, txt(ancestor, F.m, 12, C.textDim), "MIN"); c2.resize(s4ColW2, 20);
    const c3inner = hHug();
    c3inner.itemSpacing = 8;
    c3inner.counterAxisAlignItems = "CENTER";
    c3inner.appendChild(txt("📂", F.r, 12, C.textDim));
    c3inner.appendChild(txt(bin, F.s, 12, binColor || C.accent));
    const c3 = cell(s4ColW3, c3inner, "MIN"); c3.resize(s4ColW3, 20);
    r.appendChild(c1); r.appendChild(c2); r.appendChild(c3);
    return r;
  }
  s4Table.appendChild(s4TableRow("Footage/day1/shot_A.mp4", "day1 (FLT=ON, files stay)", "day1", C.accent));
  s4Table.appendChild(divider(contentW, C.border, 0.6));
  s4Table.appendChild(s4TableRow("Footage/day1/RAW/take_01.mxf", "RAW (FLT=OFF anchor)", "RAW (in day1)", C.accent));
  s4Table.appendChild(divider(contentW, C.border, 0.6));
  s4Table.appendChild(s4TableRow("Footage/day1/RAW/TEMP/draft1.mxf", "RAW (TEMP swallowed by TEMP=ON into RAW)", "RAW (in day1)", C.accent));
  s4Table.appendChild(divider(contentW, C.border, 0.6));
  s4Table.appendChild(s4TableRow("Footage/day1/RAW/TEMP/scratch/alt_take.mxf", "RAW (scratch inherits TEMP=ON, both swallowed)", "RAW (in day1)", C.accent));
  s4.appendChild(s4Table);

  // ---- Decision log ----
  const s4Decision = vSec(contentW);
  s4Decision.cornerRadius = 8;
  setFill(s4Decision, C.panel, 1);
  setStroke(s4Decision, C.accent, 0.4, 1);
  s4Decision.paddingTop = 16; s4Decision.paddingBottom = 16;
  s4Decision.paddingLeft = 20; s4Decision.paddingRight = 20;
  s4Decision.itemSpacing = 8;
  const decHead = hHug();
  decHead.itemSpacing = 10;
  decHead.counterAxisAlignItems = "CENTER";
  const decChip = figma.createFrame();
  decChip.resize(6, 6); decChip.cornerRadius = 3;
  setFill(decChip, C.accent, 1);
  decHead.appendChild(decChip);
  decHead.appendChild(txt("Decision log — 2026-04-19", F.s, 12, C.white, undefined, 0.5));
  s4Decision.appendChild(decHead);
  s4Decision.appendChild(txtW(
    "Chose flat-override. FLT is a per-row instruction about that row's OWN subs (ON eats, OFF preserves). " +
    "Row itself always stays as bin unless swallowed by an ancestor's FLT=ON. Children inherit parent's " +
    "effective FLT by default — explicit flip = anchor, breaks the cascade locally.",
    F.r, 12, C.text, contentW - 40, 18
  ));
  s4Decision.appendChild(txtW(
    "Rejected alternatives: (a) strict full cascade (FLT=ON ancestor overrides all descendants, no anchor escape) — " +
    "forces user to split into multiple watch folders to get sub-bin preservation, conflicts with import dedup. " +
    "(b) \"FLT=ON row has no bin\" (original v2) — contradicts user intuition that Footage=OFF preserves day1 as bin. " +
    "Flat-override gives local readability + respects default-inheritance semantics.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  s4.appendChild(s4Decision);

  root.appendChild(s4);

  // ==================================================
  // SECTION 4.5 — FLT UI guards (new in v1.2)
  // ==================================================
  const s45 = vSec(contentW);
  s45.itemSpacing = 16;
  s45.appendChild(sectionTitle(
    "4.5 FLT UI guards — 5 mandatory helpers",
    "Cascade is deterministic but not at-a-glance. These 5 guards make the effective target legible without mental simulation.",
    contentW
  ));

  // Guard 1 — Effective target preview in row (before / after)
  const g1 = vSec(contentW);
  g1.itemSpacing = 12;
  g1.cornerRadius = 8;
  setFill(g1, C.panel, 1);
  setStroke(g1, C.amber, 0.4, 1);
  g1.paddingTop = 18; g1.paddingBottom = 18;
  g1.paddingLeft = 22; g1.paddingRight = 22;

  const g1Head = hHug();
  g1Head.itemSpacing = 10;
  g1Head.counterAxisAlignItems = "CENTER";
  const g1Chip = figma.createFrame();
  g1Chip.resize(6, 6); g1Chip.cornerRadius = 3;
  setFill(g1Chip, C.amber, 1);
  g1Head.appendChild(g1Chip);
  g1Head.appendChild(txt("Guard 1 · Effective target preview", F.s, 13, C.white, undefined, 0.5));
  g1.appendChild(g1Head);
  g1.appendChild(txtW(
    "Swallowed row (sub dissolved by ancestor's FLT=ON) shows its resolved target next to the NAME as an amber chip \"→ ancestor bin\". " +
    "Without this, the row looks empty in terms of destination — user would look for a bin that by design does not exist.",
    F.r, 11, C.textDim, contentW - 44, 16
  ));

  // Mini panel: 3 rows showing the guard in action
  const g1Panel = vSec(PANEL_W);
  g1Panel.cornerRadius = 6;
  g1Panel.clipsContent = true;
  setFill(g1Panel, C.panel, 1);
  setStroke(g1Panel, C.border, 1, 1);
  g1Panel.itemSpacing = 0;
  g1Panel.appendChild(columnHeaderBar());
  g1Panel.appendChild(divider(PANEL_W, C.border, 1));
  g1Panel.appendChild(row({
    indent: 0, state: "ok", tree: "expanded",
    name: "Footage", path: "E:/Projects/FILM/Footage",
    sub: "on", rel: "off", seq: "off", flt: "on",
    label: C.labelCerulean,
    actions: [{ glyph: "↻", color: C.text }, { glyph: "⌕", color: C.text }, { glyph: "🧲", color: C.text }, { glyph: "👁", color: C.text }],
  }));
  g1Panel.appendChild(divider(PANEL_W, C.border, 0.4));
  g1Panel.appendChild(row({
    indent: 18, state: "ok", tree: "expanded",
    name: "day1", path: "…/Footage/day1",
    sub: "inherited-on", rel: "inherited-off", seq: "inherited-off", flt: "inherited-on",
    label: null, labelInherited: true,
    extraTargetChip: "→ Footage",
    fltBorder: "swallowed",
    actions: [{ glyph: "↻", color: C.text, opacity: 0.6 }, { glyph: "⌕", color: C.text, opacity: 0.6 }, { glyph: "🧲", color: C.text, opacity: 0.6 }, { glyph: "👁", color: C.text, opacity: 0.6 }],
    rowFill: "alt",
  }));
  g1Panel.appendChild(divider(PANEL_W, C.border, 0.4));
  g1Panel.appendChild(row({
    indent: 36, state: "ok", tree: "leaf",
    name: "RAW", path: "…/day1/RAW",
    sub: "inherited-on", rel: "inherited-off", seq: "inherited-off", flt: "off",
    label: null, labelInherited: true,
    fltBorder: "anchor",
    actions: [{ glyph: "↻", color: C.text }, { glyph: "⌕", color: C.text }, { glyph: "🧲", color: C.text }, { glyph: "👁", color: C.text }],
  }));
  g1.appendChild(g1Panel);
  g1.appendChild(txt(
    "Note — Footage=ON swallows day1 (dark-gray border + amber \"→ Footage\" chip). RAW=OFF = explicit anchor inside ON region (accent-blue border, keeps its own bin).",
    F.i, 11, C.amber, undefined, 0
  ));
  s45.appendChild(g1);

  // Guards 2-4 in a row (three compact cards)
  const g234Row = hSec(contentW);
  g234Row.itemSpacing = 16;
  g234Row.counterAxisAlignItems = "MIN";

  function guardCard(n, title, desc, color, demoNode) {
    const cardW = Math.floor((contentW - 32) / 3);
    const c = vSec(cardW);
    c.cornerRadius = 8;
    setFill(c, C.panel, 1);
    setStroke(c, color, 0.4, 1);
    c.paddingTop = 16; c.paddingBottom = 16;
    c.paddingLeft = 18; c.paddingRight = 18;
    c.itemSpacing = 10;

    const h = hHug();
    h.itemSpacing = 10;
    h.counterAxisAlignItems = "CENTER";
    const ch = figma.createFrame();
    ch.resize(6, 6); ch.cornerRadius = 3;
    setFill(ch, color, 1);
    h.appendChild(ch);
    h.appendChild(txt("Guard " + n + " · " + title, F.s, 12, C.white, undefined, 0.5));
    c.appendChild(h);

    c.appendChild(txtW(desc, F.r, 11, C.textDim, cardW - 36, 16));

    if (demoNode) {
      const demoWrap = figma.createFrame();
      demoWrap.resize(cardW - 36, 100);
      demoWrap.fills = [];
      setFill(demoWrap, C.canvas, 1);
      demoWrap.cornerRadius = 4;
      demoWrap.layoutMode = "HORIZONTAL";
      demoWrap.layoutSizingHorizontal = "FIXED";
      demoWrap.layoutSizingVertical = "FIXED";
      demoWrap.primaryAxisAlignItems = "CENTER";
      demoWrap.counterAxisAlignItems = "CENTER";
      demoWrap.appendChild(demoNode);
      c.appendChild(demoWrap);
    }
    return c;
  }

  // Guard 2 demo — hover tooltip mockup
  const g2Demo = vHug();
  g2Demo.itemSpacing = 4;
  g2Demo.counterAxisAlignItems = "MIN";
  const g2Row = hHug();
  g2Row.itemSpacing = 6;
  g2Row.counterAxisAlignItems = "CENTER";
  g2Row.appendChild(labelDot(C.labelCerulean));
  g2Row.appendChild(txt("day1", F.m, 11, C.text));
  g2Row.appendChild(chip("→ Footage", C.amber, 0.15));
  g2Demo.appendChild(g2Row);
  const g2Tip = hHug();
  g2Tip.paddingLeft = 8; g2Tip.paddingRight = 8;
  g2Tip.paddingTop = 5; g2Tip.paddingBottom = 5;
  g2Tip.cornerRadius = 4;
  g2Tip.counterAxisAlignItems = "CENTER";
  g2Tip.itemSpacing = 5;
  setFill(g2Tip, C.canvas, 1);
  setStroke(g2Tip, C.border, 1, 1);
  g2Tip.appendChild(txt("💡", F.r, 10, C.amber));
  g2Tip.appendChild(txt("Files land in: Footage bin", F.r, 10, C.text));
  g2Demo.appendChild(g2Tip);
  g234Row.appendChild(guardCard(
    2, "Hover tooltip",
    "On hover, every row shows \"Files land in: <bin>\". Breadcrumbed when target is nested (\"…/Footage\").",
    C.amber, g2Demo
  ));

  // Guard 3 demo — "Show targets" toggle in header
  const g3Demo = hHug();
  g3Demo.itemSpacing = 6;
  g3Demo.counterAxisAlignItems = "CENTER";
  g3Demo.paddingLeft = 8; g3Demo.paddingRight = 8;
  g3Demo.paddingTop = 4; g3Demo.paddingBottom = 4;
  g3Demo.cornerRadius = 4;
  setFill(g3Demo, C.amber, 0.18);
  setStroke(g3Demo, C.amber, 0.55, 1);
  g3Demo.appendChild(txt("◉", F.b, 11, C.amber));
  g3Demo.appendChild(txt("Show targets", F.m, 11, C.amber));
  g234Row.appendChild(guardCard(
    3, "Show targets toggle",
    "Header toggle. When ON, every row gets its resolved target chip (guard 1 style). Off by default — noise reduction for flat trees.",
    C.amber, g3Demo
  ));

  // Guard 4 demo — three FLT border states (calm / swallowed / anchor)
  function g4MiniRow(label, borderColor, borderOpacity) {
    const rr = hSec(160);
    rr.paddingLeft = 8; rr.paddingRight = 8;
    rr.paddingTop = 5; rr.paddingBottom = 5;
    rr.itemSpacing = 6;
    rr.counterAxisAlignItems = "CENTER";
    setFill(rr, C.panel, 1);
    if (borderColor) setStroke(rr, borderColor, borderOpacity, 1);
    rr.appendChild(labelDot(C.labelCerulean));
    rr.appendChild(txt(label, F.m, 10, C.text));
    return rr;
  }
  const g4Demo = vHug();
  g4Demo.itemSpacing = 4;
  g4Demo.counterAxisAlignItems = "MIN";
  g4Demo.appendChild(g4MiniRow("Footage (calm)", null, 0));
  g4Demo.appendChild(g4MiniRow("day1 (swallowed)", C.borderStrong, 0.7));
  g4Demo.appendChild(g4MiniRow("RAW (anchor)", C.accent, 0.55));
  g234Row.appendChild(guardCard(
    4, "FLT border states",
    "Second visual channel, orthogonal to state tint. Dark-gray border = swallowed (sub dissolved by ancestor FLT=ON). Accent-blue = anchor (explicit FLT=OFF inside ON region). No border = calm. State tints (red/amber) always win.",
    C.amber, g4Demo
  ));

  s45.appendChild(g234Row);

  // Guard 5 — reference to §3 step 2 above
  const g5 = vSec(contentW);
  g5.cornerRadius = 8;
  setFill(g5, C.panel, 1);
  setStroke(g5, C.amber, 0.4, 1);
  g5.paddingTop = 16; g5.paddingBottom = 16;
  g5.paddingLeft = 20; g5.paddingRight = 20;
  g5.itemSpacing = 8;
  const g5Head = hHug();
  g5Head.itemSpacing = 10;
  g5Head.counterAxisAlignItems = "CENTER";
  const g5Chip = figma.createFrame();
  g5Chip.resize(6, 6); g5Chip.cornerRadius = 3;
  setFill(g5Chip, C.amber, 1);
  g5Head.appendChild(g5Chip);
  g5Head.appendChild(txt("Guard 5 · Migration counter in safety cover", F.s, 13, C.white, undefined, 0.5));
  g5.appendChild(g5Head);
  g5.appendChild(txtW(
    "When user unlocks FLT cover, the cover surface shows the file-move preview: " +
    "\"12 files move from bin day1 → bin Footage. Timeline links unaffected.\" " +
    "See §3 step 2 above for the visual — the amber \"Migration preview\" box.",
    F.r, 11, C.textDim, contentW - 40, 16
  ));
  s45.appendChild(g5);

  root.appendChild(s45);

  // ==================================================
  // SECTION 4.6 — SUB=OFF subtree lockout (NEW v1.2)
  // ==================================================
  const s46 = vSec(contentW);
  s46.itemSpacing = 16;
  s46.appendChild(sectionTitle(
    "4.6 SUB=OFF subtree lockout (resolved 2026-04-19)",
    "Full override. No subs watched → no bins created → nothing flows to Premiere from descendants. All child controls cascade to inherited-off; NAME/PATH dim to textFade. Parent keeps SUB active as SOT.",
    contentW
  ));

  const s46Row = hSec(contentW);
  s46Row.itemSpacing = 32;
  s46Row.counterAxisAlignItems = "MIN";

  // Left: mini panel — parent SUB=OFF, two descendants locked.
  const s46Panel = vSec(PANEL_W);
  s46Panel.cornerRadius = 6;
  s46Panel.clipsContent = true;
  setFill(s46Panel, C.panel, 1);
  setStroke(s46Panel, C.border, 1, 1);
  s46Panel.itemSpacing = 0;
  s46Panel.appendChild(columnHeaderBar());
  s46Panel.appendChild(divider(PANEL_W, C.border, 1));
  s46Panel.appendChild(row({
    indent: 0, state: "ok", tree: "expanded",
    name: "Archive", path: "E:/Projects/FILM/Archive",
    sub: "off", rel: "off", seq: "off", flt: "off",
    label: C.labelIris,
    actions: [{ glyph: "↻", color: C.text }, { glyph: "⌕", color: C.text }, { glyph: "🧲", color: C.text }, { glyph: "👁", color: C.text }],
  }));
  s46Panel.appendChild(divider(PANEL_W, C.border, 0.4));
  s46Panel.appendChild(row({
    indent: 18, state: "ok", tree: "expanded",
    name: "2025_Q4", path: "…/Archive/2025_Q4",
    sub: "inherited-off", rel: "on", seq: "inherited-off", flt: "inherited-off",
    label: null, labelInherited: true,
    subLocked: true,
    actions: [{ glyph: "↻", color: C.text, opacity: 0.35 }, { glyph: "⌕", color: C.text, opacity: 0.35 }, { glyph: "🧲", color: C.text, opacity: 0.35 }, { glyph: "👁", color: C.text, opacity: 0.35 }],
    rowFill: "alt",
  }));
  s46Panel.appendChild(divider(PANEL_W, C.border, 0.4));
  s46Panel.appendChild(row({
    indent: 36, state: "ok", tree: "leaf",
    name: "shoot_01", path: "…/2025_Q4/shoot_01",
    sub: "inherited-off", rel: "inherited-on", seq: "inherited-off", flt: "off",
    label: null, labelInherited: true,
    subLocked: true,
    actions: [{ glyph: "↻", color: C.text, opacity: 0.35 }, { glyph: "⌕", color: C.text, opacity: 0.35 }, { glyph: "🧲", color: C.text, opacity: 0.35 }, { glyph: "👁", color: C.text, opacity: 0.35 }],
  }));
  s46Row.appendChild(s46Panel);

  // Right: explanation + rationale.
  const s46Notes = vSec(contentW - PANEL_W - 32);
  s46Notes.itemSpacing = 12;

  const s46Rule = vSec(contentW - PANEL_W - 32);
  s46Rule.cornerRadius = 8;
  setFill(s46Rule, C.panel, 1);
  setStroke(s46Rule, C.textDim, 0.4, 1);
  s46Rule.paddingTop = 16; s46Rule.paddingBottom = 16;
  s46Rule.paddingLeft = 20; s46Rule.paddingRight = 20;
  s46Rule.itemSpacing = 8;
  const s46RuleHead = hHug();
  s46RuleHead.itemSpacing = 10;
  s46RuleHead.counterAxisAlignItems = "CENTER";
  const s46Chip = figma.createFrame();
  s46Chip.resize(6, 6); s46Chip.cornerRadius = 3;
  setFill(s46Chip, C.textDim, 1);
  s46RuleHead.appendChild(s46Chip);
  s46RuleHead.appendChild(txt("Cascade rule", F.s, 12, C.white, undefined, 0.5));
  s46Rule.appendChild(s46RuleHead);
  s46Rule.appendChild(txtW(
    "SUB=OFF on row X ⇒ every descendant keeps its stored SUB/REL/SEQ/FLT value, but each checkbox renders with accent swapped to textDim. " +
    "Shape preserved (user still sees ON vs OFF vs inherited), color neutralized (control is inactive). " +
    "NAME + PATH dim to textFade, actions drop to 35% opacity. Click on any locked control → tooltip \"Enable SUB on <X> first\". " +
    "Flipping X's SUB back on restores accent instantly — nothing to re-enter.",
    F.r, 12, C.text, contentW - PANEL_W - 72, 18
  ));
  s46Notes.appendChild(s46Rule);

  const s46Why = vSec(contentW - PANEL_W - 32);
  s46Why.cornerRadius = 8;
  setFill(s46Why, C.panel, 1);
  setStroke(s46Why, C.accent, 0.4, 1);
  s46Why.paddingTop = 16; s46Why.paddingBottom = 16;
  s46Why.paddingLeft = 20; s46Why.paddingRight = 20;
  s46Why.itemSpacing = 8;
  const s46WhyHead = hHug();
  s46WhyHead.itemSpacing = 10;
  s46WhyHead.counterAxisAlignItems = "CENTER";
  const s46WhyChip = figma.createFrame();
  s46WhyChip.resize(6, 6); s46WhyChip.cornerRadius = 3;
  setFill(s46WhyChip, C.accent, 1);
  s46WhyHead.appendChild(s46WhyChip);
  s46WhyHead.appendChild(txt("Decision log — 2026-04-19", F.s, 12, C.white, undefined, 0.5));
  s46Why.appendChild(s46WhyHead);
  s46Why.appendChild(txtW(
    "Why shown-but-disabled (not hidden): user keeps visibility of what would come online if SUB flips back on. " +
    "Hidden subtree would make re-enabling a leap of faith. Why no separate lock icon: the four greyed checkboxes + dimmed NAME/PATH already carry the signal — adding 🔒 would be visual spam. " +
    "Why parent stays active: SUB is the SOT, user rules the toggle here; only descendants freeze.",
    F.r, 11, C.textDim, contentW - PANEL_W - 72, 16
  ));
  s46Notes.appendChild(s46Why);

  s46Row.appendChild(s46Notes);
  s46.appendChild(s46Row);
  root.appendChild(s46);

  // ==================================================
  // SECTION 4.7 — DEL column — danger-zone opt-in (NEW v1.2)
  //   Per-row destructive toggle. Hidden by default. Enabled via
  //   Settings → Danger zone. Never inherits. Safety cover on first click.
  //   Red palette restricted to activation signals: filled on-state + the
  //   cover-armed countdown. Column header, off/inherited-off/disabled and
  //   cover-down all render identically to other columns — no red backdrop,
  //   no red header. Settings → Danger zone preview (outside the column)
  //   keeps a red border as the gate-warning signal.
  // ==================================================
  const s47 = vSec(contentW);
  s47.itemSpacing = 16;
  s47.appendChild(sectionTitle(
    "4.7 DEL column — danger-zone opt-in (resolved 2026-04-20)",
    "Bidirectional delete. Hidden by default. Settings → Danger zone enables the column. Never inherits — every row opts in explicitly. Safety cover on first click. Red fires only on activation signals (on-state + cover-armed countdown); calm states stay neutral.",
    contentW
  ));

  const s47Row = hSec(contentW);
  s47Row.itemSpacing = 32;
  s47Row.counterAxisAlignItems = "MIN";

  // Left: mini panel with DEL column ENABLED (showDel: true on header + rows).
  const s47Panel = vSec(PANEL_W);
  s47Panel.cornerRadius = 6;
  s47Panel.clipsContent = true;
  setFill(s47Panel, C.panel, 1);
  setStroke(s47Panel, C.border, 1, 1);
  s47Panel.itemSpacing = 0;
  s47Panel.appendChild(columnHeaderBar({ showDel: true }));
  s47Panel.appendChild(divider(PANEL_W, C.border, 1));

  // Row A — default: DEL=off (never inherited, empty w/ subtle red stroke)
  s47Panel.appendChild(row({
    indent: 0, state: "ok", tree: "collapsed",
    name: "footage", path: "E:/Projects/FILM/footage",
    sub: "on", rel: "off", seq: "on", flt: "off",
    showDel: true, del: "off",
    label: C.labelForest,
    actions: [{ glyph: "↻", color: C.text }, { glyph: "⌕", color: C.text }, { glyph: "🧲", color: C.text }, { glyph: "👁", color: C.text }],
  }));
  s47Panel.appendChild(divider(PANEL_W, C.border, 0.4));

  // Row B — DEL=on (red filled checkbox)
  s47Panel.appendChild(row({
    indent: 0, state: "ok", tree: "collapsed",
    name: "reelA", path: "D:/Shoots/2026/reelA",
    sub: "on", rel: "off", seq: "on", flt: "off",
    showDel: true, del: "on",
    label: C.labelMango,
    actions: [{ glyph: "↻", color: C.text }, { glyph: "⌕", color: C.text }, { glyph: "🧲", color: C.text }, { glyph: "👁", color: C.text }],
    rowFill: "alt",
  }));
  s47Panel.appendChild(divider(PANEL_W, C.border, 0.4));

  // Row C — DEL=cover-armed (user clicked once, cover lifted, red countdown ~3s)
  s47Panel.appendChild(row({
    indent: 0, state: "ok", tree: "collapsed",
    name: "reelB", path: "D:/Shoots/2026/reelB",
    sub: "on", rel: "off", seq: "on", flt: "off",
    showDel: true, del: "cover-armed",
    label: C.labelRose,
    actions: [{ glyph: "↻", color: C.text }, { glyph: "⌕", color: C.text }, { glyph: "🧲", color: C.text }, { glyph: "👁", color: C.text }],
  }));
  s47Panel.appendChild(divider(PANEL_W, C.border, 0.4));

  // Row D — DEL=on but subLocked (locked wins over danger → textDim, not red)
  s47Panel.appendChild(row({
    indent: 0, state: "ok", tree: "leaf",
    name: "reelC", path: "…/Archive/reelC",
    sub: "inherited-off", rel: "inherited-off", seq: "inherited-off", flt: "inherited-off",
    showDel: true, del: "on",
    subLocked: true,
    label: null, labelInherited: true,
    actions: [{ glyph: "↻", color: C.text, opacity: 0.35 }, { glyph: "⌕", color: C.text, opacity: 0.35 }, { glyph: "🧲", color: C.text, opacity: 0.35 }, { glyph: "👁", color: C.text, opacity: 0.35 }],
    rowFill: "alt",
  }));

  s47Row.appendChild(s47Panel);

  // Right column — rules + decision log + Settings-hint preview.
  const s47Notes = vSec(contentW - PANEL_W - 32);
  s47Notes.itemSpacing = 12;

  // Rules card
  const s47Rules = vSec(contentW - PANEL_W - 32);
  s47Rules.cornerRadius = 8;
  setFill(s47Rules, C.panel, 1);
  setStroke(s47Rules, C.danger, 0.4, 1);
  s47Rules.paddingTop = 16; s47Rules.paddingBottom = 16;
  s47Rules.paddingLeft = 20; s47Rules.paddingRight = 20;
  s47Rules.itemSpacing = 8;
  const s47RulesHead = hHug();
  s47RulesHead.itemSpacing = 10;
  s47RulesHead.counterAxisAlignItems = "CENTER";
  const s47RulesDot = figma.createFrame();
  s47RulesDot.resize(6, 6); s47RulesDot.cornerRadius = 3;
  setFill(s47RulesDot, C.danger, 1);
  s47RulesHead.appendChild(s47RulesDot);
  s47RulesHead.appendChild(txt("DEL rules", F.s, 12, C.white, undefined, 0.5));
  s47Rules.appendChild(s47RulesHead);

  const s47RulesBullets = [
    "Hidden by default. Appears only when Settings → Danger zone → \"Enable DEL column\" is on.",
    "Calm states (off / header / inherited) render identically to other columns — no red backdrop, no red label. Red only fires on activation.",
    "Never inherits. Every row opts in explicitly. No cascade from parent. Default for new rows = off.",
    "Safety cover on first click → cover lifts, stroke turns red, ~3s countdown. Second click commits. Timeout re-locks.",
    "Active commit state (✓) renders red fill + red stroke — persistent danger signal until unchecked.",
    "Bidirectional sync: bin delete → source files moved to OS trash. Source folder deleted in OS → bin purged in Premiere.",
    "Premiere guard: a bin with clips in active use will not purge — SheepDog reports \"Skipped, N clips in use\" and highlights the offending rows amber.",
    "Soft delete only — files go to OS trash (Windows 48 h recovery window); never a hard unlink.",
    "SUB=OFF lockout applies. Locked DEL shows the stored value in textDim (same rule as SUB/REL/SEQ/FLT).",
    "Undo toast — 10 s window to reverse the last commit before the trash entry becomes the only recovery path.",
  ];
  for (const line of s47RulesBullets) {
    const row = hSec(contentW - PANEL_W - 72);
    row.itemSpacing = 8;
    row.counterAxisAlignItems = "MIN";
    row.appendChild(txt("•", F.b, 12, C.danger));
    row.appendChild(txtW(line, F.r, 11, C.text, contentW - PANEL_W - 96, 16));
    s47Rules.appendChild(row);
  }
  s47Notes.appendChild(s47Rules);

  // Decision log — why this is safe
  const s47Why = vSec(contentW - PANEL_W - 32);
  s47Why.cornerRadius = 8;
  setFill(s47Why, C.panel, 1);
  setStroke(s47Why, C.accent, 0.4, 1);
  s47Why.paddingTop = 16; s47Why.paddingBottom = 16;
  s47Why.paddingLeft = 20; s47Why.paddingRight = 20;
  s47Why.itemSpacing = 8;
  const s47WhyHead = hHug();
  s47WhyHead.itemSpacing = 10;
  s47WhyHead.counterAxisAlignItems = "CENTER";
  const s47WhyDot = figma.createFrame();
  s47WhyDot.resize(6, 6); s47WhyDot.cornerRadius = 3;
  setFill(s47WhyDot, C.accent, 1);
  s47WhyHead.appendChild(s47WhyDot);
  s47WhyHead.appendChild(txt("Decision log — 2026-04-20", F.s, 12, C.white, undefined, 0.5));
  s47Why.appendChild(s47WhyHead);
  s47Why.appendChild(txtW(
    "Two-gate destroy: the user passes Settings → Danger zone (read the warning, flip the toggle) AND then per-row safety cover. Column only appears after gate 1 — the mere presence of the header is a meaningful signal on its own, no red backdrop needed. " +
    "Red reserved for activation signals only: filled on-state + cover-armed countdown. Column header, off, inherited-off, disabled and cover-down render identically to other columns — a red everywhere scheme would desensitize, and the danger should read as \"something is about to happen / is currently armed\", not \"this column exists\". " +
    "Settings → Danger zone preview keeps a red border because it sits OUTSIDE the column and IS the warning gate itself. Locked wins over danger: SUB=OFF cascade still tints the stored DEL value in textDim (user call, 2026-04-20). " +
    "Trash-first (not hard delete) keeps data integrity (P0); Premiere's own \"clip in use\" guard gives a second natural belt.",
    F.r, 11, C.textDim, contentW - PANEL_W - 72, 16
  ));
  s47Notes.appendChild(s47Why);

  // Settings-hint preview — mini mock of where the toggle lives.
  const s47Hint = vSec(contentW - PANEL_W - 32);
  s47Hint.cornerRadius = 8;
  setFill(s47Hint, C.canvas, 1);
  setStroke(s47Hint, C.danger, 0.5, 1);
  s47Hint.paddingTop = 14; s47Hint.paddingBottom = 14;
  s47Hint.paddingLeft = 16; s47Hint.paddingRight = 16;
  s47Hint.itemSpacing = 10;
  const s47HintHead = hHug();
  s47HintHead.itemSpacing = 8;
  s47HintHead.counterAxisAlignItems = "CENTER";
  s47HintHead.appendChild(txt("⚠", F.b, 12, C.danger));
  s47HintHead.appendChild(txt("Settings  →  Danger zone", F.s, 11, C.danger, undefined, 0.6));
  s47Hint.appendChild(s47HintHead);

  const s47HintToggleRow = hSec(contentW - PANEL_W - 32 - 32);
  s47HintToggleRow.itemSpacing = 10;
  s47HintToggleRow.counterAxisAlignItems = "CENTER";
  s47HintToggleRow.appendChild(toggle(true));
  const s47HintLblWrap = vHug();
  s47HintLblWrap.itemSpacing = 2;
  s47HintLblWrap.appendChild(txt("Enable DEL column", F.m, 12, C.text));
  s47HintLblWrap.appendChild(txt("Per-row destructive toggle. Red only on active DEL + cover countdown. Safety cover on first click.", F.r, 10, C.textDim, 14));
  s47HintToggleRow.appendChild(s47HintLblWrap);
  s47Hint.appendChild(s47HintToggleRow);

  s47Notes.appendChild(s47Hint);

  s47Row.appendChild(s47Notes);
  s47.appendChild(s47Row);
  root.appendChild(s47);

  // ==================================================
  // SECTION 5 — Sort / reorder — auto-clear on drag (NEW v1.2)
  // ==================================================
  const s5 = vSec(contentW);
  s5.itemSpacing = 16;
  s5.appendChild(sectionTitle(
    "5. Sort / reorder — auto-clear on drag (resolved 2026-04-19)",
    "Drag auto-clears active sort. Sort's visible order freezes into ui.order. Micro-toast + Undo guard the gesture.",
    contentW
  ));

  // 3-step flow
  const s5Flow = hSec(contentW);
  s5Flow.itemSpacing = 16;
  s5Flow.counterAxisAlignItems = "MIN";

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

    // Mini panel snapshot
    const mini = vSec(stepW - 40);
    mini.cornerRadius = 4;
    mini.clipsContent = true;
    setFill(mini, C.canvas, 1);
    setStroke(mini, C.border, 1, 1);
    mini.itemSpacing = 0;

    // Column header strip (tiny)
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

    // Row list
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
      rr.appendChild(txt(rn.replace("→ ", ""), F.m, 10, isDragged ? C.accent : C.text));
      mini.appendChild(rr);
    }

    c.appendChild(mini);

    // Toast demo for step 2
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
      toast.appendChild(txt("Sort cleared → manual order active", F.m, 10, C.text));
      toast.appendChild(spacer(1, 1)); toast.children[toast.children.length - 1].layoutGrow = 1;
      toast.appendChild(txt("Undo", F.s, 10, C.accent, undefined, 0.5));
      c.appendChild(toast);
    }

    return c;
  }

  s5Flow.appendChild(flowStep(1,
    "Sort active",
    "User has Sort by Name ↑. Rows in sorted order. Column header shows accent ↑.",
    "sorted"
  ));
  s5Flow.appendChild(flowStep(2,
    "Drag starts → sort clears",
    "User drags day_02 up. Threshold 4px. Sort indicator drops; visible order freezes into ui.order. Toast appears with Undo (3s window).",
    "dragging"
  ));
  s5Flow.appendChild(flowStep(3,
    "Drag complete",
    "day_02 is now between 02_Stills and 03_Archive. Other rows keep the frozen (previously sorted) order. ui.order persists to JSON.",
    "manual"
  ));

  s5.appendChild(s5Flow);

  // Why + guards block
  const s5Why = vSec(contentW);
  s5Why.cornerRadius = 8;
  setFill(s5Why, C.panel, 1);
  setStroke(s5Why, C.accent, 0.4, 1);
  s5Why.paddingTop = 18; s5Why.paddingBottom = 18;
  s5Why.paddingLeft = 22; s5Why.paddingRight = 22;
  s5Why.itemSpacing = 10;

  const whyHead = hHug();
  whyHead.itemSpacing = 10;
  whyHead.counterAxisAlignItems = "CENTER";
  const whyChip = figma.createFrame();
  whyChip.resize(6, 6); whyChip.cornerRadius = 3;
  setFill(whyChip, C.accent, 1);
  whyHead.appendChild(whyChip);
  whyHead.appendChild(txt("Why + guards", F.s, 12, C.white, undefined, 0.5));
  s5Why.appendChild(whyHead);

  const bulletW = contentW - 44;
  const whyB1 = hSec(bulletW);
  whyB1.itemSpacing = 8;
  whyB1.counterAxisAlignItems = "MIN";
  whyB1.appendChild(txt("•", F.b, 12, C.accent));
  whyB1.appendChild(txtW(
    "Single-gesture UX. No \"clear sort first, then drag\". User just tenders the gesture, sort steps aside.",
    F.r, 11, C.text, bulletW - 16, 16
  ));
  s5Why.appendChild(whyB1);

  const whyB2 = hSec(bulletW);
  whyB2.itemSpacing = 8;
  whyB2.counterAxisAlignItems = "MIN";
  whyB2.appendChild(txt("•", F.b, 12, C.accent));
  whyB2.appendChild(txtW(
    "Order is preserved as seen on screen — not reshuffled to some unknown baseline. This removes the \"where did my rows go?\" panic.",
    F.r, 11, C.text, bulletW - 16, 16
  ));
  s5Why.appendChild(whyB2);

  const whyB3 = hSec(bulletW);
  whyB3.itemSpacing = 8;
  whyB3.counterAxisAlignItems = "MIN";
  whyB3.appendChild(txt("•", F.b, 12, C.accent));
  whyB3.appendChild(txtW(
    "Pattern from Finder / Notion / ClickUp — users already know it. No new mental model.",
    F.r, 11, C.text, bulletW - 16, 16
  ));
  s5Why.appendChild(whyB3);

  s5Why.appendChild(spacer(1, 4));
  s5Why.appendChild(txt("Guards", F.s, 11, C.amber, undefined, 0.5));

  const whyG1 = hSec(bulletW);
  whyG1.itemSpacing = 8;
  whyG1.counterAxisAlignItems = "MIN";
  whyG1.appendChild(txt("⚡", F.r, 11, C.amber));
  whyG1.appendChild(txtW(
    "Micro-toast is mandatory. Without it the sort indicator just vanishes and the user doesn't learn the pattern. 3–5s auto-dismiss.",
    F.r, 11, C.text, bulletW - 16, 16
  ));
  s5Why.appendChild(whyG1);

  const whyG2 = hSec(bulletW);
  whyG2.itemSpacing = 8;
  whyG2.counterAxisAlignItems = "MIN";
  whyG2.appendChild(txt("⚡", F.r, 11, C.amber));
  whyG2.appendChild(txtW(
    "Drag threshold ≥ 4px before sort clears. A stray mousedown on a row must not wipe the active sort.",
    F.r, 11, C.text, bulletW - 16, 16
  ));
  s5Why.appendChild(whyG2);

  const whyG3 = hSec(bulletW);
  whyG3.itemSpacing = 8;
  whyG3.counterAxisAlignItems = "MIN";
  whyG3.appendChild(txt("⚡", F.r, 11, C.amber));
  whyG3.appendChild(txtW(
    "Undo button inside the toast for the first 3s — one-click rollback to the sort and the prior ui.order.",
    F.r, 11, C.text, bulletW - 16, 16
  ));
  s5Why.appendChild(whyG3);

  s5.appendChild(s5Why);

  // Sort fields reference table (kept from v1)
  const s5Table = vSec(contentW);
  s5Table.itemSpacing = 0;
  s5Table.cornerRadius = 8;
  s5Table.clipsContent = true;
  setStroke(s5Table, C.border, 1, 1);

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

  function sortRow(f, src, dir, noteTxt) {
    const rr = hSec(contentW);
    rr.paddingLeft = 16; rr.paddingRight = 16;
    rr.paddingTop = 10; rr.paddingBottom = 10;
    rr.itemSpacing = 12;
    setFill(rr, C.panel, 1);
    const c1 = cell(140, txt(f, F.s, 12, C.text), "MIN"); c1.resize(140, 20);
    const c2 = cell(240, txt(src, F.r, 11, C.textDim), "MIN"); c2.resize(240, 20);
    const c3 = cell(200, txt(dir, F.r, 11, C.textDim), "MIN"); c3.resize(200, 20);
    const c4Txt = txtW(noteTxt, F.r, 11, C.textDim, contentW - 140 - 240 - 200 - 32 - 36, 16);
    const c4 = cell(contentW - 140 - 240 - 200 - 32 - 36, c4Txt, "MIN");
    c4.resize(contentW - 140 - 240 - 200 - 32 - 36, 20);
    rr.appendChild(c1); rr.appendChild(c2); rr.appendChild(c3); rr.appendChild(c4);
    return rr;
  }
  s5Table.appendChild(sortRow("Name", "folder.name", "A→Z / Z→A", "Primary sort for quick navigation."));
  s5Table.appendChild(divider(contentW, C.border, 0.6));
  s5Table.appendChild(sortRow("Date added", "folder.addedAt (ISO)", "new→old / old→new", "SheepDog-owned timestamp. NOT fs.statSync birthtime — cross-platform unreliable."));
  s5Table.appendChild(divider(contentW, C.border, 0.6));
  s5Table.appendChild(sortRow("Path", "folder.path (resolved abs)", "A→Z / Z→A", "For users who think in file tree terms."));
  s5Table.appendChild(divider(contentW, C.border, 0.6));
  s5Table.appendChild(sortRow("State", "computed STATE dot", "problems first / ok first", "Triage: 'where's red?' — all issues rise to top in one click."));
  s5.appendChild(s5Table);

  root.appendChild(s5);

  // ==================================================
  // SECTION 6 — Action icon legend (unchanged from v1)
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
    "Eye open = this folder participates in Auto Sync. Eye closed = still visible and manually syncable, but watcher ignores.", C.accent));
  s6Row2.appendChild(iconLegend("×", "Remove row",
    "Deletes the row from JSON. If auto-sync was active, plain confirm modal. No cover — dialog is enough.", C.textDim));
  s6Row2.appendChild(iconLegend("○ / ●", "Color label",
    "Optional Premiere color label. Propagates to imported items' labels. Null by default (hollow dot).", C.labelCerulean));

  s6.appendChild(s6Row);
  s6.appendChild(s6Row2);
  root.appendChild(s6);

  // ==================================================
  // SECTION 7 — Settings panel — modal overlay (NEW v1.2)
  //   Full-screen modal. Canonical source for all global config.
  //   Header-bar toggles (Auto Sync, Show targets) are shortcuts that
  //   flip the same underlying state — they are NOT independent truth.
  //   Five sections: General · Import filters · Behavior · Danger zone
  //   · Advanced. Save/Cancel footer.
  //
  //   globalOverride mechanism — NEW: when global Auto Sync = ON, per-row
  //   👁 renders at opacity 0.4 (dormant — state preserved and still
  //   editable, but currently not in effect). Distinction from subLocked:
  //   subLocked uses color-swap (fill → textDim) meaning "you can't change
  //   this." globalOverride uses opacity-reduce on the native accent
  //   meaning "you can still change it, it just doesn't apply right now."
  //   Different mechanisms → different meanings. Stacked = doubly dormant.
  // ==================================================
  const s7 = vSec(contentW);
  s7.itemSpacing = 16;
  s7.appendChild(sectionTitle(
    "7. Settings panel — modal overlay, canonical config",
    "Full-panel overlay (not a drawer, not a tab). Five sections. All global state lives here; header toggles are shortcuts pointing at the same store. Global Auto Sync = ON dims per-row 👁 to opacity 0.4 (dormant) — opacity-reduce ≠ color-swap, so it reads distinctly from subLocked.",
    contentW
  ));

  const s7Row = hSec(contentW);
  s7Row.itemSpacing = 32;
  s7Row.counterAxisAlignItems = "MIN";

  // ===== Local helpers — scoped to §7 =====
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
    lblWrap.appendChild(txt(labelTxt, F.m, 12, C.text));
    if (subTxt) lblWrap.appendChild(txtW(subTxt, F.r, 10, C.textDim, PANEL_W - 160, 14));
    rw.appendChild(lblWrap);
    rw.appendChild(control);
    return rw;
  }
  // New watch folder defaults — big checkbox cell with column label below
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
    col.appendChild(txt(label, F.s, 9, isOn ? C.text : C.textDim, undefined, 0.8));
    return col;
  }
  function radio(isOn) {
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
  function filterChip(label) {
    const f = hHug();
    f.paddingTop = 3; f.paddingBottom = 3;
    f.paddingLeft = 8; f.paddingRight = 6;
    f.cornerRadius = 3;
    f.itemSpacing = 4;
    f.counterAxisAlignItems = "CENTER";
    setFill(f, C.panelHi, 1);
    setStroke(f, C.border, 1, 1);
    f.appendChild(txt(label, F.m, 10, C.text));
    f.appendChild(txt("×", F.r, 10, C.textFade));
    return f;
  }
  function addChip(label) {
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
    f.appendChild(txt(value, F.m, 11, C.text));
    f.appendChild(txt("▾", F.r, 9, C.textDim));
    return f;
  }

  // ===== Left: Settings modal mockup =====
  const s7Panel = vSec(PANEL_W);
  s7Panel.cornerRadius = 8;
  s7Panel.clipsContent = true;
  setFill(s7Panel, C.panel, 1);
  setStroke(s7Panel, C.border, 1, 1);
  s7Panel.itemSpacing = 0;

  // ---- Header bar ----
  const s7Head = hSec(PANEL_W);
  s7Head.paddingLeft = 20; s7Head.paddingRight = 14;
  s7Head.paddingTop = 14; s7Head.paddingBottom = 14;
  s7Head.counterAxisAlignItems = "CENTER";
  s7Head.primaryAxisAlignItems = "SPACE_BETWEEN";
  setFill(s7Head, C.panelAlt, 1);

  const s7HeadLeft = hHug();
  s7HeadLeft.itemSpacing = 10;
  s7HeadLeft.counterAxisAlignItems = "CENTER";
  s7HeadLeft.appendChild(txt("⚙", F.m, 16, C.text));
  s7HeadLeft.appendChild(txt("Settings", F.s, 14, C.white));
  s7Head.appendChild(s7HeadLeft);

  const s7HeadClose = figma.createFrame();
  s7HeadClose.resize(22, 22);
  s7HeadClose.cornerRadius = 3;
  s7HeadClose.layoutMode = "HORIZONTAL";
  s7HeadClose.layoutSizingHorizontal = "FIXED";
  s7HeadClose.layoutSizingVertical = "FIXED";
  s7HeadClose.primaryAxisAlignItems = "CENTER";
  s7HeadClose.counterAxisAlignItems = "CENTER";
  s7HeadClose.fills = [];
  s7HeadClose.appendChild(txt("×", F.r, 16, C.textDim));
  s7Head.appendChild(s7HeadClose);
  s7Panel.appendChild(s7Head);
  s7Panel.appendChild(divider(PANEL_W, C.border, 1));

  // ---- 7.1 General ----
  const s71 = settingsSection("7.1 General");

  // Defaults row: label + explanation, then row of 8 big checkboxes
  const s71DefLabel = vSec(PANEL_W - 40);
  s71DefLabel.itemSpacing = 2;
  s71DefLabel.appendChild(txt("New watch folder defaults", F.m, 12, C.text));
  s71DefLabel.appendChild(txtW("Initial per-column state applied to every newly added folder. Change anytime per row — these defaults only fire at row creation.", F.r, 10, C.textDim, PANEL_W - 40, 14));
  s71.appendChild(s71DefLabel);

  const s71DefRow = hSec(PANEL_W - 40);
  s71DefRow.itemSpacing = 18;
  s71DefRow.counterAxisAlignItems = "CENTER";
  s71DefRow.primaryAxisAlignItems = "MIN";
  s71DefRow.appendChild(defaultsCell("WATCH", true, C.accent));
  s71DefRow.appendChild(defaultsCell("AUTO-SYNC", true, C.accent));
  s71DefRow.appendChild(defaultsCell("TARGETS", true, C.accent));
  s71DefRow.appendChild(defaultsCell("SUB", false));
  s71DefRow.appendChild(defaultsCell("REL", false));
  s71DefRow.appendChild(defaultsCell("SEQ", true, C.accent));
  s71DefRow.appendChild(defaultsCell("FLT", false));
  s71DefRow.appendChild(defaultsCell("DEL", false));
  s71.appendChild(s71DefRow);

  s71.appendChild(divider(PANEL_W - 40, C.border, 0.4));

  s71.appendChild(settingsRow(
    "Auto Sync (global)",
    "Canonical store. Header strip toggle is a shortcut to this row. When ON, per-row 👁 becomes dormant.",
    toggle(true)
  ));
  s71.appendChild(settingsRow(
    "Show target bins column",
    "Uncheck to collapse the → Target column. Folder chips still show on hover.",
    toggle(true)
  ));

  s7Panel.appendChild(s71);
  s7Panel.appendChild(divider(PANEL_W, C.border, 0.6));

  // ---- 7.2 Import filters ----
  const s72 = settingsSection("7.2 Import filters");

  // Mode selector row (radio pair)
  const s72Mode = hSec(PANEL_W - 40);
  s72Mode.itemSpacing = 24;
  s72Mode.counterAxisAlignItems = "CENTER";
  s72Mode.primaryAxisAlignItems = "SPACE_BETWEEN";
  const s72ModeLbl = vHug();
  s72ModeLbl.itemSpacing = 2;
  s72ModeLbl.appendChild(txt("Mode", F.m, 12, C.text));
  s72ModeLbl.appendChild(txtW("How the Extensions list is interpreted.", F.r, 10, C.textDim, 220, 14));
  s72Mode.appendChild(s72ModeLbl);

  const s72Radios = hHug();
  s72Radios.itemSpacing = 18;
  s72Radios.counterAxisAlignItems = "CENTER";
  const rA = hHug();
  rA.itemSpacing = 6;
  rA.counterAxisAlignItems = "CENTER";
  rA.appendChild(radio(true));
  rA.appendChild(txt("Allowlist — nothing except", F.m, 11, C.text));
  s72Radios.appendChild(rA);
  const rD = hHug();
  rD.itemSpacing = 6;
  rD.counterAxisAlignItems = "CENTER";
  rD.appendChild(radio(false));
  rD.appendChild(txt("Denylist — everything except", F.m, 11, C.textDim));
  s72Radios.appendChild(rD);
  s72Mode.appendChild(s72Radios);
  s72.appendChild(s72Mode);

  // Extensions block
  const s72ExtLabel = vSec(PANEL_W - 40);
  s72ExtLabel.itemSpacing = 2;
  s72ExtLabel.appendChild(txt("Extensions", F.m, 12, C.text));
  s72ExtLabel.appendChild(txtW("Click × to remove, + to add. Per-folder overrides — v1.1.", F.r, 10, C.textDim, PANEL_W - 40, 14));
  s72.appendChild(s72ExtLabel);

  const s72ChipsA = hSec(PANEL_W - 40);
  s72ChipsA.itemSpacing = 6;
  s72ChipsA.counterAxisAlignItems = "CENTER";
  s72ChipsA.primaryAxisAlignItems = "MIN";
  ["mp4", "mov", "mxf", "avi", "wav", "mp3", "aif", "png", "jpg", "tif"].forEach(function(ext) {
    s72ChipsA.appendChild(filterChip("." + ext));
  });
  s72.appendChild(s72ChipsA);

  const s72ChipsB = hSec(PANEL_W - 40);
  s72ChipsB.itemSpacing = 6;
  s72ChipsB.counterAxisAlignItems = "CENTER";
  s72ChipsB.primaryAxisAlignItems = "MIN";
  ["psd", "ai", "exr", "dpx", "r3d", "ari"].forEach(function(ext) {
    s72ChipsB.appendChild(filterChip("." + ext));
  });
  s72ChipsB.appendChild(addChip("+ add"));
  s72.appendChild(s72ChipsB);

  s72.appendChild(divider(PANEL_W - 40, C.border, 0.4));

  // Hidden / service files — orthogonal to extension filters
  const s72HiddenRow = hSec(PANEL_W - 40);
  s72HiddenRow.itemSpacing = 12;
  s72HiddenRow.counterAxisAlignItems = "CENTER";
  s72HiddenRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  const s72HLbl = vHug();
  s72HLbl.itemSpacing = 2;
  s72HLbl.appendChild(txt("Skip hidden & service files", F.m, 12, C.text));
  s72HLbl.appendChild(txtW(".DS_Store · Thumbs.db · desktop.ini · ~$* · *.tmp · *.part. Separate from Extensions — always applies when on.", F.r, 10, C.textDim, PANEL_W - 160, 14));
  s72HiddenRow.appendChild(s72HLbl);
  s72HiddenRow.appendChild(toggle(true));
  s72.appendChild(s72HiddenRow);

  s7Panel.appendChild(s72);
  s7Panel.appendChild(divider(PANEL_W, C.border, 0.6));

  // ---- 7.3 Behavior ----
  const s73 = settingsSection("7.3 Behavior");
  s73.appendChild(settingsRow(
    "Safety cover duration",
    "Seconds after cover lifts before auto re-lock. Applies to FLT and DEL covers.",
    numberDrop("4 s")
  ));
  s73.appendChild(divider(PANEL_W - 40, C.border, 0.3));
  s73.appendChild(settingsRow(
    "Undo toast duration",
    "Window after a destructive commit to hit Undo before OS trash becomes the only recovery.",
    numberDrop("3 s")
  ));
  s73.appendChild(divider(PANEL_W - 40, C.border, 0.3));
  s73.appendChild(settingsRow(
    "awaitWriteFinish threshold",
    "chokidar settle time. Wait N seconds of no size change before treating a file as ready to import.",
    numberDrop("2 s")
  ));

  s7Panel.appendChild(s73);
  s7Panel.appendChild(divider(PANEL_W, C.border, 0.6));

  // ---- 7.4 Danger zone ----
  const s74Wrap = vSec(PANEL_W);
  s74Wrap.paddingLeft = 20; s74Wrap.paddingRight = 20;
  s74Wrap.paddingTop = 18; s74Wrap.paddingBottom = 18;
  s74Wrap.itemSpacing = 10;
  s74Wrap.appendChild(txt("7.4 Danger zone", F.s, 12, C.white, undefined, 0.4));

  const s74Shell = vSec(PANEL_W - 40);
  s74Shell.cornerRadius = 6;
  setFill(s74Shell, C.canvas, 1);
  setStroke(s74Shell, C.danger, 0.55, 1);
  s74Shell.paddingTop = 14; s74Shell.paddingBottom = 14;
  s74Shell.paddingLeft = 16; s74Shell.paddingRight = 16;
  s74Shell.itemSpacing = 10;

  const s74Head = hHug();
  s74Head.itemSpacing = 8;
  s74Head.counterAxisAlignItems = "CENTER";
  s74Head.appendChild(txt("⚠", F.b, 12, C.danger));
  s74Head.appendChild(txt("Enable destructive actions", F.s, 11, C.danger, undefined, 0.6));
  s74Shell.appendChild(s74Head);

  const s74ToggleRow = hSec(PANEL_W - 72);
  s74ToggleRow.itemSpacing = 12;
  s74ToggleRow.counterAxisAlignItems = "CENTER";
  s74ToggleRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  const s74TLbl = vHug();
  s74TLbl.itemSpacing = 2;
  s74TLbl.appendChild(txt("Enable DEL column", F.m, 12, C.text));
  s74TLbl.appendChild(txtW("Per-row destructive toggle. Deletes source files → OS trash (48 h recovery on Windows). Safety cover on first click. Never inherits from parent.", F.r, 10, C.textDim, PANEL_W - 160, 14));
  s74ToggleRow.appendChild(s74TLbl);
  s74ToggleRow.appendChild(toggle(true));
  s74Shell.appendChild(s74ToggleRow);

  s74Wrap.appendChild(s74Shell);
  s7Panel.appendChild(s74Wrap);
  s7Panel.appendChild(divider(PANEL_W, C.border, 0.6));

  // ---- 7.5 Advanced / Logs ----
  const s75 = settingsSection("7.5 Advanced / Logs");

  const s75PathCol = vSec(PANEL_W - 40);
  s75PathCol.itemSpacing = 4;
  s75PathCol.appendChild(txt("Debug log path", F.m, 12, C.text));
  const s75PathBox = hSec(PANEL_W - 40);
  s75PathBox.paddingTop = 7; s75PathBox.paddingBottom = 7;
  s75PathBox.paddingLeft = 10; s75PathBox.paddingRight = 10;
  s75PathBox.cornerRadius = 3;
  s75PathBox.counterAxisAlignItems = "CENTER";
  setFill(s75PathBox, C.canvas, 1);
  setStroke(s75PathBox, C.border, 1, 1);
  s75PathBox.appendChild(txt("%APPDATA%/Adobe/CEP/extensions/sheepdog/sheepdog-debug.log", F.r, 10, C.textDim));
  s75PathCol.appendChild(s75PathBox);
  s75.appendChild(s75PathCol);

  const s75BtnRow = hSec(PANEL_W - 40);
  s75BtnRow.itemSpacing = 10;
  s75BtnRow.counterAxisAlignItems = "CENTER";
  s75BtnRow.primaryAxisAlignItems = "MIN";
  s75BtnRow.appendChild(btnGhost("Save log…"));
  s75BtnRow.appendChild(btnGhost("Dump now"));
  s75BtnRow.appendChild(btnGhost("Open log folder"));
  s75.appendChild(s75BtnRow);

  s7Panel.appendChild(s75);
  s7Panel.appendChild(divider(PANEL_W, C.border, 1));

  // ---- Footer: Cancel + Save ----
  const s7Foot = hSec(PANEL_W);
  s7Foot.paddingLeft = 20; s7Foot.paddingRight = 20;
  s7Foot.paddingTop = 14; s7Foot.paddingBottom = 14;
  s7Foot.counterAxisAlignItems = "CENTER";
  s7Foot.primaryAxisAlignItems = "MAX";
  s7Foot.itemSpacing = 10;
  setFill(s7Foot, C.panelAlt, 1);
  s7Foot.appendChild(btnGhost("Cancel"));
  s7Foot.appendChild(btnPrimary("Save changes"));
  s7Panel.appendChild(s7Foot);

  s7Row.appendChild(s7Panel);

  // ===== Right column: rules + globalOverride demo + decision log =====
  const s7Notes = vSec(contentW - PANEL_W - 32);
  s7Notes.itemSpacing = 12;

  // Rules card
  const s7Rules = vSec(contentW - PANEL_W - 32);
  s7Rules.cornerRadius = 8;
  setFill(s7Rules, C.panel, 1);
  setStroke(s7Rules, C.accent, 0.4, 1);
  s7Rules.paddingTop = 16; s7Rules.paddingBottom = 16;
  s7Rules.paddingLeft = 20; s7Rules.paddingRight = 20;
  s7Rules.itemSpacing = 8;
  const s7RulesHead = hHug();
  s7RulesHead.itemSpacing = 10;
  s7RulesHead.counterAxisAlignItems = "CENTER";
  const s7RulesDot = figma.createFrame();
  s7RulesDot.resize(6, 6); s7RulesDot.cornerRadius = 3;
  setFill(s7RulesDot, C.accent, 1);
  s7RulesHead.appendChild(s7RulesDot);
  s7RulesHead.appendChild(txt("Settings rules", F.s, 12, C.white, undefined, 0.5));
  s7Rules.appendChild(s7RulesHead);

  const s7RulesBullets = [
    "Modal overlay — covers the entire panel UI. Not a drawer, not a tab. Room for future options and single focus.",
    "SOT: Settings owns every global flag. Header Auto Sync toggle is a shortcut that flips the same underlying state — no duplicate truth.",
    "New folder defaults applies only at row creation. Changing defaults later does NOT rewrite existing rows.",
    "Filter mode (Allowlist / Denylist) is project-wide in v1.0. Per-folder overrides punted to v1.1 — usually over-engineering for MVP.",
    "Hidden/service file skip is a separate switch — orthogonal to extension filters. Always applies when on; changing extensions doesn't force re-managing .DS_Store rules.",
    "Danger zone uses red border as the gate-warning — it sits OUTSIDE the column and IS the warning gate. Column itself stays calm (activation-only red).",
    "Save / Cancel both close the modal. Unsaved changes → confirm before Cancel. No auto-save.",
  ];
  for (let i = 0; i < s7RulesBullets.length; i++) {
    const rr = hSec(contentW - PANEL_W - 72);
    rr.itemSpacing = 8;
    rr.counterAxisAlignItems = "MIN";
    rr.appendChild(txt("•", F.b, 12, C.accent));
    rr.appendChild(txtW(s7RulesBullets[i], F.r, 11, C.text, contentW - PANEL_W - 96, 16));
    s7Rules.appendChild(rr);
  }
  s7Notes.appendChild(s7Rules);

  // globalOverride demo card
  const s7Override = vSec(contentW - PANEL_W - 32);
  s7Override.cornerRadius = 8;
  setFill(s7Override, C.panel, 1);
  setStroke(s7Override, C.amber, 0.45, 1);
  s7Override.paddingTop = 16; s7Override.paddingBottom = 16;
  s7Override.paddingLeft = 20; s7Override.paddingRight = 20;
  s7Override.itemSpacing = 10;
  const s7OverHead = hHug();
  s7OverHead.itemSpacing = 10;
  s7OverHead.counterAxisAlignItems = "CENTER";
  const s7OverDot = figma.createFrame();
  s7OverDot.resize(6, 6); s7OverDot.cornerRadius = 3;
  setFill(s7OverDot, C.amber, 1);
  s7OverHead.appendChild(s7OverDot);
  s7OverHead.appendChild(txt("globalOverride — dormant 👁", F.s, 12, C.white, undefined, 0.5));
  s7Override.appendChild(s7OverHead);
  s7Override.appendChild(txtW(
    "When global Auto Sync = ON, per-folder 👁 renders at opacity 0.4. Stored state is preserved and still editable — click to change the value — but it is currently not influencing sync decisions. " +
    "Mechanism contrast: subLocked uses color-swap (accent → textDim) reading as \"you can't change this.\" globalOverride uses opacity-reduce on the native accent, reading as \"you can change it, it just doesn't apply right now.\" Two axes → two meanings. Stacked = doubly dormant.",
    F.r, 11, C.textDim, contentW - PANEL_W - 72, 16
  ));

  // Two-row demo: global OFF vs global ON
  function demoRow(label, watchOp) {
    const d = hSec(contentW - PANEL_W - 72);
    d.paddingTop = 6; d.paddingBottom = 6;
    d.paddingLeft = 10; d.paddingRight = 10;
    d.cornerRadius = 3;
    d.itemSpacing = 10;
    d.counterAxisAlignItems = "CENTER";
    d.primaryAxisAlignItems = "SPACE_BETWEEN";
    setFill(d, C.panelAlt, 1);

    const leftGrp = hHug();
    leftGrp.itemSpacing = 8;
    leftGrp.counterAxisAlignItems = "CENTER";
    leftGrp.appendChild(labelDot(C.labelForest));
    leftGrp.appendChild(txt(label, F.m, 11, C.text));
    d.appendChild(leftGrp);

    const acts = hHug();
    acts.itemSpacing = 6;
    acts.counterAxisAlignItems = "CENTER";
    acts.appendChild(actionIcon("↻", C.text, 1));
    acts.appendChild(actionIcon("⌕", C.text, 1));
    acts.appendChild(actionIcon("🧲", C.text, 1));
    acts.appendChild(actionIcon("👁", C.accent, watchOp));
    d.appendChild(acts);
    return d;
  }
  const s7OverDemo = vSec(contentW - PANEL_W - 72);
  s7OverDemo.itemSpacing = 6;
  s7OverDemo.paddingTop = 4;
  s7OverDemo.appendChild(demoRow("reelA  ·  global Auto Sync = OFF", 1));
  s7OverDemo.appendChild(demoRow("reelA  ·  global Auto Sync = ON", 0.4));
  s7Override.appendChild(s7OverDemo);
  s7Notes.appendChild(s7Override);

  // Decision log
  const s7Why = vSec(contentW - PANEL_W - 32);
  s7Why.cornerRadius = 8;
  setFill(s7Why, C.panel, 1);
  setStroke(s7Why, C.border, 1, 1);
  s7Why.paddingTop = 16; s7Why.paddingBottom = 16;
  s7Why.paddingLeft = 20; s7Why.paddingRight = 20;
  s7Why.itemSpacing = 8;
  const s7WhyHead = hHug();
  s7WhyHead.itemSpacing = 10;
  s7WhyHead.counterAxisAlignItems = "CENTER";
  const s7WhyDot = figma.createFrame();
  s7WhyDot.resize(6, 6); s7WhyDot.cornerRadius = 3;
  setFill(s7WhyDot, C.textDim, 1);
  s7WhyHead.appendChild(s7WhyDot);
  s7WhyHead.appendChild(txt("Decision log — 2026-04-20", F.s, 12, C.white, undefined, 0.5));
  s7Why.appendChild(s7WhyHead);
  s7Why.appendChild(txtW(
    "Modal over drawer: Settings is rare-but-consequential. A drawer steals horizontal space from the folder list; a tab drops context. A modal gives room for future options and single focus. " +
    "SOT in Settings, shortcut in header: observed failure mode in Watchtower — Auto Sync flipped from two independent places gets confusing. One canonical store, multiple entry points. " +
    "Both filter modes matter: Denylist for \"import everything except these\" (loose shoots, unknown codecs). Allowlist for \"strict pipeline, only these\". Not an either/or. " +
    "Hidden/service skip as its own switch: orthogonal concept. Changing extension filters shouldn't force re-managing .DS_Store / Thumbs.db every time. " +
    "globalOverride via opacity, not color-swap: subLocked already owns textDim. Adding a second dormant mechanism requires a second visual axis. Opacity is universally readable as \"muted\" and preserves the per-row state's native color — the user still sees what they set.",
    F.r, 11, C.textDim, contentW - PANEL_W - 72, 16
  ));
  s7Notes.appendChild(s7Why);

  s7Row.appendChild(s7Notes);
  s7.appendChild(s7Row);
  root.appendChild(s7);

  // ---------- Position & focus ----------
  root.x = 100;
  root.y = 100;
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("SheepDog Panel v1.2 Concept generated");
}

main();
