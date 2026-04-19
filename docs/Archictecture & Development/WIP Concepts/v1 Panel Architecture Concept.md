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

### 5.2. FLT (flatten into own bin) — resolved (β)

Сценарий: parent `03_Assets` FLT=ON, child `01_Video` FLT=OFF (override).

**Выбрана модель (β): child gets sub-bin внутри parent bin как exception.**

- `03_Assets` сохраняет Bin structure disk → project (плоский для direct files parent'а)
- `01_Video` остаётся sub-bin **внутри** `03_Assets` bin (because disk structure: `03_Assets/01_Video/`)
- Внутри `01_Video` bin'а сохраняется его собственная структура subfolders (child FLT=OFF)

**Правило:** FLT — **row-local**. Управляет структурой **своего** bin контента, не тянется сквозь child rows.

Альтернатива (α): child уходит в root проекта — отвергнута. Теряется визуальная связь с parent, 1:1 disk→project ломается, хаос при 5+ overrides.

**Safety cover на FLT**: **да**. Flatten и unflatten перемещают файлы (moveBin). Timeline references не ломаются (API сохраняет ссылки), но bin structure в проекте перестраивается дерзко. Cover + таймер предотвращает fat finger.

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
| FLT | Yes | reorganizes bin structure — fat finger можно откатить, но раздражает |
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

- **Нет sort modifier** → drag-reorder enabled (юзер тащит row вверх/вниз, сохраняем в JSON `order` field)
- **Включён хоть один sort** (по name, по path, by state) → drag disabled, rows sortировкой управляется
- Sort modifier — кнопки/dropdown в column header

MVP: insertion order (без sort UI). Drag-reorder и sort UI — v1.1.

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
      "enabled": true,
      "sub": true,                // was "subfolders"
      "flatten": false,
      "sequences": false,         // new: SEQ
      "label": null,              // "violet" | ... | null
      "autoWatch": true,          // per-folder eye
      "mirrorDel": false,         // DEL (hidden unless danger zone on)
      "ui": {
        "expanded": true,
        "order": 0
      }
    }
  ],
  "settings": {
    "dangerZoneEnabled": false,
    "showPerFolderDel": false
  }
}
```

### 10.1. Migration from v1

- Existing `subfolders` field → rename to `sub`
- Missing fields defaulted: `pathMode="abs"`, `parentId=null`, `sequences=false`, `label=null`, `autoWatch=true`, `ui.expanded=true`
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
