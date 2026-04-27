// SheepDog — Plugin logo concepts v1 · Figma Scripter sandbox
// 5 directions × 5 scales (1×/2×/4×/12× dark + 12× light) on one canvas.
// Pixel-art base grids: 16×16 for #1-4, 24×16 for #5.
// 1× = production panel size (Premiere typically renders 16-22px).
// 12× = showcase for marketing/store/onboarding.
// Workflow: pick the resonant concept → v2 sharpens pixels + exports.

async function main() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  const DOC_W = 1320;
  const PAD = 40;
  const CARD_W = DOC_W - 2 * PAD;

  const C = {
    canvas:     { r: 0.08,  g: 0.08,  b: 0.09  },
    panel:      { r: 0.145, g: 0.145, b: 0.157 },
    panelLight: { r: 0.95,  g: 0.95,  b: 0.96  },  // marketing-bg sim
    border:     { r: 0.30,  g: 0.30,  b: 0.32  },
    text:       { r: 0.93,  g: 0.93,  b: 0.95  },
    textDim:    { r: 0.60,  g: 0.60,  b: 0.63  },
    ink:        { r: 0.10,  g: 0.10,  b: 0.13  },
    inkSoft:    { r: 0.18,  g: 0.18,  b: 0.21  },
    wool:       { r: 0.93,  g: 0.93,  b: 0.95  },
    woolDim:    { r: 0.78,  g: 0.78,  b: 0.81  },
    accent:     { r: 0.078, g: 0.471, b: 0.949 },
    pink:       { r: 0.96,  g: 0.7,   b: 0.78  },
    cheek:      { r: 0.92,  g: 0.55,  b: 0.65  },
  };
  const F = {
    r: { family: "Inter", style: "Regular" },
    m: { family: "Inter", style: "Medium" },
    s: { family: "Inter", style: "Semi Bold" },
    b: { family: "Inter", style: "Bold" },
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

  // ---------- Pixel grid renderer ----------
  // rows: array of strings (each char = palette key). palette: { ch: {color, opacity?} } or null for transparent.
  // Frame has NO layoutMode — children positioned via .x/.y.
  function pixelGrid(rows, palette, scale) {
    const cols = rows[0].length;
    const f = figma.createFrame();
    f.resize(cols * scale, rows.length * scale);
    f.fills = [];
    f.clipsContent = true;
    for (let r = 0; r < rows.length; r++) {
      const line = rows[r];
      for (let c = 0; c < cols; c++) {
        const ch = line[c];
        const def = palette[ch];
        if (!def) continue;  // transparent
        const rect = figma.createRectangle();
        rect.resize(scale, scale);
        rect.x = c * scale;
        rect.y = r * scale;
        rect.fills = [{ type: "SOLID", color: def.color, opacity: def.opacity != null ? def.opacity : 1 }];
        f.appendChild(rect);
      }
    }
    return f;
  }

  // ---------- Labeled icon (pixel grid + bg swatch + size label) ----------
  function labeledIcon(rows, palette, scale, label, bgColor) {
    const v = vHug();
    v.itemSpacing = 6;
    v.counterAxisAlignItems = "CENTER";

    const cols = rows[0].length;
    const totalW = cols * scale;
    const totalH = rows.length * scale;
    const pad = scale >= 8 ? 16 : (scale >= 4 ? 8 : 4);

    const bg = figma.createFrame();
    bg.resize(totalW + pad * 2, totalH + pad * 2);
    bg.cornerRadius = scale >= 4 ? 6 : 2;
    bg.fills = [{ type: "SOLID", color: bgColor || C.panel, opacity: 1 }];
    bg.layoutMode = "HORIZONTAL";
    bg.layoutSizingHorizontal = "FIXED";
    bg.layoutSizingVertical = "FIXED";
    bg.primaryAxisAlignItems = "CENTER";
    bg.counterAxisAlignItems = "CENTER";
    bg.appendChild(pixelGrid(rows, palette, scale));
    v.appendChild(bg);

    const lblColor = bgColor === C.panelLight ? { r: 0.4, g: 0.4, b: 0.43 } : C.textDim;
    v.appendChild(txt(label, F.r, 10, lblColor));
    return v;
  }

  // ---------- Showcase row: 1×/2×/4×/12× dark + 12× light ----------
  function showcaseRow(rows, palette) {
    const wrap = hHug();
    wrap.itemSpacing = 16;
    wrap.counterAxisAlignItems = "MAX";  // bottom-align for varying heights
    wrap.appendChild(labeledIcon(rows, palette, 1, "1× actual"));
    wrap.appendChild(labeledIcon(rows, palette, 2, "2× retina"));
    wrap.appendChild(labeledIcon(rows, palette, 4, "4×"));
    wrap.appendChild(labeledIcon(rows, palette, 12, "12× dark"));
    wrap.appendChild(labeledIcon(rows, palette, 12, "12× light", C.panelLight));
    return wrap;
  }

  // ---------- Design card ----------
  function designCard(title, mood, ident, bestSize, rows, palette) {
    const card = vSec(CARD_W);
    card.cornerRadius = 12;
    setFill(card, C.panel, 1);
    setStroke(card, C.border, 0.5, 1);
    card.paddingTop = 24; card.paddingBottom = 24;
    card.paddingLeft = 28; card.paddingRight = 28;
    card.itemSpacing = 18;

    card.appendChild(txt(title, F.b, 18, C.text, 24));
    card.appendChild(showcaseRow(rows, palette));

    const meta = vSec(CARD_W - 56);
    meta.itemSpacing = 6;
    function metaLine(tag, text, tagColor) {
      const line = hSec(CARD_W - 56);
      line.itemSpacing = 10;
      line.counterAxisAlignItems = "MIN";
      const tagBox = vHug();
      tagBox.itemSpacing = 0;
      tagBox.appendChild(txt(tag, F.s, 10, tagColor, 14));
      line.appendChild(tagBox);
      const tWrap = vSec(CARD_W - 56 - 110);
      tWrap.appendChild(txtW(text, F.r, 12, C.textDim, CARD_W - 56 - 110, 18));
      line.appendChild(tWrap);
      return line;
    }
    meta.appendChild(metaLine("MOOD", mood, C.accent));
    meta.appendChild(metaLine("IDENTIFIES", ident, C.accent));
    meta.appendChild(metaLine("BEST SIZE", bestSize, C.accent));
    card.appendChild(meta);

    return card;
  }

  // ========================================================================
  // DESIGNS
  // ========================================================================

  // 1 · SHEEP INVADER (frontal) — 16×16
  // Owl rams' horns top, round wool body, two short legs. Eyes negative-space.
  const grid1 = [
    "................",
    "....##......##..",
    "...#..#....#..#.",
    "...#..#....#..#.",
    "...#..########..",
    "..############..",
    "..############..",
    "..##.##..##.##..",
    "..############..",
    "..############..",
    "..##########....",
    "..##.######.##..",
    "..##.##..##.##..",
    "....##....##....",
    "....##....##....",
    "................",
  ];
  const pal1 = { "#": { color: C.ink }, ".": null };

  // 2 · SIDE SHEEP B&W (Stardew flat) — 16×16
  // White wool blob facing right, dark head + 4 legs. Single eye dot.
  const grid2 = [
    "................",
    "................",
    ".......WWWW.....",
    "......WWWWWWW...",
    ".....WWWWWWWWW..",
    "....WWWWWWWWWW#.",
    "...WWWWWWWWWWW##",
    "...WWWWWWWWWWW##",
    "...WWWWWWWWWWW#.",
    "...WWWWWWWWWWW##",
    "....WWWWWWWWWW##",
    ".....WWWWWWWW...",
    ".....W#W#W#W#...",
    ".....W#W#W#W#...",
    "......#.#.#.#...",
    "................",
  ];
  const pal2 = { "W": { color: C.wool }, "#": { color: C.ink }, ".": null };

  // 3 · SHEEP-SKULL MASK (mono front) — 16×16
  // Skull silhouette with curl horns, hollow eyes, teeth pattern.
  const grid3 = [
    "................",
    "....######......",
    "...#......#.....",
    "..#........#....",
    "..#..####..#....",
    "..#.######.#....",
    ".##.######.##...",
    ".#.########.#...",
    ".#.########.#...",
    "..##########....",
    "..#.######.#....",
    "...##.##.##.....",
    "....######......",
    ".....####.......",
    "................",
    "................",
  ];
  const pal3 = { "#": { color: C.text }, ".": null };  // white-on-dark for skeleton vibe

  // 4 · KAWAII LAMB (front, color) — 16×16
  // Round wool, pink ears, pink cheeks, cute eyes.
  const grid4 = [
    "................",
    "................",
    "....@@@@@@......",
    "...@WWWWWW@.....",
    "..@WWWWWWWW@....",
    ".@PWWWWWWWWP@...",
    ".@WWWWWWWWWW@...",
    ".@WW#WWWW#WW@...",
    ".@WWW.WW.WWW@...",
    ".@WWWWNNWWWW@...",
    ".@WWWWWWWWWW@...",
    "..@WWWWWWWW@....",
    "...@WWWWWW@.....",
    "....@@@@@@......",
    "................",
    "................",
  ];
  const pal4 = {
    "@": { color: C.inkSoft },
    "W": { color: C.wool },
    "P": { color: C.pink },
    "N": { color: C.cheek },
    "#": { color: C.ink },
    ".": null,
  };

  // 5 · DETAILED SIDE GOAT (large canvas) — 24×16
  // Goat profile facing right, small horn, woolly body, 4 legs with hooves.
  const grid5 = [
    "........................",
    "........................",
    ".................##.....",
    "................#..#....",
    "....WWWWWWWWWWWWWW#WWW..",
    "....WWWWWWWWWWWWWW##WW..",
    "...WWWWWWWWWWWWWWWWWW#..",
    "...WWWWWWWWWWWWWWWWWW#..",
    "....WWWWWWWWWWWWWWWWW...",
    "....WWWWWWWWWWWWWWWWW...",
    "....##WW##WW##WW##WW....",
    "....##WW##WW##WW##WW....",
    ".....##..##..##..##.....",
    "........................",
    "........................",
    "........................",
  ];
  const pal5 = { "W": { color: C.wool }, "#": { color: C.ink }, ".": null };

  // ========================================================================
  // BUILD ROOT
  // ========================================================================

  const root = figma.createFrame();
  root.name = "SheepDog — Plugin Logo Concepts v1";
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
  titleSec.appendChild(txt("SheepDog — Plugin logo concepts v1", F.b, 32, C.text, 40));
  titleSec.appendChild(txtW(
    "5 directions, each rendered at 1× (panel-actual) / 2× (retina) / 4× / 12× (showcase) on dark + light backgrounds. " +
    "1× tests whether the silhouette holds in production size. Pick the resonant one — v2 sharpens pixels and prepares export.",
    F.r, 13, C.textDim, CARD_W, 19
  ));
  titleSec.appendChild(divider(CARD_W, C.text, 0.08));
  root.appendChild(titleSec);

  root.appendChild(designCard(
    "1 · Sheep Invader (frontal)",
    "Mрачно-милый, прямой Space Invader hommage. Овечьи ушки/рожки заменяют антенны invader-а; компактное wool-тело с двумя ножками внизу. Frontal symmetry упрощает 16×16 рендер.",
    "Очень высокая в 1×. Силуэт держится: рожки + округлое тело + ноги читаются уже в 16px. Negative-space глаза читаются с 2× и выше.",
    "16-32px (Premiere panel). Темный фон Premiere — родная среда. Маркетинг тоже работает (12× showcase).",
    grid1, pal1
  ));

  root.appendChild(designCard(
    "2 · Side Sheep B&W (Stardew flat)",
    "Чистый flat, B&W. Wool oval + dark head с мордой направо + 4 ноги. Узнаваемо «это овца» по силуэту. Frontа нет — vibe изобразительный, не персонажный.",
    "Высокая в 32px+. В 16px ноги начинают сливаться (4 палочки в 4 пикселя — risk merge), но общий силуэт «животное на ножках» ещё read-at-glance.",
    "32-128px. Отлично в маркетинговых баннерах и onboarding. В Premiere panel — borderline; v2 может потребоваться сокращение деталей.",
    grid2, pal2
  ));

  root.appendChild(designCard(
    "3 · Sheep-Skull mask (mono front)",
    "Винтажный/таёжный, monochrome. Череп-маска с curl horns + hollow eyes + teeth pattern. Mood «watchdog over assets» с edge — не cute, но запоминается.",
    "Средняя. Силуэт черепа держится в 16px; зубы и horn curl сольются в один блок — но общий зловещий контур остаётся узнаваемым как «animal skull».",
    "32-64px. Mood-driven — не для casual users, но сильный character. В store/marketing работает; в panel — depends на target audience.",
    grid3, pal3
  ));

  root.appendChild(designCard(
    "4 · Kawaii lamb (front, color)",
    "Cute / kawaii, цветная. Розовые ушки + щёчки + кругленькое тело. Friendly mascot direction — \"adorable assistant\" а не \"professional tool\".",
    "Низкая в 16px. Цвета сливаются (anti-alias на 4 пикселях невозможен), мордочка теряется в общем pink/white blob. В 64px+ читается отлично.",
    "64-256px. Marketing/store/onboarding. НЕ подходит для Premiere dark panel icon — слишком цветная и cute для editor UI.",
    grid4, pal4
  ));

  root.appendChild(designCard(
    "5 · Side detailed goat (large canvas)",
    "Большой канвас (24×16), не для иконки. Детальный side-profile: small horn + woolly body + 4 legs с hooves. Для splash screens, hero illustrations, onboarding moments.",
    "Очень низкая в 16px (hooves исчезают, общий силуэт нечитаемый). Нужны 64px+ чтобы детали заиграли. В 192px+ — full impact.",
    "128-512px. Hero/splash/onboarding — НЕ для panel icon. Парный кандидат к одному из 1-3 для маркетинговой системы.",
    grid5, pal5
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
  footer.appendChild(noteLine("Все grids 16×16, кроме #5 (24×16). Меньшая base-resolution = строжайший пиксель-art discipline; больше rooms — больше деталей, но плохая идентифицируемость в маленьком."));
  footer.appendChild(noteLine("Premiere panel icons обычно 16-22px (CEP) или 18-24px (UXP). 1× preview слева в каждой карточке = production-actual. Если не читается там — кандидат под маркетинг, не под panel."));
  footer.appendChild(noteLine("Тёмный bg = Premiere panel. Светлый bg на 12× — store/marketing/light theme check. Anti-aliasing OFF (pixel-perfect rasterization) — это часть стиля."));
  footer.appendChild(noteLine("После выбора (next session): точим один концепт в v2 — корректируем пиксели, готовим export (PNG @1x/2x/4x + SVG fallback для CEP)."));
  root.appendChild(footer);

  root.x = 100;
  root.y = 100;
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("SheepDog logo v1 — 5 concepts ready");
}

main();
