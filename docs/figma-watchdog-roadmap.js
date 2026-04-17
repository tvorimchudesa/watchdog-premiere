// SheepDog — Architecture & Roadmap document for Figma Scripter
// Run in Figma via Scripter plugin

async function main() {
  // 1. Load fonts
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // Constants
  const W = 1200;
  const PAD = 48;
  const CARD_R = 16;

  // Colors (RGB 0-1)
  const C = {
    bg:       { r: 0.10, g: 0.10, b: 0.18 },
    cardBg:   { r: 0.14, g: 0.14, b: 0.22 },
    white:    { r: 1, g: 1, b: 1 },
    muted:    { r: 0.63, g: 0.63, b: 0.69 },
    blue:     { r: 0.24, g: 0.56, b: 0.96 },
    green:    { r: 0.29, g: 0.87, b: 0.50 },
    amber:    { r: 0.98, g: 0.80, b: 0.08 },
    red:      { r: 0.97, g: 0.33, b: 0.38 },
    orange:   { r: 0.96, g: 0.52, b: 0.18 },
    purple:   { r: 0.65, g: 0.40, b: 0.95 },
    cyan:     { r: 0.20, g: 0.82, b: 0.86 },
  };

  // Fonts
  const F = {
    r: { family: "Inter", style: "Regular" },
    s: { family: "Inter", style: "Semi Bold" },
    b: { family: "Inter", style: "Bold" },
  };

  // --- Helpers (battle-tested patterns from figma-scripter skill) ---

  function setFill(node, color, opacity) {
    node.fills = [{ type: "SOLID", color, opacity: opacity !== undefined ? opacity : 1 }];
  }

  function setShadow(node, opacity, yOff, radius) {
    node.effects = [{
      type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: opacity },
      offset: { x: 0, y: yOff }, radius, spread: 0, visible: true,
      blendMode: "NORMAL",
    }];
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

  function pill(label, color) {
    const f = hHug();
    f.paddingTop = 4; f.paddingBottom = 4;
    f.paddingLeft = 12; f.paddingRight = 12;
    f.counterAxisAlignItems = "CENTER";
    setFill(f, color, 0.15);
    f.cornerRadius = 20;
    f.appendChild(txt(label, F.s, 11, color));
    return f;
  }

  function divider(w, color, opacity) {
    const r = figma.createRectangle();
    r.resize(w, 1);
    r.fills = [{ type: "SOLID", color: color, opacity: opacity || 0.15 }];
    return r;
  }

  function makeCard(w, accent) {
    const card = figma.createFrame();
    card.resize(w, 10);
    card.layoutMode = "VERTICAL";
    card.layoutSizingVertical = "HUG";
    card.layoutSizingHorizontal = "FIXED";
    card.cornerRadius = CARD_R;
    card.clipsContent = true;
    setFill(card, C.cardBg);
    card.strokes = [{ type: "SOLID", color: accent, opacity: 0.25 }];
    card.strokeWeight = 1;
    setShadow(card, 0.12, 4, 16);
    card.paddingTop = 20; card.paddingBottom = 20;
    card.paddingLeft = 24; card.paddingRight = 24;
    card.itemSpacing = 12;
    return card;
  }

  // --- Build Document ---

  // Root frame
  const root = figma.createFrame();
  root.name = "SheepDog — Architecture & Roadmap";
  root.resize(W, 10);
  root.layoutMode = "VERTICAL";
  root.layoutSizingHorizontal = "FIXED";
  root.layoutSizingVertical = "HUG";
  setFill(root, C.bg);
  root.paddingTop = PAD; root.paddingBottom = PAD;
  root.paddingLeft = PAD; root.paddingRight = PAD;
  root.itemSpacing = 40;

  const contentW = W - PAD * 2;

  // ===== TITLE SECTION =====
  const titleSec = vSec(contentW);
  titleSec.itemSpacing = 8;
  titleSec.appendChild(txt("SHEEPDOG", F.b, 48, C.white, 56, 2));
  titleSec.appendChild(txt("Premiere Pro CEP Extension — Architecture & Roadmap", F.r, 18, C.muted, 26));
  titleSec.appendChild(divider(contentW, C.white, 0.1));
  root.appendChild(titleSec);

  // ===== ARCHITECTURE SECTION =====
  const archSec = vSec(contentW);
  archSec.itemSpacing = 20;

  const archHeader = hHug();
  archHeader.itemSpacing = 12;
  archHeader.counterAxisAlignItems = "CENTER";
  archHeader.appendChild(txt("Architecture", F.b, 28, C.white, 34));
  archHeader.appendChild(pill("Apple Principles", C.purple));
  archSec.appendChild(archHeader);

  // Architecture — layer cards
  const layers = [
    {
      name: "UI Layer",
      accent: C.blue,
      tag: "HTML/CSS/JS",
      modules: [
        { name: "Main Panel", desc: "Sync / AutoSync toggle, progress bar, right-click menu" },
        { name: "Folders Panel", desc: "Watch folders CRUD, drag & drop from Explorer and Premiere bins" },
        { name: "Settings Dialog", desc: "Tabs: General, Allowed Files, Ignored Folders (regex)" },
      ],
    },
    {
      name: "Core Logic",
      accent: C.green,
      tag: "Node.js",
      modules: [
        { name: "Watcher", desc: "chokidar fs watcher, emits file:changed events. Waits for file write completion." },
        { name: "EventBus", desc: "Pub/Sub router. Decouples UI from pipeline. SRP: routing only." },
        { name: "Importer", desc: "Extension filter + batch queue. Defense in Depth: double-filters with Watcher." },
        { name: "FolderManager", desc: "Config CRUD, path resolution (absolute/relative). SOT: watchFolders.json" },
        { name: "SettingsManager", desc: "JSON persistence for global settings. SOT: settings.json" },
      ],
    },
    {
      name: "Bridge",
      accent: C.orange,
      tag: "CEP",
      modules: [
        { name: "CSInterface", desc: "evalScript() calls to ExtendScript. Event dispatch between JS and host." },
        { name: "ExtendScript", desc: "importFiles(), bin creation, label assignment, metadata write." },
      ],
    },
    {
      name: "Host Application",
      accent: C.red,
      tag: "Premiere Pro",
      modules: [
        { name: "Premiere Pro API", desc: "Project bins, media items, labels, timeline. Read-only SOT for project state." },
      ],
    },
  ];

  for (const layer of layers) {
    const card = makeCard(contentW, layer.accent);
    card.name = layer.name;

    // Card header row
    const hdr = hHug();
    hdr.itemSpacing = 12;
    hdr.counterAxisAlignItems = "CENTER";
    hdr.appendChild(txt(layer.name, F.b, 20, layer.accent));
    hdr.appendChild(pill(layer.tag, layer.accent));
    card.appendChild(hdr);

    card.appendChild(divider(contentW - 48, layer.accent, 0.15));

    // Modules grid (2 columns)
    const gridW = contentW - 48;
    const colW = Math.floor((gridW - 16) / 2);

    let row = null;
    for (let i = 0; i < layer.modules.length; i++) {
      if (i % 2 === 0) {
        row = hSec(gridW);
        row.itemSpacing = 16;
        card.appendChild(row);
      }

      const mod = layer.modules[i];
      const modCard = figma.createFrame();
      modCard.resize(colW, 10);
      modCard.layoutMode = "VERTICAL";
      modCard.layoutSizingVertical = "HUG";
      modCard.layoutSizingHorizontal = "FIXED";
      modCard.cornerRadius = 10;
      setFill(modCard, layer.accent, 0.08);
      modCard.paddingTop = 12; modCard.paddingBottom = 12;
      modCard.paddingLeft = 14; modCard.paddingRight = 14;
      modCard.itemSpacing = 6;
      modCard.name = mod.name;

      modCard.appendChild(txt(mod.name, F.s, 14, C.white));
      modCard.appendChild(txtW(mod.desc, F.r, 12, C.muted, colW - 28, 18));
      row.appendChild(modCard);
    }

    archSec.appendChild(card);
  }

  root.appendChild(archSec);

  // ===== PRINCIPLES SECTION =====
  const princSec = vSec(contentW);
  princSec.itemSpacing = 16;
  princSec.appendChild(txt("Apple Principles Applied", F.b, 28, C.white, 34));

  const principles = [
    { name: "SRP", color: C.green, text: "Each module does ONE thing. Watcher watches. Importer imports. EventBus routes. No module has 'and' in its job description." },
    { name: "Minimal Surface", color: C.blue, text: "Events carry only { path, type }. Importer receives file paths + target bin, not folder configs. UI gets display-ready data." },
    { name: "Defense in Depth", color: C.red, text: "Extension filter in Watcher AND in Importer. Path validation in FolderManager AND in Bridge. Never one layer of protection." },
    { name: "SOT", color: C.amber, text: "watchFolders.json = single source for folder configs. settings.json = single source for global settings. Premiere project = SOT for bins." },
    { name: "DRY", color: C.purple, text: "Shared Bridge module for all ExtendScript calls. Common event format across all modules. No premature abstractions." },
  ];

  const princColW = Math.floor((contentW - 12 * 2) / 3);

  // Row 1: first 3 principles
  const princRow1 = hSec(contentW);
  princRow1.itemSpacing = 12;
  princRow1.counterAxisAlignItems = "MIN";

  // Row 2: last 2 principles
  const princRow2 = hSec(contentW);
  princRow2.itemSpacing = 12;
  princRow2.counterAxisAlignItems = "MIN";

  for (let i = 0; i < principles.length; i++) {
    const p = principles[i];
    const pCard = vSec(princColW);
    setFill(pCard, C.cardBg);
    pCard.cornerRadius = 12;
    pCard.strokes = [{ type: "SOLID", color: p.color, opacity: 0.2 }];
    pCard.strokeWeight = 1;
    pCard.paddingTop = 16; pCard.paddingBottom = 16;
    pCard.paddingLeft = 16; pCard.paddingRight = 16;
    pCard.itemSpacing = 8;
    pCard.name = p.name;

    const pHdr = hHug();
    pHdr.itemSpacing = 8;
    pHdr.counterAxisAlignItems = "CENTER";
    pHdr.appendChild(pill(p.name, p.color));
    pCard.appendChild(pHdr);
    pCard.appendChild(txtW(p.text, F.r, 12, C.muted, princColW - 32, 18));

    if (i < 3) princRow1.appendChild(pCard);
    else princRow2.appendChild(pCard);
  }

  princSec.appendChild(princRow1);
  princSec.appendChild(princRow2);
  root.appendChild(princSec);

  // ===== ROADMAP SECTION =====
  const roadSec = vSec(contentW);
  roadSec.itemSpacing = 20;
  roadSec.appendChild(txt("Roadmap", F.b, 28, C.white, 34));

  const phases = [
    {
      name: "MVP",
      timeline: "Week 1-2",
      accent: C.green,
      status: "DONE",
      features: [
        { text: "CEP extension skeleton (manifest.xml, panel.html, host.jsx)", done: true },
        { text: "Main panel: Sync button + AutoSync toggle + progress bar", done: true },
        { text: "Watch Folders panel: add/remove folders, path display", done: true },
        { text: "Watcher module: chokidar-based file monitoring", done: true },
        { text: "Importer module: batch import via ExtendScript bridge", done: true },
        { text: "Extension filter: whitelist of allowed file types", done: true },
        { text: "Subfolder import with sub-bin hierarchy", done: true },
        { text: "Config persistence: watchFolders.json per project", done: true },
      ],
    },
    {
      name: "v1.0",
      timeline: "Week 3-5",
      accent: C.amber,
      status: "ACTIVE",
      features: [
        { text: "Mirror Deletions toggle: file removed from disk → remove from bin (OFF by default)", done: false },
        { text: "Drag & drop folders from Explorer/Finder onto panel", done: false },
        { text: "Global settings fallback → per-project override", done: false },
        { text: "FLT checkbox: flatten subfolders into single bin", done: false },
        { text: "Color label assignment per watch folder", done: false },
        { text: "Ignored folders list with regex support", done: false },
        { text: "Settings dialog: General / Allowed Files / Ignored Folders tabs", done: false },
        { text: "Toast notifications on import complete", done: false },
        { text: "RP checkbox: relative path mode for templates", done: false },
        { text: "SEQ checkbox: image sequence detection & import", done: false },
      ],
    },
    {
      name: "v1.5",
      timeline: "Week 6-8",
      accent: C.red,
      status: "FUTURE",
      features: [
        { text: "Camera card auto-detection: RED, ARRI, P2, Panasonic", done: false },
        { text: "Span media import without duplicates", done: false },
        { text: "Link existing Premiere bins via drag & drop", done: false },
        { text: "Auto-detect parent folder path from bin contents", done: false },
        { text: "Import date metadata (sortable datetime format)", done: false },
        { text: "Show import options for PSD/Illustrator files", done: false },
        { text: "Folder state tracking: online / offline / new", done: false },
        { text: "Search and filter in Watch Folders panel", done: false },
      ],
    },
  ];

  for (const phase of phases) {
    const card = makeCard(contentW, phase.accent);
    card.name = phase.name;

    // Phase header
    const phHdr = hHug();
    phHdr.itemSpacing = 12;
    phHdr.counterAxisAlignItems = "CENTER";
    phHdr.appendChild(txt(phase.name, F.b, 22, phase.accent));
    phHdr.appendChild(pill(phase.timeline, phase.accent));
    phHdr.appendChild(pill(phase.status, phase.accent));
    card.appendChild(phHdr);

    card.appendChild(divider(contentW - 48, phase.accent, 0.15));

    // Feature list
    for (const feat of phase.features) {
      const fRow = hHug();
      fRow.itemSpacing = 10;
      fRow.counterAxisAlignItems = "CENTER";

      // Checkbox indicator
      const check = figma.createFrame();
      check.resize(18, 18);
      check.layoutMode = "HORIZONTAL";
      check.layoutSizingHorizontal = "FIXED";
      check.layoutSizingVertical = "FIXED";
      check.primaryAxisAlignItems = "CENTER";
      check.counterAxisAlignItems = "CENTER";
      check.cornerRadius = 4;
      if (feat.done) {
        setFill(check, C.green, 0.2);
        check.appendChild(txt("\u2713", F.b, 12, C.green));
      } else {
        setFill(check, C.white, 0.08);
      }
      fRow.appendChild(check);

      fRow.appendChild(txt(feat.text, F.r, 13, feat.done ? C.green : C.muted, 20));
      card.appendChild(fRow);
    }

    roadSec.appendChild(card);
  }

  root.appendChild(roadSec);

  // ===== FOOTER =====
  const footer = vSec(contentW);
  footer.itemSpacing = 4;
  footer.appendChild(divider(contentW, C.white, 0.1));
  footer.appendChild(txt("github.com/tvorimchudesa/sheepdog-premiere", F.r, 12, C.muted));
  footer.appendChild(txt("Architecture follows Apple-like coding principles: SRP, Minimal Surface, Defense in Depth, SOT, DRY", F.r, 11, C.muted));
  root.appendChild(footer);

  // Position and focus
  root.x = 100;
  root.y = 100;
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("SheepDog Roadmap generated \u2714");
}

main();
