# Panel Architecture Concept — v1

- **Status:** WIP / draft for Figma
- **Started:** 2026-04-19
- **Supersedes:** MVP-CHECKLIST §18.5 "Per-folder controls strip (AE-style collapsible)"
- **Author context:** iterative design session (Opus + user), watchtower ref + AE/Media Encoder patterns

## 0. Scope

Этот документ — концепт пересборки главной панели SheepDog: переход от простого list-view с inline actions к **columnar tree-view** со стабильной сеткой контролов per folder. Затрагивает:

- Layout (header / tree / progress)
- Row anatomy (columns, actions, state indicators)
- Поведенческие правила override (SUB / FLT / REL / SEQ)
- Data model (`sheepdog-folders.json` — lazy materialization, tree via parentId)
- Safety cover механика (таймер, single-unlock)

**Не трогаем** здесь: Bridge, Importer, Watcher, Logger — они остаются как в §1-§14.6 + §23.

---

## 1. Motivation — почему отказались от §18.5 collapsible strip

Прошлая итерация: каждое per-folder действие (§17 color, §19 manual sync, §20 danger zone) добавляет **свою иконку** в row, скрытую за collapsible arrow.

Проблемы:
1. **Hidden density.** Pro-юзер хочет видеть state 20 папок одним взглядом — скрытые контролы требуют клик для диагностики
2. **Стрелка как единый tax** на все контролы (нельзя показать одни и скрыть другие)
3. **State vs Action混淆**. SUB/FLT/SEQ — это **состояния папки** (чекбоксы). Manual Sync / Relink — это **действия** (кнопки). Collapsible strip их смешивал

Новая модель: **columnar** (таблица с колонками), где state-чекбоксы всегда видны, а actions живут в dedicated колонке. Reference — Watchtower (см. скрин в сессии). Принцип: **state always-on, actions always-on, inheritance shown via typography**.

---

## 2. Layout (full panel)

```
┌───────────────────────────────────────────────────────────────────────────┐
│  [SheepDog]        [🔍 Search]      Auto Sync [ON]   [Check & Import]  [⚙]│  ← sticky header
├───────────────────────────────────────────────────────────────────────────┤
│ ST  ⌄  NAME           PATH              SUB REL SEQ FLT  LABEL  ACTIONS ×│  ← column header
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [folder tree rows, own scroll]                                           │
│                                                                           │  flex: 1, overflow-y: auto
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│  ▼ Progress — idle                                                        │  ← progress panel
│  (expands when importing: chunk log, per-folder progress)                 │  collapsible, own scroll
├───────────────────────────────────────────────────────────────────────────┤
│  status: Ready                                         [Save log]         │  ← footer
└───────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Три зоны scroll / sticky

- **Header** — sticky (никогда не уходит)
- **Tree** — собственный `overflow-y: auto`, занимает `flex: 1`
- **Progress panel** — collapsible, при raskryt'e собственный scroll для длинного лога
- **Footer** — sticky (status + Save log)

При одновременном активном импорте и скролле списка: обе зоны независимы. Media Encoder metaphor.

---

## 3. Row anatomy — колонки слева направо

| Col | Name | Width | Contents | Purpose |
|-----|------|-------|----------|---------|
| 1 | **ST** | 14px | ● state dot | watching / missing / scanning / disabled |
| 2 | **TREE** | 14px | `⌄` / `>` | expand/collapse children (только если есть children на диске) |
| 3 | **NAME** | flex (min 120) | editable label | display name (default — basename) |
| 4 | **PATH** | flex (min 200) | abs/rel path | где смотрим |
| 5 | **SUB** | 28px | checkbox | захватывать subfolders (recursive import) |
| 6 | **REL** | 28px | checkbox | хранить rel-to-project путь вместо abs |
| 7 | **SEQ** | 28px | checkbox | image sequence detection (`name.NNNN.ext` → 1 clip) |
| 8 | **FLT** | 28px | checkbox + safety cover | flatten sub-bins в свой bin |
| 9 | **LABEL** | 80px | color picker `○` | Premiere color label |
| 10 | **ACTIONS** | auto | `↻ ⌕ 🧲 👁` | Manual Sync / Relink / Gather Sheep / Auto-watch toggle |
| 11 | **REMOVE** | 20px | `×` | удалить row |

Порядок NAME → PATH (не PATH → NAME как было раньше).

### 3.1. STATE dot (col 1) — семантика

Приоритет сверху вниз (верхнее выигрывает если совпали):

| State | Glyph | Color | Meaning |
|-------|-------|-------|---------|
| Disabled | ● | `--text-muted` (grey) | Row `enabled=false` — выключен целиком |
| Missing path | ● | `--danger` (pink/red) | Путь не существует — нужен relink (⌕) |
| Scanning | ◌ | `--accent` rotate | Идёт активный scan/import этой папки |
| Eye closed | ○ | `--text-muted` hollow | Watch-поток игнорирует (auto-watch OFF per folder) |
| Idle OK | ● | `--success` (green) | Всё хорошо, watcher работает |

**Важно:** STATE dot ≠ LABEL color. LABEL в колонке 9, независимая.

### 3.2. Path-lost visual

Когда `state = Missing path`:
- Row border: `1px solid var(--danger)`
- Row backdrop: `rgba(244, 67, 54, 0.08)`
- Path колонка: текст красный, ikonka warning перед путём
- ⌕ (Relink) в ACTIONS подсвечен accent — прямая подсказка

### 3.3. Inherited vs overridden (visual)

- Значение наследуется от parent → checkbox **faded** (opacity 0.4), курсив для текстовых значений
- Юзер явно проставил → checkbox **solid**, regular
- Host на hover: tooltip "Inherited from [parent name]" / "Overridden here"

Это даёт юзеру мгновенный снимок: "где я менял настройки, а где просто дефолты родителя".

---

## 4. Tree UX

### 4.1. Expand / collapse

- `⌄` expanded, `>` collapsed (унификация с AE / VSC / любым tree-view)
- Click — toggle
- При expand: **всегда видны** children из disk (lazy rendering, но UI показывает все, что есть на FS)
- При collapse: children скрыты **полностью** (не dim, не grey — отсутствуют в DOM для скорости)

### 4.2. Persistence expand state

Сохраняется в `sheepdog-folders.json`: per-row поле `ui.expanded: true|false`. Причина — юзер на проекте в 1 год работы не должен каждый день раскрывать 10 уровней.

При panel reopen: читаем expanded set, рендерим согласно.

### 4.3. Children у которых нет row в JSON (lazy materialized)

- По дефолту показываются с **унаследованными** настройками (faded checkboxes)
- Клик на любую их настройку → создаётся row в JSON, запись становится bold
- Нельзя `×` удалить virtual row — там просто нечего удалять
- Row становится "реальным" когда юзер делает любой override

### 4.4. Duplicate detection (Q4 resolved)

Сценарий: юзер добавил `03_Assets` как root, потом хочет добавить `03_Assets/01_Video` как ещё один root.

**Решение (MVP):** запрещаем. Show toast: *"01_Video is already watched as a subfolder of 03_Assets — expand it in the tree to configure."*

**v1.1+:** разрешаем, но **с предупреждением и аудитом потенциальных конфликтов**: система объясняет юзеру как это повлияет на дедуп, bin-placement, FLT inheritance. Гибкость > запрет, но требует нормальный audit UX — не MVP.

---

## 5. Override rules — behavioral spec

### 5.1. SUB (recursive capture)

- **SUB=ON на row** — файлы из subfolders этой папки подхватываются (либо направляются в sub-bins, либо flatten — по FLT этой же row'ы)
- **SUB=OFF на row** — только файлы ПРЯМО В ЭТОЙ папке, subfolders ignored
- **Inheritance**: child row по дефолту наследует SUB от parent. При override — child wins for child's scope

**Conflict**: parent SUB=OFF + child row существует с собственными настройками.
- Child row **не активен** пока parent SUB=OFF (не импортируется)
- Visual: child row при expand видно (grey out), но tooltip "parent SUB is off — ignored"
- Settings **сохранены** — при parent SUB → ON всё восстанавливается

**Safety cover на SUB**: **да**. Не от удаления файлов (мы их не удаляем — см. 5.5), а от silent miss. Юзер случайно выключил SUB у `Day 02`, съёмка продолжается, файлы не попадают — через 3 часа замечает. Cover + timer = "подумай, ты точно хочешь остановить захват subfolders?"

### 5.2. FLT (flatten into own bin) — v2 semantics (resolved 2026-04-19)

**FLT=ON на row означает:** эта row **не имеет собственного bin**. Её файлы всплывают в bin ближайшего row-предка с `FLT=OFF`.

**Правило резолва target bin для файла:**
1. Файл лежит в `diskPath` внутри какой-то watched папки (row или virtual)
2. Находим ближайший row-предок (включая саму row, если она не FLT=ON) с `FLT=OFF`
3. Файл идёт в bin этого предка

**Важно:** FLT — **caskad по дереву rows**, не row-local. Если цепочка `Footage(OFF) → day1(ON) → RAW(OFF)`, то:

| File | Nearest FLT=OFF ancestor | Lands in bin |
|------|--------------------------|--------------|
| `Footage/x.mp4` | Footage | Footage |
| `Footage/day1/y.mp4` | Footage (day1 flat) | Footage |
| `Footage/day1/RAW/z.mxf` | RAW | RAW (nested in Footage) |

**Обратный override:**
- `Footage(OFF) → day1(OFF) → RAW(ON)` → файлы из RAW поднимаются в day1 bin, RAW собственный bin не создаёт.

**Миграция при toggle FLT:** уже-импортированные файлы перемещаются (`moveItem`) между bin'ами автоматически. Timeline references не ломаются — API сохраняет ссылки на file source, bin location не структурна, это UI-представление. Опустевший bin удаляется.

**Почему не v1 (row-local, child всегда gets own sub-bin):**
v1 давал гарантию «1 watch-row = 1 bin», проще ментально. Но на глубоких деревьях (`Footage/day1/morning/cam_A/`) принуждал к nested bin'ам, даже если юзер просит flat asset pool. v2 позволяет держать tree в UI (навигация, overrides) и одновременно flat в Premiere bins. Отвергнутая v1 — см. decision log в §5.2.2.

**Safety cover на FLT**: **да**. Toggle = массовое перемещение items. Cover + таймер + счётчик файлов (см. §5.2.1 guard 5) предотвращают fat finger.

### 5.2.1. UI guards для FLT (обязательны для v2)

Каскад детерминирован, но ментально нетривиален. Без guards юзер будет искать «где мой bin для day1». Нужно:

1. **Effective target preview в row.** У `FLT=ON` row показать резолвленный target: `→ Footage` (имя ближайшего не-flat предка) рядом с NAME или в отдельном sub-слоте. Без этого ряд выглядит «пустым» в плане назначения.

2. **Hover tooltip с target.** Наведение на любую row → `Files land in: [bin name]` (с breadcrumb'ом если target — sub-bin).

3. **«Show effective targets» toggle в header.** Кнопка-переключатель рядом с Sort: включил → у каждой row подсвечивается резолвленный target bin. Debug/audit режим для «почему мои клипы не там, где я жду».

4. **STATE dot учитывает FLT=ON row без bin'а.** Row с `FLT=ON` by definition не имеет собственного bin — для неё нельзя показывать `bin missing` warning. STATE резолвится по эффективному bin'у предка: bin предка OK → ряд зелёный; bin предка потерян → ряд красный по наследству. Tooltip на dot: *«No own bin (flat). Inherits state from Footage bin.»*

5. **Migration хинт при toggle FLT.** Safety cover кроме таймера показывает счётчик: *«12 файлов будут перемещены из `day1` bin в `Footage` bin. Таймлайны не пострадают.»* Юзер видит масштаб до подтверждения.

### 5.2.2. Decision log

- **2026-04-19** — выбрана v2 (caskad). Обсуждение: v1 давал предсказуемость `1 row = 1 bin`, но ломал сценарий «глубокое дерево → плоский bin pool». v2 выигрывает на реальных проектах, риски (invisible bin, unclear target) закрыты UI-guards §5.2.1.
- **Отвергнуто в v2:** row-local модель (β из предыдущей версии концепта) — слишком жёсткая для сложных деревьев.

### 5.3. REL (relative path storage)

- Путь watch folder хранится в JSON как abs (`C:/footage/day1`) или rel (`./footage/day1`)
- REL=ON: при загрузке панели путь резолвится от project dir → абсолют
- Use case: перенёс проект на другой комп / `.prproj` в соседнюю папку → REL folders auto-heal

**Best practice (Q9):**
- Default REL=**OFF** (абсолютные пути, предсказуемо для всех)
- Юзер включает REL когда shares проект через cloud / team workflow
- Если REL=ON и путь всё равно не резолвится (папка не перенесена вместе с проектом) → STATE = Missing path, ⌕ Relink вручную

Не safety cover. Настройка сама по себе ничего не ломает.

### 5.4. SEQ (image sequence mode)

- SEQ=ON: importer детектит паттерны `name.NNNN.ext` и импортит как sequence (см. §16 в checklist)
- SEQ=OFF: те же файлы импортятся как отдельные стиллы
- Inheritance: child наследует; override прозрачно

Не safety cover. Переключение не деструктивно (файлы уже импортированы остаются, новые импортятся по новому режиму).

### 5.5. SUB OFF → уже импортированные файлы

**Решение (Q — "API позволяет?")**: Да, Premiere API даёт `deleteItem`. Но **мы не удаляем автоматически**.

Причина (apple-coding P0 data integrity > UI symmetry):
- SUB=OFF значит "перестать захватывать новое", **не** "отменить прошлое"
- Auto-delete = destructive op — принадлежит Danger Zone, не regular toggle
- Timeline references могут указывать на уже импортированные items → авто-удаление ломает проект

**Если юзер хочет cleanup**: Settings → Danger Zone → "Clean bins matching disabled subfolders" (manual explicit action, с preview).

---

## 6. Safety cover механика — унификация

### 6.1. Где применяется

| Control | Cover? | Reason |
|---------|--------|--------|
| SUB | Yes | silent miss — перестаёт захватывать, юзер не замечает |
| FLT | Yes | массово перемещает items между bin'ами (caskad v2); счётчик «N файлов будут перемещены» в cover — см. §5.2.1 guard 5 |
| DEL (hidden) | Yes | destructive mirror-delete |
| Gather Sheep (🧲) | Yes | массово передвигает bins в проекте |
| Remove row (×) | Plain confirm modal | destructive при active auto-sync, проще диалогом |
| All Danger Zone actions | Yes | by definition destructive |
| REL / SEQ / auto-watch 👁 | No | non-destructive, idempotent |

### 6.2. Timer (Q12 confirmed)

- After unlock (state `unlocked`), **4s таймер**
- Второй клик в пределах 4s → `active` (действие исполняется)
- 4s истекло без клика → auto re-lock в `locked`
- Visual (nice-to-have, не MVP): countdown ring по периметру safety-box, фейдит за 4s

### 6.3. Single unlock rule

- В момент времени только **один** cover в состоянии `unlocked` во всей панели
- Клик на другой cover → старый автоматически re-lock → новый unlock
- Причина: юзер не должен забывать, какие covers он открыл. Фокус внимания = один

### 6.4. Reset triggers

Cover re-lock'ается также при:
- Смене проекта (panel reload)
- Старте/отмене импорта (фокус переключается)
- Явном клике на `×` remove или любой другой destructive action

---

## 7. Global header

### 7.1. Элементы

- **Logo / title** — SheepDog (короткий)
- **Search box** `🔍` — search by folder name (Q1 confirmed)
  - Live-filter tree rows по substring в name
  - Если match внутри collapsed parent → parent auto-expands для показа
  - Clear — show all
- **Auto Sync toggle** — global on/off (overrides per-folder `👁`)
- **Check & Import** button — ex-"Sync All" (Q6 confirmed rename)
  - Tooltip: *"Re-scan all watched folders. Imports new files, skips duplicates (dedupe-aware)."*
- **Settings gear** `⚙` — открывает Settings dialog (§18 + Danger Zone tab)

### 7.2. Per-folder Auto-watch (`👁`) interaction

- Global Auto Sync **OFF** → 👁 на rows скрыт или `display: none` (бессмысленно)
- Global Auto Sync **ON** → 👁 виден у каждого row
  - Open (default) — watcher видит эту папку
  - Closed — watcher её пропускает, но Check & Import всё равно её обходит
- Не safety cover (ephemeral exclusion, easy reversal)

### 7.3. Force Sync All removed

"Force" label — scary, в §18.5 старого было обсуждение. Ограничиваем label до "Check & Import". Если понадобится **принудительное reimport** (ignore dedupe) — это отдельный action в Danger Zone, редко нужный.

---

## 8. Progress panel — dual scroll layout

### 8.1. Collapsed state (idle)

Одна строка:
```
▼ Progress — idle (last: Imported 148, 7 skipped · 2m ago)
```

Height: ~28px, на одном уровне с footer-ом.

### 8.2. Expanded state (idle)

```
▼ Progress — idle
  Last run: 2026-04-19 14:22 · 148 imported / 7 skipped / 0 errors
  Last chunk: bin "03_Assets/01_Video" · 5 files · 3.2s
  Next auto-sync: in 2s (Auto Sync ON)
```

Height: ~120px.

### 8.3. Active import

```
▼ Progress — Check & Import running
  Overall: ████████▒▒▒▒  68% · 7/10 chunks · 102/148 files
  ▸ bin "03_Assets/01_Video" — 5/5 done
  ▸ bin "03_Assets/02_Image" — 8/8 done
  ▸ bin "03_Assets/03_Image_Sequences" — scanning…   [Cancel]
```

Height: до ~200px с own scroll если chunks > 10.

### 8.4. Tech

CSS: panel — `flex-shrink: 0; overflow-y: auto; max-height: 40vh`. Collapse toggle через data-attr. Tree remains `flex: 1` сверху, независимый скролл.

---

## 9. Sort / reorder (Q3 — ClickUp pattern)

### 9.1. Sort vs drag — авто-переключение (resolved 2026-04-19)

**Правило:** как только юзер начинает drag row (mousedown + перемещение > threshold), активный sort **снимается автоматически**, а текущий визуальный порядок замораживается как новый baseline `ui.order`. Drag продолжается в этом baseline.

**Поток:**
1. Список отрисован с активным `Sort by: Name ↑`
2. Юзер начинает тащить row 3 → sort auto-clears
3. Отображаемый порядок (Name ↑) записывается в `ui.order` всех siblings того же уровня
4. Drag завершается — row оказывается на новой позиции, остальной порядок = как был при sort'е
5. **Micro-toast**: *«Sort cleared → manual order active»* (3–5s, fade)

**Почему так:**
- **Single-gesture UX** — не надо «сначала снять sort, потом drag». Юзер тянет, сортировка уходит сама
- **Порядок не рушится в хаос** — сохраняется то, что юзер видел на экране в момент drag'а
- **Pattern** из Finder / Notion / ClickUp — знаком всем

**Guards:**
- Micro-toast **обязателен** — без него юзер может не понять, почему sort-индикатор в header вдруг пропал. Toast однократный на drag gesture, auto-dismiss.
- Threshold для старта drag'а — минимум 4-5px движения, чтобы случайный mousedown на row не снимал sort.
- Откат: в первые 3s после clear показывать в toast'е кнопку `Undo` → возвращает sort и исходный `ui.order`.

### 9.2. Поля сортировки (MVP)

| Field | Source | Direction | Notes |
|-------|--------|-----------|-------|
| **Name** | `folder.name` (display label) | A→Z / Z→A | Primary sort для быстрой навигации |
| **Date added** | `folder.addedAt` (ISO timestamp, записано SheepDog'ом при `add`) | new→old / old→new | Наш собственный tracking, не filesystem |
| **Path** | `folder.path` (resolved abs) | A→Z / Z→A | Для юзеров, которые мыслят в file tree terms |
| **State** | computed STATE dot (§3.1) | problems first / ok first | Триаж: "где красное?" — одним кликом всё проблемное сверху |

**Date added — откуда берём:**
- **SheepDog-owned** (`folder.addedAt` в JSON) — timestamp момента, когда юзер добавил папку в панель (кликнул + Add / drag-drop / нашли при migration). **Используем это** как primary.
- **FS-owned** (`fs.statSync(path).birthtime`) — время создания папки на диске. Менее надёжно (кросс-платформенно шатко: на Linux `birthtime` может быть `0`, на переносе через cloud timestamp обновляется), семантически не то что ждёт юзер. **Не используем.**

Best practice: наше `addedAt` — SOT, FS — ignored для сортировки.

### 9.3. UI — как сортировать

- **Click на column header** → sort by this column ascending. Second click → descending. Third click → remove sort (вернуться к manual `ui.order`).
- **Активный sort indicator** в header: стрелка `↑` / `↓` рядом с именем колонки, подсветка accent цветом.
- **Multi-sort** (shift-click на второй column) — v1.1, не MVP. В MVP один sort field за раз.
- **Sort persists** per session. Сохранять в JSON `ui.activeSort: {field, direction}` — чтобы при reopen панели сохранился последний выбор (как в Finder / VSC Explorer).

### 9.4. Tree interaction with sort

Важный edge case: дерево иерархическое. Sort применяется **per level** (siblings сортируются, но parent-child связь не ломается):

```
[Sort by Name A→Z]
├─ 01_Assets         (sibling, sorted)
│   ├─ 01_Video      (child of 01_Assets, sorted within)
│   └─ 02_Image
├─ 02_Stills         (sibling, sorted)
└─ 03_Archive
```

Sort **не делает flat list** — tree structure сохраняется всегда. Это и есть поведение Finder's "Arrange by → Name".

### 9.5. Roadmap

- **MVP:** insertion order (без sort UI, без drag). Просто список в порядке добавления.
- **v1.1:** drag-reorder + 1-field sort (Name, Date added, Path, State) + indicators в column headers.
- **v1.2:** multi-sort (shift-click chain), custom sort groups (by label color), saved sort presets.

---

## 10. Data model — JSON schema update

```json
{
  "version": 2,
  "folders": [
    {
      "id": "a1b2c3",
      "path": "C:/footage/day1",
      "pathMode": "abs",          // "abs" | "rel"
      "name": "day1",             // display name (editable)
      "targetBin": "day1",
      "parentId": null,           // null = root row, "xyz" = child of row xyz
      "addedAt": "2026-04-19T14:22:03Z",  // ISO timestamp — sort key for "Date added"
      "enabled": true,
      "sub": true,                // was "subfolders"
      "flatten": false,
      "sequences": false,         // new: SEQ
      "label": null,              // "violet" | ... | null
      "autoWatch": true,          // per-folder eye
      "mirrorDel": false,         // DEL (hidden unless danger zone on)
      "ui": {
        "expanded": true,
        "order": 0                // manual drag-reorder position (ignored when activeSort set)
      }
    }
  ],
  "settings": {
    "dangerZoneEnabled": false,
    "showPerFolderDel": false,
    "activeSort": null            // null | {field:"name"|"addedAt"|"path"|"state", direction:"asc"|"desc"}
  }
}
```

### 10.1. Migration from v1

- Existing `subfolders` field → rename to `sub`
- Missing fields defaulted: `pathMode="abs"`, `parentId=null`, `sequences=false`, `label=null`, `autoWatch=true`, `ui.expanded=true`
- **`addedAt`** defaulted к `fs.statSync(configPath).mtime` (время последней записи config) для уже существующих rows — не идеально, но единственный доступный fallback. Новые rows пишут реальный timestamp при `add`
- Write backup to `.bak` before migrating (FolderManager уже делает это)

### 10.2. Lazy child rows

Child rows в JSON появляются **только при override**. Virtual children (disk subfolders без own record) резолвятся на лету в UI: `resolveSettings(diskPath)` ползёт по `parentId` цепочке до первого row с конкретной настройкой.

---

## 11. Open questions (для Figma / discussion)

1. **NAME editable** — inline (click на name → input) или через dialog? Mac Finder uses inline + enter.
2. **Bulk operations** для v1.1: multi-select (shift/ctrl) + batch toggle FLT? Нужен UX для select-state.
3. **Column resize** — даём юзеру или фиксируем? MVP: фиксируем (проще).
4. **Column show/hide** — в Settings можно спрятать колонку (например, REL если никто не пользуется)? v1.2.
5. **Label multi-select** — можно ли присваивать label batch'ом? Blocked на Bulk ops.
6. **Mobile / narrow panel** — если юзер сделал panel 300px wide, колонки жмутся. Need responsive breakpoints или horizontal scroll?
7. **Keyboard nav** — arrow keys по tree, space для toggle checkbox? Accessibility level для MVP?
8. **STATE dot** — single glyph or multi-icon overlay (напр. scanning spinner + label color)? Draft выше предлагает single — возможно захочется hybrid.

---

## 12. Non-goals (explicit scope limits)

- **Не** делаем мульти-проектный view ("All projects" dropdown из Watchtower) — SheepDog scoped to current .prproj
- **Не** делаем drag-to-merge / drag-to-reparent — просто reorder внутри siblings
- **Не** делаем inline file preview — тогда это media browser, не folder watcher
- **Не** делаем undo stack в MVP для структурных изменений — safety covers + Danger Zone confirm modals достаточны

---

## 13. Next steps

1. **[this doc]** Review + fix у юзера, ответы на §11 open questions
2. **Figma** — визуал панели по этому концепту (Figma MCP generate_diagram или ручной design pass)
3. **Merge** — интеграция в MVP-CHECKLIST (заменяем §18.5, меняем §17 §19 §20 под новую модель)
4. **Excalidraw** — обновить architecture diagram (folder-manager schema v2, UI layers tree/progress)
5. **figma-watchdog-roadmap.js** — обновить roadmap nodes под новые фичи (columnar tree, lazy children, safety timer)
6. **Implementation** — после одобрения чеклиста

---

## Appendix A — Reference screenshots

- Watchtower panel (screenshot в сессии): columnar layout, tree, per-row checkboxes — прямая референс
- AE layer panel: icon-toggles метафора для ACTIONS column
- Premiere Media Encoder: progress panel при импорте (footer dock, собственный scroll)
- ClickUp task list: sort-overrides-drag pattern для §9

## Appendix B — Glossary

- **Row** — строка в панели, соответствует одной watch folder (реальная или virtual)
- **Virtual row** — subfolder, у которого нет record в JSON; настройки наследуются от ближайшего ancestor row с override
- **Materialization** — момент первого override у virtual row → создаётся record в JSON
- **Scope** — область действия настройки row'ы (её папка + subfolders БЕЗ своих rows)
- **Nearest ancestor wins** — правило override: для любой точки в disk tree настройка берётся из ближайшего row-предка с явным override
