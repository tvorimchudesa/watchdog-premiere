# SheepDog — State Design v1 (WIP, 2026-04-22)

> **Цель документа**: зафиксировать state-модель, принятые решения и design debt. Primary handoff artifacts — читать вместе с:
> - [state-axes.csv](state-axes.csv) — 3 state axes + 3 settings axes + parked plugin axis
> - [state-matrix.csv](state-matrix.csv) — 4 states S1–S4 + parked S5
> - [mirror-decisions.csv](mirror-decisions.csv) — 16-case Premiere↔FS violation matrix (en SOT)
> - [mirror-decisions.ru.csv](mirror-decisions.ru.csv) — то же по-русски (тождественная структура)
> - [parked-notes.md](parked-notes.md) — active contracts + design debt + decision history

---

## Где мы в работе

**Фаза 1 — Taxonomy (done)**: оси состояния → `state-axes.csv`.
**Фаза 2 — Behavior matrix (done)**: cases → `state-matrix.csv`.
**Фаза 3a — Transitions diagram (superseded)**: excalidraw версия была сгенерирована, но отвергнута — смешивала **причины** с **состояниями**. Перемещена в archive.
**Фаза 3b — State-model simplification (done, 2026-04-22)**: модель схлопнута с 11 cases до 4+1. Ключевое решение — разделить **state axes** (3) от **intent settings** (3).
**Фаза 3c — Mirror architecture (done, 2026-04-30)**: 16-case Premiere↔FS violation matrix → `mirror-decisions.csv`. Two-axes model (drift / paused), Mirror DEL via diff + safety hierarchy, Simplified.broken event-trigger, Source/Bin Name display toggle, +S6 Drifted state. См. §16 + parked-notes.md.
**Фаза 4 — Visual handoff (in progress)**: figma scripter `mockups/panel/panel.figma-script.js` (v2). Рендерит 4 base states + S6 Drifted + autoimport-paused sub-state с новой колонкой STATE в panel row.

---

## Cause vs State — ключевая классификация

Модель разделяет **что влияет** (causes / settings) и **наблюдаемое состояние** (states).

### State axes (4 — наблюдаемая категория)

Priority order (при конфликте выигрывает low rank):

1. **path** — `ok` / `missing(subtype)` — **Missing supersedes всё**
2. **enabled** — `yes` / `no` — **Disabled supersedes Busy/Drifted** (disabled row не в очереди на импорт)
3. **busy** — `idle` / `active` — транзитный лок во время in-flight import
4. **sot_parity** — `intact` / `drifted` — Premiere bin tree ≠ FS folder layout. Surfaces только когда нет higher-priority state (см. §16 Axis A)

### Settings axes (3 — orthogonal, не меняют state)

- **EYE** — auto-import preference (row может быть Healthy+EYE=off)
- **SUB** — recursion control (не state own row, но cascade = cause для `enabled=no` детей)
- **LBL** — label text/color

### 5 states (+ 1 parked)

| id | state | cause | indicator |
|---|---|---|---|
| S1 | **Healthy** | baseline | none (subtle activity dot optional) |
| S2 | **Busy** | import in-flight (auto OR manual Sync) | spinner + N/M counter |
| S3 | **Disabled** | own × / parent SUB=off / parent enabled=no | row-level dashed visual |
| S4 | **Missing** | path enoent / offline / eacces / other (folder-level only — см. §9) | red lamp + subtype tooltip |
| S5 | Plugin Unhealthy (parked v1.1+) | Premiere recovery block etc. | global panel indicator |
| S6 | **Drifted** | Premiere bin tree ≠ FS folder layout (clips moved out of place / dedup'd to wrong bin) — см. §16 Axis A | 4px solid accentFill (dark blue), cascade up to root |

**Sub-state of Healthy**: `autoimport-paused` — eye stored=off after autoimport-pause event (Axis B violation, см. §16). Row остаётся `healthy`, signal через eye-closed glyph + Simplified red toggle bg.

---

## Концепции модели

### 1. Causes vs States — строгое разделение
Юзер задаёт **causes** (intents / settings). Система derive **state**. SUB=off на родителе не state own row — это **cause** для `enabled=no` на детях. EYE=off не state вообще — это preference, row остаётся Healthy. Диаграмма состояний не должна иметь отдельные ноды для settings-toggles.

### 2. Logical row vs filesystem row
Row = **logical watch entry** с path binding, stored settings (EYE/SUB/LBL/× force-disable). Жизненный цикл row независим от filesystem (row может быть в Missing, но остаётся в config).

### 3. Display walker vs Runtime walker
Два независимых процесса:
- **Display walker** — всегда recurses для отображения структуры (юзер видит дерево даже при SUB=off или Disabled, чтобы navigate / restore ghost / per-row mgmt). Подтверждено юзером 2026-04-22.
- **Runtime walker** — respects `enabled=no` (включая cascades от SUB=off и parent-disable) и `path=missing`.

### 4. Busy = race-prevention, не scan
Busy state триггерится **только импортом** (user-visible race — файл копируется в bin, intent mutation сломает). Scanning (idle watcher, initial index, path walk) **не Busy** — silent. Initial index = очень тихий процесс построения дерева, не state-level блокировка.

### 5. Disabled causes — три источника, один behavior
Runtime behavior Disabled идентичен независимо от cause:
- own × force-disable
- parent SUB=off cascade (на descendants only, не на сам parent)
- parent enabled=no cascade (на всю subtree включая concept parent-уже-disabled)

Tooltip дифференцирует (design debt). `×` force-disable на root = другой семантикой (remove from config).

### 6. Context-aware × (single click)
Один glyph, разная семантика по row-state:

| Row type | × делает |
|---|---|
| root | remove from config (persistent destroy) |
| child (enabled=yes) | set force-disable (blacklist, row остаётся visible) |
| child (enabled=no, own force) | restore (unset force-disable) |

Tooltip раскрывает: `"Remove folder"` / `"Disable branch"` / `"Restore"`.

### 7. Ghost row (auto-disable после Relink)
Side-effect relink: если юзер сменил path A→B, но A **физически существует**, runtime walker обнаружит его и создаст новую row с **auto force-disable** (blacklist). Предотвращает double-observation. Юзер может restore или remove (×).
Offline old path → ghost не создаётся.

### 8. Stored intent ≠ effective intent
Юзер может менять EYE/SUB/force-disable на Disabled/Missing row. Изменения **хранятся в config**, но не применяются пока state не вернётся в Healthy. Когда state нормализуется — stored values становятся effective.

### 9. Missing — runtime off, mgmt alive
Path unreachable kills runtime. Но management actions остаются: `×`, `Relink` (primary!), `LBL editable`. Relink на Missing — самый важный use-case. Toggles визуально кликабельны (stored-not-apply).

**Folder-level only**. Single-file FS deletion (file gone, folder still alive) — это **Premiere's responsibility**: clip отображается offline через native Premiere offline-reference UI. Plugin не intervenes на file-level — row остаётся `healthy`, юзер relink-ит clip в Premiere native UI или удаляет clip из bin (тогда case #2 Coverage violation срабатывает). См. mirror-decisions.csv case #7.

### 10. Missing subtypes (parked)
Типы path errors для MVP:
- `enoent` — папка удалена/переименована → periodic re-probe (may return)
- `offline` — drive не подключён → aggressive re-probe (часто подключается)
- `eacces` — permission denied → retry бесполезен
- `other` — path too long / IO error / broken symlink (generic)

Subtype влияет на **тултип** и **retry strategy**, но state один (Missing). Subtype detail + retry strategy parked.

### 11. Plugin-level Unhealthy (parked v1.1+)
Premiere recovery block, stuck imports, external impairment — это **global plugin state**, не row state. Surfaced в panel header, не per-row. Не MVP.

### 12. Tier model — stored intent × effective value (2026-04-22)

Две orthogonal axes в одном glyph: **effective value** (on/off) × **stored intent** (overridden/inherited). 4 визуальных tier'а применяются консистентно к checkbox + eye:

| tier | meaning | visual |
|---|---|---|
| **overridden** | stored explicit value | solid glyph, full brightness (strokeMid/borderBright) |
| **inherited** | no stored, follows parent cascade | dim glyph (backMid tones) |
| **locked** | parent force-cascades value (eye asymmetric rule) | strokeMid fill with crack |
| **disabled** | runtime off (Disabled/Missing state) | dashed border |

Все tiers **показывают effective value** — не neutral / indeterminate. Яркость/pattern различает stored intent; icon/shape различает value. **Inherited ≠ Discord's neutral** — мы рендерим value (dim), Discord рендерит dash (без value).

#### 3-click cycle (pin · toggle · unpin)

Single click на checkbox/eye cycles:
1. **inherited** (no stored) → click → **overridden-same** (pin current value как explicit)
2. **overridden-same** → click → **overridden-opposite** (toggle within override)
3. **overridden-opposite** → click → **inherited** (unpin, delete stored, resync к parent's current)

Data model:
- `inherited` = no stored value, effective = parent cascade (computed)
- `overridden` = stored explicit value, effective = stored (decoupled от parent)

**Parent changes during override**: stored persists (это WHY юзер pinned). Unpin resync'ит к parent's CURRENT value (не к historical).

**Visual feedback** (production code): 150ms fade-animation на tier promote (dim→bright). Figma renders static — требование implementation, не optional.

**Precedent**: Discord permissions (tri-state cycle). Onboarding tooltip: "Click cycles: pin · toggle · reset. Discord-style."

#### Root constraint

Root rows без parent cascade. State-space = 2 values только (overridden-on / overridden-off). Cycle degrades к toggle. Tooltip: "Toggle (root, no inherited state)".

#### Bulk selection grammar

**Click на cell с активным selection** → bulk cycle той же column across selected rows. **Clicked cell определяет cycle path** (based on its state-space). Остальные selected rows **follow as capable, pass when can't** (hold at current state, не cycle backward).

Mixed root+children selection:
- Click на **root's cell** → 2-state cycle, все selected rows sync'нутся (root драйвит). Effective always unified.
- Click на **child's cell** → 3-state cycle. Children достигают все 3 states. Roots при "inherited" step **hold at last overridden** (физически can't inherit). Effective still unified — child inherits от root = same effective.

**Whole-row bulk reset** (across all columns в один клик) — **PARKED**. Selection bar с `↺ Reset inheritance` рассматривался, но отложен — см. Open questions. Сейчас whole-row reset достигается click-on-cell на каждую column отдельно (3 кликa × 5 colums = 15 кликов для 5 rows). Приемлемо для MVP, нужен отдельный дизайн-raund для streamlined whole-row.

#### Bulk grammar — summary table

| intent | selection | action |
|---|---|---|
| Cascade setting на subtree | root + children | click на root's cell — 2-cycle, all unified |
| Reset column на children only | children only (deselect root) | click на any child's cell × 3 → inherited |
| Flip column value на subtree | root + children | click на any cell × 1–2 → unified overridden state |
| ~~Reset whole-row на children~~ | — | PARKED (см. Open questions: whole-row bulk affordance) |

#### Asymmetry — явно документировать

Click на root vs child при mixed selection → разная длина cycle (2 vs 3 states). Это **не inconsistency — physics** (root's state-space меньше). Tooltips на first hover при mixed selection educate: root cell = "Toggle (no inherited state)", child cell = "Cycle: pin · toggle · reset. Selected roots hold at last value."

#### Stored value persistence

Overrides persist через все state transitions:
- **Disabled** (force/cascade) → stored preserved, runtime off. Reapply when re-enable.
- **Missing** (path error) → stored preserved. Reapply when path returns.
- **Busy** (import in-flight) → toggles store-not-apply; stored values queued, apply после import drains.

Cycle click **всегда** мутирует stored values; effective application depends on state.

#### Что superseded этим §12

**Design debt #3 "Reset-to-inherited glyph `↺` на child row"** — superseded by 3-cycle + selection bar. Per-row ↺ не нужен. Removed from parked debt.

### 13. Simplified / Advanced Mode (2026-04-22)

Progressive-disclosure pattern для двух ключевых юзер-сегментов:
- **Simplified** (default): Watchtower-refugee, casual Premiere editor. "Set and forget." Минимум chrome, zero learning curve.
- **Advanced** (opt-in toggle): Pro editor с complex project setups. Full per-row control.

#### Toggle

- **Label: "Advanced"** в panel header (renamed / expanded from v1.2 "Auto Sync")
- Default state: **OFF** (Simplified shown on first open)
- Toggle ON: reveal advanced columns inline — не separate screen

**Naming rationale**: "Advanced" over "Pro" — "Pro" ассоциируется с freemium tiers (Notion Pro, Figma Pro, GitHub Pro) → ложный сигнал "paid feature". "Advanced" neutral + accurate. Apple precedent: System Settings → Advanced, Finder → Advanced, iOS → Advanced Data Protection. "Easy Mode" отвергнуто как patronizing в pro-tool контексте.

#### Columns

**Simplified columns** (default view) — **Tier A minimum (2026-04-23)**:
- STATE LED
- SOURCE NAME (with chevron prefix, hover-tooltip reveals full path; column header chevron ▾ → RMB context menu для display mode toggle, см. ниже)
- LNK (⌕ relink, dedicated column, always visible, never red)
- LBL (color dot)
- ×

**Hidden в Simplified** (revealed когда Advanced ON):
- PATH text column
- SUB checkbox column
- REL checkbox column
- SEQ checkbox column
- FLT checkbox column
- EYE column
- DEL column (hidden **regardless of Settings toggle** — destructive feature kept out of Easy)
- ACTIONS column (refresh, magnet, etc.)

#### Column semantics в Simplified

| column | behavior |
|---|---|
| STATE LED | всегда visible (critical signal для missing detection) |
| SOURCE NAME | chevron left-sticky. Hover → full path tooltip. Column header gestures: ЛКМ = sort (стандарт), RMB → context menu с toggle "Source Name / Bin Name" (см. ниже). Display switches между FS-derived именем (default) и Premiere bin label (custom rename allowed) |
| LNK (⌕) | always visible. Color borderBright on healthy/active, strokeMid on disabled/missing/busy. Click = relink flow |
| LBL | per-row color label — remains visible, organization |
| × | remove (root) / force-disable (child) — remains visible (disabled visual during Busy) |
| **(hidden)** SUB | global default ON (recursive). Per-row override → Advanced |
| **(hidden)** SEQ | forced ON via Premiere's `importAsNumberedStills` — native sequence auto-detection. No SheepDog-side detector. Per-row OFF → Advanced |
| **(hidden)** EYE | globally forced ON. "Auto-import everything" |
| **(hidden)** REL, FLT | global defaults OFF. Per-row override → Advanced |
| **(hidden)** PATH | text hidden, accessible via NAME hover tooltip |
| **(hidden)** DEL | always hidden in Simplified, even if enabled in global Settings (destructive — protect casual users) |
| **(hidden)** ACTIONS (refresh, magnet) | no per-row controls in Simplified |

#### Defaults for hidden columns

Set once в global Settings, applied implicitly к every row:
- **SUB default = ON** (recursion on by default)
- **SEQ default = ON** — Premiere handles sequence detection natively via `importAsNumberedStills` flag. **No SheepDog-side detector needed**. Non-sequence files import individually
- **REL default = OFF**
- **FLT default = OFF**
- **EYE forced = ON** (always, while Simplified)
- **DEL hidden** (regardless of Settings — never surfaced in Simplified)

Rationale for dropping SUB & SEQ из Simplified:
1. **SUB**: initial walk irreversible — `SUB=off` toggle лечит только future fs events, не previous bulk import. Casual user видит already-imported subfolder content, не может undo. Therefore post-hoc SUB toggle = closing barn door after horse bolted. Drop it. Edge case (real "exclude subfolders") = Advanced.
2. **SEQ**: Premiere's import API auto-detects sequences via `importAsNumberedStills: true`. SheepDog не нуждается в собственной detection логике. Forced ON в Simplified means Premiere handles everything.

#### Mode transitions — data preservation

**Simplified → Advanced**: reveal all columns. Все stored per-row values appear. EYE/SUB/SEQ show stored value (per-row) или default if never touched.

**Advanced → Simplified**: hide advanced columns. Все stored values preserved in config. EYE/SEQ **temporarily forced ON** overlay (global auto). SUB defaults to ON behaviorally (recursive). When Advanced toggles ON again, stored values restored.

Юзер знает что делает при переключении — **no confirmation dialog**. Toggle reversible, data не теряется.

#### LNK column rationale (replaces inline ⌕)

Earlier proposal had ⌕ inline after NAME text on Missing rows only. Revised to dedicated LNK column (2026-04-22 image confirm):
- Always visible на all rows (not Missing-only)
- Consistent column position — predictable scan target
- Color follows row state (borderBright active, strokeMid disabled/missing/busy) — never red
- Inline-after-NAME pattern dropped — tooltip on hover handles "what would relink do here?"

#### Path reveal — NAME hover tooltip

Hover any row's NAME → tooltip shows full path. Consistent gesture (hover = inspect). Works одинаково на all states. Tooltip render: standard styled (C.canvas bg, C.border stroke, F.r 11 C.text), single line unless very long.

Не duplicated с LNK (⌕ = action — relink, tooltip = inspect — show path). Two different intents, two different gestures.

#### Source Name / Bin Name display toggle

Custom bin labels в Premiere allowed (юзер может переименовать bin для cosmetic clarity без drift triggering — см. mirror-decisions case #12). Plugin внутренне always knows оба имени:
- **Source Name** (default) — FS-derived имя (basename папки на диске, source-of-truth)
- **Bin Name** — текущий Premiere bin label (display attribute, может быть user-renamed)

**Gesture**: column header `SOURCE NAME ▾` — chevron indicator. ЛКМ на header = sort by current display mode. RMB на header → context menu → toggle **"Show Bin Name"** / **"Show Source Name"**. Display переключается на ВСЕХ rows, persistent в config.

**Mapping invariant**: внутреннее identity row binding идёт через Premiere internal bin ID, не через label. Rename bin в Premiere → label changes, identity intact, autoimport keeps working. Это case #12 → silent healthy. См. также §16 Axiom (label change ≠ Axis A drift).

#### Target use case coverage

| user need | Simplified works? | Needs Advanced? |
|---|---|---|
| Add folder, auto-import everything | ✓ (recursive default + auto-sequence via Premiere) | — |
| Color-label folders | ✓ (LBL) | — |
| Remove / disable folder | ✓ (×) | — |
| Fix missing path | ✓ (LNK) | — |
| See where folder maps physically | ✓ (hover NAME) | — |
| Per-row SUB override (exclude subfolders) | ✗ | ✓ |
| Per-row SEQ override (force individual frames vs sequence) | ✗ | ✓ |
| Per-row EYE override (auto-import off на одной row) | ✗ | ✓ |
| Relative paths configuration (REL) | ✗ | ✓ |
| Flat bin-structure (FLT) | ✗ | ✓ |
| Delete-related-bins (DEL) | ✗ | ✓ |
| Manual refresh / magnet actions | ✗ | ✓ |

90% of daily use cases покрывается Simplified — set-and-forget. Advanced = progressive-disclosure для power users + destructive ops (DEL).

### 14. Row actions — × context-aware (2026-04-23)

× glyph adapts semantic based on path state AND row type. Protects against accidental destructive actions on live data, respects plugin's responsibility boundary (see §16).

#### × action matrix

| row | state | × action | rationale |
|---|---|---|---|
| **Parent** (root config entry) | path ok | **delete** (remove from tracking) | Config-level op; disk untouched |
| **Parent** | path missing | **delete** (cleanup config) | Files already gone; nothing to protect |
| **Child** (derived from FS walk) | path ok, enabled | **disable** (toggle off watching) | Can't delete from plugin — OS owns the file |
| **Child** | path ok, disabled | **enable** (toggle on watching) | Reversible, safe |
| **Child** | path missing | **delete** (cleanup config) | File gone from FS; plugin just removes its tracking entry |
| Any row | Busy | **×  disabled visually** | Race-prevention during import |

#### Dynamic tooltip

- `"Remove folder from SheepDog"` — parent × on any state
- `"Disable watching"` / `"Enable watching"` — child × based on current state
- `"Delete entry"` — missing × (explicit destructive on already-gone path)
- `"Cannot remove while importing"` — Busy state

#### Escape hatch for explicit child delete

User wants to delete a healthy child folder → **must delete in OS first** (Finder / CLI `rm`). Once the path is missing, SheepDog lets user cleanup the tracking entry via ×. This respects OS ownership of files — plugin doesn't touch disk for child rows.

#### Parent-vs-child asymmetry

- **Parent** = config entry юзер явно добавил через Add Folder. Plugin owns config, can freely add/remove. No disk impact.
- **Child** = derived from filesystem walk. Plugin doesn't own the file. Only tracking state is toggleable; existence is OS's domain.

This asymmetry is the **plugin-as-mediator principle** (см. §16).

### 15. Row visibility filters (2026-04-23)

Optional filter toggle в panel header — hide rows that are not actively operational. AE-style "hide error/disabled layers" pattern.

#### Toggle behavior

- Icon: eye-slash или filter glyph в header toolbar (рядом с search)
- Default: OFF (show all rows)
- ON: hides rows with `stateIndicator in ["disabled", "missing"]`
- Simultaneously affects both cascade-disabled и force-disabled (single toggle)

#### Footer counter — MANDATORY when hidden

When filter active, footer shows hidden counts:
```
status: 12 rows · 1 busy · 4 missing hidden · 4 disabled hidden
                            ^^^^^^^^^^^^^^^
                            RED text — persistent reminder
```

**Missing hidden count рендерится красным** — так юзер не забудет что где-то path broken. Out-of-sight НЕ becomes out-of-mind.

#### Chevron visibility rule

- Parent с children (any visibility/state, incl. all hidden) → **chevron shown**
- Parent без children → **no chevron**
- Leaf row → **no chevron**

Chevron = structural signal "this is container". Visibility of children не меняет structure.

When expanded parent имеет все children hidden → expansion shows nothing. MVP: silent empty expansion (юзер понимает через filter toggle + footer counter). Future polish: inline hint `"4 children hidden — toggle filter"` или badge near name `[4 hidden]`.

#### Parked design debt (§15)

- **Bold border between hidden groups** (Google Sheets-style) — visual marker где скрытые rows. Low-priority polish.
- **Animation on hide/show** — fade-out / slide, не immediate hide. Polish bucket.
- **Separate toggles** disabled vs missing (vs combined single toggle) — revisit если user testing покажет missing-hiding слишком risky.

### 16. Plugin responsibility boundary (2026-04-23)

Describes what SheepDog owns vs what OS owns. Governs all destructive/modifying actions.

#### Layers

| layer | owner | SheepDog can |
|---|---|---|
| **Config (JSON)** | SheepDog | freely add/remove parent entries, toggle child watching state, store overrides |
| **Filesystem (child files)** | OS | **read-only** — observe, walk, detect. Never delete, move, or modify |
| **Premiere project (bins)** | Premiere | via ExtendScript — importFiles, createBin. Plugin mediates USER's explicit intent only |

#### Cross-boundary operations — always explicit opt-in

Exceptions to the "SheepDog read-only on disk" rule:

1. **Mirror DEL** (MVP feature, three-way handshake): when юзер deletes bin в Premiere AND row's `DEL=on` AND global `Mirror DEL master=on` → plugin cascades delete файлов на disk через OS trash (recoverable, не permanent). Triple-gated by toggle stack + Premiere-side user intent. **Always hidden в Simplified** (§13 decision #41) — destructive feature не surfaces в Easy mode. Execution is **diff-based** — см. ниже.

2. **Relink** (future): moving folder in OS → plugin offers relink, but НЕ автоматически moves files itself. User does OS move, plugin adjusts config.

3. **ImportFiles** (standard): plugin calls Premiere API to add files to bin. Premiere owns the bin modification.

#### Mirror DEL — diff-based execution + safety hierarchy

Mirror DEL fires per Premiere bin-delete event under 3-way handshake. Execution is **diff-based** между pre-delete manifest (full FS knowledge incl. dedup-rejected entries) и post-delete Premiere bin contents. Diff categorized по safety hierarchy:

| tier | condition | action |
|---|---|---|
| **TRUSTED** | diff matches expected pattern (clean delete of bin / file via right-click) | proceed → OS trash with 5s cancellable timer |
| **SUSPICIOUS** | manifest stale / diff has unexpected gaps / dedup-injected clips elsewhere | **import wins** — autoimport re-imports instead of trashing. Better over-represent than nuke files юзер не хотел удалять |
| **BROKEN** | session corrupted / manifest incoherent | abort destructive path → fall through to Coverage violation (Axis B → autoimport-paused) |

**Cancellation**: 5s timer окно visible только в progress panel (countdown ring on DEL cell — PARKED visual). Cancel = un-tick DEL checkbox automatically + autoimport stops; next FS event triggers Axis B. См. [parked-notes.md](parked-notes.md) §"Active contracts: DEL diff hierarchy" для full spec.

#### Implications for UX

- **Parent row** = config entry. × removes config, doesn't touch disk.
- **Child row healthy** = FS-owned. × can't delete (respects OS ownership). Only toggle watching.
- **Child row missing** = FS already said "gone". × just cleans up plugin's stale config.
- **Mirror DEL** = explicit cross-boundary permission. User opts in when they want plugin to cascade bin-delete to disk-delete.

This rule governs error recovery, data safety, mental model of plugin's "zone of control".

#### Axiom of asymmetric ambiguity

Plugin's response to destruction events is asymmetric by design — driven by what the plugin **can know** about user intent on each side of the boundary.

| destruction trigger | plugin knows intent | response |
|---|---|---|
| **Premiere-side** (bin/file deleted in Premiere project panel) | **Yes — deliberate.** Mirror DEL flow requires three aligned conditions (DEL=on per row + global Mirror DEL master switch + user's explicit Premiere-side delete action). When all three align, intent is unambiguous. | If Mirror DEL fires → row gone (no `Missing` carry-over). If conditions not aligned → see two-axes violation model below. |
| **FS-side** (file/folder deleted in Finder, drive disconnected, network share dropout, permission revoked) | **No — ambiguous.** Plugin cannot distinguish *user-initiated delete* from *drive offline* from *network mount drop* from *permissions error*. All four look identical from a watcher's perspective: path no longer reachable. | Always → row state = `missing`, with retry strategy gated by subtype (enoent/offline/eacces/other). Plugin never assumes destructive intent on the FS side. |

**Why this asymmetry matters:**
The plugin **mediates** between Premiere and the FS. On the Premiere side it can observe a complete user gesture (3-way handshake); on the FS side it sees only the result of an event. Treating both with the same severity would either:
- (a) lose data — auto-trash files when a drive briefly disconnects, OR
- (b) spam the explorer — flag every deliberate Mirror DEL as an unrecoverable `Missing` row.

**Two-axes violation model (when Premiere-side destruction does NOT trigger Mirror DEL):**

A Premiere-side change that doesn't satisfy Mirror DEL conditions can still violate one of two orthogonal SoT axes:

| axis | what it is (common name) | violated by | NOT violated by | recovery tool |
|---|---|---|---|---|
| **A — Structure parity** *(drift — clips misplaced)* | clips для tracked FS files должны быть в bin для corresponding row | bin moved **with clips** out of parent / file dragged в чужой bin / dedup-rejected re-import (clips exist в wrong bins) | empty moved bin (nothing misplaced — case #4') / bin label rename (case #12, mapping via internal ID) / Premiere clip rename (case #5.1, cosmetic) | **Magnet** — pulls scattered clips to recreated SoT bin positions |
| **B — Content coverage** *(paused — files w/o clips + plugin failure)* | every FS file должен быть represented as clip в right bin пока autoimport=on | bin/file deleted в Premiere with eye=on (Mirror DEL not aligned) / cancelled mid-import / non-dedup import failure (autocancel) | clips destroyed without files in FS (nothing to cover) / eye=off baseline (no policy active) | **Refresh** (manual re-import) / mode-toggle Adv↔Simplified (transient re-sync) / Advanced + manual eye flip on (full policy restore) |

The two recovery tools are non-overlapping by design:
- **Magnet** fixes **paths** (Axis A only). Doesn't re-import content beyond restoring structure.
- **Refresh** fixes **content** (Axis B only). Operates на existing bins; doesn't recreate moved/deleted bins.

Two-step recovery is explicit when both axes violated (move WITH clips + delete content): Magnet first (rebuild structure + recreate empty bin in SoT position), then Refresh (refill content).

**Two-step recovery distinction для Axis B (parked-notes contract)**: content recovery (Refresh / mode-toggle) ≠ policy recovery (Advanced + manual eye flip on). Stored eye=off persists across content-only paths — только explicit eye flip restores autoimport policy. Mediator-respectful: policy change requires per-row act.

**State indicators:**
- Axis A violated → row state = `drifted` — **4px solid `accentFill` (dark blue), cascade up to root**. Distinct visual от Missing's red 4px solid (different colors, same weight). Same indicator в Simplified и Advanced (drift = local issue, не affects mode globally).
- Axis B violated → row's eye stored → off (visual: eye-closed glyph per-row); row state stays `healthy + autoimport-paused` (sub-state — FS unchanged, no truth violation). **Simplified layer**: any autoimport-pause event triggers `simplified.broken = true` flag → red Simplified toggle background until user-initiated recovery clears flag. Event-trigger contract (fires on ANY row's pause, not aggregated per-row). См. [parked-notes.md](parked-notes.md) §"Active contracts".

**Eye=off + Premiere-side delete** = `healthy`, do nothing. No autoimport policy was active → no policy to violate (case #1).

**Eye=on + DEL=on + master=on + Premiere-side delete** = Mirror DEL flow → row removed (not Missing — see Asymmetric Ambiguity row). Diff categorization may downgrade к autoimport-paused if SUSPICIOUS/BROKEN.

---

## Key decisions log

| # | Вопрос | Решение |
|---|---|---|
| 1 | CSV vs excalidraw для taxonomy | CSV |
| 2 | path: missing vs offline — разделять в state? | Нет — один state `missing` с subtype для UI/retry |
| 3 | Mixing в bin — предупреждать? | Нет. Folder-level scope |
| 4 | Background scan — state? | Нет. Silent property. Busy = только import |
| 5 | Lock axis? | Нет. Не реализован детерминированно. Park |
| 6 | Row lock during job — state? | Да → `busy` axis, active во время import |
| 7 | Disabled row — visible, navigable? | Да. Display walker always recurses |
| 8 | EYE off = сканить path для missing? | Да. path мониторится независимо от EYE |
| 9 | SUB off на parent — сам parent disabled? | Нет. Parent processes own files, descendants cascade-disabled |
| 10 | SUB значение | on = files + dirs (recursive). off = own files only |
| 11 | × на child — remove? | Нет. × = force-disable (toggle). Walker re-найдёт |
| 12 | Blacklist child через SUB=off? | НЕТ. Force-disable — отдельная механика |
| 13 | × single vs double click? | Single, context-aware |
| 14 | Force-disable cascade на subtree? | Да. Вся subtree enabled=no |
| 15 | Lock during Busy — scope? | ×+toggles locked. LBL alive (idempotent) |
| 16 | Relink на child — валидно? | Да. Logical move. Physical-exists old path → ghost auto-disabled |
| 17 | Relink с offline old path? | Переезд, ghost не создаётся |
| 18 | UI-drag row parent↔root? | Нет. Иерархия = filesystem |
| 19 | Add duplicate path (внутри watched)? | Запрет |
| **20** | **SUB = state или cause?** | **Cause**. Не state own row. Cascades на детей как cause для `enabled=no` |
| **21** | **EYE = state или setting?** | **Setting**. Healthy+EYE=off — валидное здоровое состояние |
| **22** | **Missing + Error — один state?** | **Да**. Collapsed в `missing` с subtype |
| **23** | **Scanning + Importing — один state?** | **Нет, разделены изначально были**. Далее: scanning — silent (not state), importing = `busy` |
| **24** | **Initial index scan — state?** | **Нет**. Silent. Race prevention не нужна — intent mutations applyся в следующем проходе |
| **25** | **Display walker под Disabled — recursion?** | **Да**. Всегда recurses для navigation/restore |
| **26** | **Error types — различать retry strategy?** | **Subtype хранится, retry strategy parked**. UI message дифференцирует |
| **27** | **Plugin-level Unhealthy** | Park v1.1+. Global state, not row-level |
| **28** | **Tier model: overridden vs inherited interaction** | 3-click cycle (pin · toggle · unpin). No separate ↺ button. See §12 |
| **29** | **Empty eye (Discord neutral) для inherited?** | Нет. Inherited показывает effective value в dim tier (Adobe / Premiere precedent). Consistency с checkbox |
| **30** | ~~**Bulk reset для N selected rows**~~ | **PARKED** — selection bar `↺` отложен. MVP использует column-level bulk через click-on-cell. Whole-row reset affordance — открытый вопрос |
| **31** | **Bulk cycle на column через click на cell?** | Да. Click на cell при active selection propagates cycle. Clicked cell определяет cycle path; others follow as capable, pass when can't |
| **32** | **Mixed root+children в bulk selection** | Click на root → 2-cycle unified. Click на child → 3-cycle, roots hold at inherited step. Effective всегда consistent |
| **33** | **Simplified vs Advanced mode?** | Да — progressive disclosure. Default = Simplified. Toggle "Advanced" в header reveals hidden columns. See §13 |
| **34** | **Toggle label: "Easy" / "Simple" / "Auto" / "Advanced" / "Pro"?** | **"Advanced"** (default OFF, toggle ON reveals). "Easy" patronizing в pro-tool context; "Pro" implies freemium tier; "Advanced" neutral + Apple precedent |
| **35** | ~~**Simplified columns set**~~ | **REVISED 2026-04-23 (Tier A)**: STATE · NAME (hover=path) · LNK · LBL · ×. 5 columns. Hidden: PATH / SUB / REL / SEQ / FLT / EYE / DEL / ACTIONS |
| **39** | **SUB checkbox в Simplified — drop?** | **Drop**. Initial walk irreversible → SUB toggle lечит только future fs events. Per-row override → Advanced. Default global SUB=ON |
| **40** | **SEQ checkbox в Simplified — drop?** | **Drop, force ON globally**. Delegate sequence detection to Premiere's native `importAsNumberedStills`. No SheepDog detector. Per-row override → Advanced |
| **41** | **DEL column в Simplified** | **Hidden regardless of Settings toggle**. Destructive feature (delete-related-bins) — never surface в Easy mode. Available только в Advanced |
| **42** | **LNK column всегда visible** vs Missing-only inline ⌕ | **Always visible column**. Predictable scan target, consistent placement. Color matches row state (never red). Inline-after-NAME pattern dropped per 2026-04-22 image |
| **43** | **× context-aware — parent vs child vs missing** | **Parent** = delete-only (config entry, no disk). **Child healthy** = disable/enable toggle (OS owns file). **Child missing** = delete (cleanup config). Respects plugin responsibility boundary. See §14, §16 |
| **44** | **Child delete directly from plugin?** | **Нет**. User must delete in OS first. Path becomes missing → × cleans up plugin config. Plugin does NOT touch disk except via explicit Mirror DEL opt-in |
| **45** | ~~**Cross-boundary delete (plugin → disk)**~~ | **REVISED 2026-04-30**: Mirror DEL = MVP feature, three-way handshake (eye=on per row + DEL=on per row + master=on global) + diff-based execution + safety hierarchy (TRUSTED/SUSPICIOUS/BROKEN). 5s cancellable timer. См. §16 |
| **46** | **Check & Import button — keep or drop?** | **Keep in both modes** as icon-only ↻ button на blue fill. Small, unobtrusive. Escape hatch for FS edge cases (network drives, USB, fs.watch bugs, post-crash recovery) |
| **47** | **Hide filter — scope** | Single toggle hides **both disabled AND missing** rows. Footer shows hidden counts; missing-hidden count rendered **RED** as persistent reminder |
| **48** | **Chevron visibility rule** | Parent с children → chevron (any visibility/state, even all hidden). Leaf → no chevron. Chevron = structural signal, not visibility signal |
| **49** | **Plugin responsibility boundary** | SheepDog: config layer free, FS layer read-only (except explicit Mirror DEL), Premiere project via ExtendScript mediates user intent only. See §16 |
| **36** | **⌕ placement в Simplified** | Inline после NAME text, Missing-only. Symmetric с chevron (left-stick). 14px. Zero chrome на non-Missing |
| **37** | **EYE в Simplified** | Hidden. Globally forced ON (auto-import всё). Stored per-row values preserved, restored при switch to Advanced. No per-row EYE control в Simplified — хочешь гибкость → Advanced |
| **38** | **REL / FLT / SEQ / SUB defaults** | Все OFF кроме SEQ=ON и SUB=ON. Set globally в Settings |
| **50** | **Two-axes violation model** (2026-04-30) | Premiere-side change without Mirror DEL alignment violates one of 2 orthogonal SoT axes: **A — Structure parity** (drift, clips misplaced) recovered via Magnet; **B — Content coverage** (paused, files in FS without clips + plugin failure) recovered via Refresh / mode-toggle / eye flip. Non-overlapping recovery tools. См. §16 |
| **51** | **Drifted = new state** (2026-04-30) | S6. Visual: 4px solid `accentFill` (dark blue), cascade up to root. Distinct from Missing red 4px. Same indicator в Simplified и Advanced (drift = local issue) |
| **52** | **Empty bin moved = NOT drift** (2026-04-30) | Case #4'. Empty bin без clips → orphan instantly, recreate в SoT position при следующем FS-event. Нет drift signal because nothing misplaced (import triggers files, не folders) |
| **53** | **Mirror DEL = MVP via diff + safety hierarchy** (2026-04-30) | Не parked. 3-way handshake gates entry; diff between pre-delete manifest и post-delete bin contents categorizes: TRUSTED → trash, SUSPICIOUS → import wins, BROKEN → autoimport-paused. См. §16 |
| **54** | **Bin label rename = silent healthy** (2026-04-30) | Case #12. Premiere bin label = display attribute, mapping через internal bin ID. Custom labeling allowed без drift triggering |
| **55** | **Source / Bin Name display toggle** (2026-04-30) | Column header "SOURCE NAME ▾". ЛКМ = sort, RMB → context menu → toggle "Show Bin Name" / "Show Source Name". Persistent в config. Plugin internally always knows оба имени. См. §13 |
| **56** | **Simplified `broken` = event-trigger flag** (2026-04-30) | NOT row-aggregate. Любой autoimport-pause event сетит `simplified.broken = true` → red toggle bg. User-initiated recovery (Refresh / mode-toggle / eye flip) clears. См. parked-notes.md |
| **57** | **Missing = folder-level only** (2026-04-30) | Single-file FS deletion → Premiere native offline-reference UI handles. Plugin не intervenes на file-level. Row stays healthy (case #7). См. §9 |
| **58** | **Two-step recovery distinction** (2026-04-30) | Axis B: content recovery (Refresh / mode-toggle) ≠ policy recovery (Advanced + manual eye flip). Stored eye=off persists across content paths — только explicit eye flip restores autoimport policy. Mediator-respectful: policy change requires per-row act. См. §16 |
| **59** | **Herder Bucket DROPPED** (2026-04-30) | Mediator never destructs not-its-own. Side-files в orphan bin сохраняются across FLT toggle / Magnet / Mirror DEL. No "purgatory bucket" needed |

---

## Design debt (parked)

1. **Retry strategy per subtype** (enoent periodic / offline aggressive / eacces no-retry / other generic)
2. **Tooltip differentiation** for Disabled causes (own × / parent SUB / parent disabled)
3. **Ghost row origin** (`user` vs `auto-ghost`) — persisted flag or runtime-derived
4. ~~**Reset-to-inherited glyph** (`↺`, отдельно от ×) — v1.1+~~ **SUPERSEDED by §12** (3-click cycle + selection bar `↺`). Removed from debt.
5. **Ignore patterns in settings** (regex/glob exclude на watch folder) — v2+
6. **Asymmetric EYE lock cascade** — старый debt (parent EYE=on forces children to inherit ON)
7. **Relink-preserve-overrides** edge cases на child
8. **Multi-relink ghost cleanup** — edge case
9. **Visual differentiation** ghost vs user-blacklist на Disabled
10. **Plugin-level Unhealthy** — global state above row model (v1.1+)
11. **Missing+Disabled edge case** — row имеет path=missing AND cause=own-force-disable. По priority Missing выигрывает, но какой тултип / визуал при restore path?

---

## Open questions

- Config schema для force-disable на child: persisted flag с origin (user/auto-ghost)? Или walker регенерирует ghost на каждом проходе?
- Что если Premiere закрыта а watcher обнаружил изменения? Очередь? Игнор?
- Удаление bin вручную в Premiere — action SheepDog (связано с DEL column v1.2)
- Root path внутри другого watched root — запрещено (decision #19), но edge: юзер переименовал папку через OS и новый root оказался под старым
- **Whole-row bulk reset affordance** — selection bar отложен. MVP: column-level через click-on-cell. Нужен ли separate gesture для whole-row reset? Alternative concepts: context menu, `R` keyboard shortcut без UI bar, или delegate к right-click
- **× button behavior edge cases** — context-aware semantics (root=remove, child=force-disable, excluded=restore) зафиксированы, но bulk `×` на mixed selection (root + children) — что делает? Defer
- **"Check & Import" button scoping** — если selection non-empty → импортит только selected rows; если selection empty → все rows. Правило декларировано, но нужно подтвердить в UX testing
- ~~**Simplified / Easy Mode**~~ — **RESOLVED в §13**. Naming = "Advanced" toggle (default OFF). Columns in Simplified: STATE · NAME (hover=path) · ⌕(Missing-only) · SUB · SEQ · LABEL · ×. Per-row EYE overrides доступны только в Advanced.
- ~~**Global Auto-Import toggle semantics**~~ — **RESOLVED в §13**. Toggle renamed "Advanced", поглотил Auto Sync семантику. В Simplified EYE forced ON globally, в Advanced per-row control.

---

## Next steps

**Текущий шаг — Figma handoff**: `figma-sheepdog-states-v1.js` (design-apprentice брифован). На базе section 1 из `figma-sheepdog-panel-v1.2.js` — добавить колонку STATE в row, отрендерить 4 кейса (S1–S4). Валидирует схлопнутую модель визуально перед кодом.

**Потом** — **Implementation**: план в `C:\Users\TVORIM\.claude\plans\ethereal-forging-pelican.md`. State-модель не меняет structure кода — просто добавляет:
- `force_disabled: bool` per-row в config
- Derived `state` computation (healthy/busy/disabled/missing) в runtime
- Subtype field в error object

---

## Artifacts (live)

- [state-axes.csv](state-axes.csv) — 3 state + 3 settings + 1 parked plugin axis (updated 2026-04-30: +sot_parity axis)
- [state-matrix.csv](state-matrix.csv) — 4 cases S1–S4 + parked S5 (S6 Drifted to be added)
- [mirror-decisions.csv](mirror-decisions.csv) — 16-case Premiere↔FS violation matrix (en SOT)
- [mirror-decisions.ru.csv](mirror-decisions.ru.csv) — то же по-русски (тождественная структура)
- [parked-notes.md](parked-notes.md) — active contracts + design debt + decision history Q1-Q10
- [state-design.md](state-design.md) — этот doc
- [../mockups/panel/panel.figma-script.js](../mockups/panel/panel.figma-script.js) — main figma scripter mockup (v2)

## Artifacts (historical, superseded)

Перемещены в [../archive/](../archive/) при reorg 2026-04-29:

- `panel-v1-architecture.md` + `panel-v1.figma-script.js` — старая v1 panel concept
- `panel-v1.2-architecture.md` + `panel-v1.2.figma-script.js` — v1.2 visual использует устаревшую SUB=off-as-subtree-lockout семантику. Новая модель: SUB=off это cause для enabled=no на children
- `states-experiment.figma-script.js` / `tier-cycle-experiment.figma-script.js` / `cols-experiment.figma-script.js` / `checkbox-variants-experiment.figma-script.js` — experimental WIP концепты, слиты в `mockups/panel/panel.figma-script.js`
- `table-prototype.html` / `table-prototype.jsx` / `table-prototype.png` — раннее HTML-prototyping, superseded JS scripter mockup
