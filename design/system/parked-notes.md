# Parked Notes — Mirror Decision Architecture

Накапливаются: (1) активные контракты для dev-implementation; (2) formal
definitions of states; (3) behavior across events; (4) recovery tools mapping;
(5) polish bucket; (6) open questions; (7) implementation guidance;
(8) decision history.

Companion artifacts:
- [`Decision Matrix - Лист1.csv`](Decision%20Matrix%20-%20Лист1.csv) — working
  draft с user рассуждениями (русский), 16 cases
- [`mirror-decisions.csv`](mirror-decisions.csv) — canonical English (нужен
  sync с финальной матрицей)
- [`mirror-decisions.ru.csv`](mirror-decisions.ru.csv) — early Russian draft
  (superseded by Decision Matrix - Лист1.csv)

---

## 1 · Formal definitions of states

### Drift (Axis A — structure parity)

**Definition**: clips для files в tracked FS path **существуют где-либо в
Premiere project**, но **не в bin для соответствующей row**.

**Triggers**:
- Move bin with clips out of parent (#4)
- Move file out of bin in Premiere (#5)
- Partial manual import + watch folder add — clips dedup-rejected, осели в
  чужих bins (#11, real QA case)

**Critical clarification**: drift это «misplaced clips», НЕ просто «bin
under-represents FS». Если clips destroyed (delete bin) — это НЕ drift,
это `paused` (clips отсутствуют где-либо).

**Recovery**: **Magnet** — pull scattered clips into correct bin. NOT
solvable by Refresh (clips уже в Premiere, dedup blocks new import).

**Visual**: 4px solid `accentFill` (dark blue). Cascade up to root.

**Side effect**: Mirror DEL force-disabled для drifted row (§9 structure-lock
сохраняем).

### Autoimport-paused (Axis B — coverage policy)

**Definition**: files в FS существуют, **но clips для них отсутствуют где-либо
в Premiere**, AND plugin failed honor coverage policy при eye=on.

**Triggers**:
- Delete bin/file with clips in Premiere, eye=on (#2)
- Cancel mid-import, eye=on (#2.b)
- Autocancel из-за non-dedup import failure (#11.new — real QA case from MVP)

**Critical clarification**: «plugin failed» не значит «plugin сломан». Это
значит «mediator could not maintain coverage». User act может вызывать —
delete bin = explicit user act, plugin не failed in defective sense, просто
coverage broken.

**Plugin response**: stored eye → off (force-pause). Это **brake** чтобы
prevent retry-loop. Без force-off plugin сразу re-import → recursive.

**Recovery**: **Refresh** — manual content re-sync. Equivalents:
- Mode-toggle 2x (Adv→Simplified or Simplified→Adv→Simplified)
- Manual eye flip on в Adv (full policy restore)

**Visual**:
- Adv: eye-closed glyph per row
- Simplified: red toggle bg (через `simplified.broken=true` event-trigger)

### Healthy

**Definition**: всё OK. Clips где надо, autoimport работает (eye=on) или
disabled осознанно (eye=off, по user intent).

### Disabled

**Definition**: row force-disabled by user (× click) OR cascade. Manifest
preserved. Reversible via ←.

### Missing

**Definition**: **Folder-level** path unreachable. NOT file-level.

**Triggers**:
- Drive offline / network share dropout
- Folder deleted/renamed в Finder
- Permission revoked (eacces)

**File-level missing** (single file deleted в Finder при folder OK) →
**handled by Premiere natively** (offline clip references). Plugin не
intervenes на file-level. Row stays healthy.

### Mirror-deleting (transient)

**Definition**: per §9 — Mirror DEL flow active. Timer running, OS trash
pending. Cancellable.

---

## 2 · Active contracts (firmly decided, для dev implementation)

### 2.1 Eye = trigger timing, DEL = outbound permission

**Eye** controls **когда** plugin acts:
- `eye=on` → automatic actions on FS-watcher events
- `eye=off` → only Refresh (manual) triggers actions

**DEL** controls **разрешено ли** outbound:
- `DEL=on` → Mirror DEL allowed
- `DEL=off` → Mirror DEL blocked

**They are orthogonal** — все 4 combinations valid:
- `eye=on, DEL=off` (default) — auto-import, never trash
- `eye=off, DEL=off` — passive watching, no actions
- `eye=on, DEL=on` (+ master=on) — full bidirectional sync
- `eye=off, DEL=on` (+ master=on) — Refresh-only sync (in & out)

### 2.2 Simplified «broken» state — event-triggered flag

```
on event autoimport-pause for ANY row:
  if simplified == on:
    if simplified.broken == false:
      simplified.broken = true
```

Одноразовый event-trigger. Любая paused row при simplified=on поднимает
**global** flag. Не привязан к конкретной row.

**Resolution flag** clears когда:
- Refresh выполнен (manual content re-sync triggers retry → success →
  autoimport resumes globally)
- Mode-toggle Simplified→Adv→Simplified (mode-cycle = autoimport restart)
- Все paused rows resolved через explicit eye-flip в Adv

Flag НЕ user-toggleable. Триггерится только violation events.

### 2.3 Mirror DEL via diff с safety hierarchy

```
on Refresh OR Premiere watcher event (with eye=on):
  diff = compute_diff(manifest, premiere_state, fs_state)

  if diff.health == TRUSTED:
    apply inbound (import new files from FS)
    if DEL=on AND mirror_master=on:
      apply outbound (Mirror DEL flow per §9)

  elif diff.health == SUSPICIOUS:
    # any doubt: race-condition / partial diff / Premiere unresponsive / clock skew
    apply inbound only
    skip outbound — data integrity wins
    log "diff suspicious — outbound skipped"

  elif diff.health == BROKEN:
    # crash recovery / manifest corrupted / unrecognized state
    force DEL = off globally  # safety brake until user re-enables
    apply inbound only
```

**Hierarchy**: Import wins on doubt. Mirror DEL waits for trustworthy diff.
Crash → DEL globally disabled until user explicit re-enable.

**Detection of «trustworthy»** — implementation-level. Spec НЕ определяет
конкретные checks — только rule «if any doubt → import only». См. open
question 6.1.

**Hard contract**: Mirror DEL **должен** работать при eye=off через Refresh
(diff computed at refresh time, fires если health OK).

### 2.4 Manifest = full FS knowledge

```
manifest = {row_path: [{fs_file_path, premiere_clip_id, status}, ...]}
```

При FS-walk row's folder:
- Каждый file → пытаемся import в наш target bin
- **Success** → entry с new clipID, `status=ours`
- **Dedup-rejected by Premiere** (clip уже existing для этого path) →
  entry с **existing clipID** (Premiere returns matching clip), `status=dedup-existing`
- В обоих случаях manifest entry создаётся

**Why**: позволяет Mirror DEL trash list быть accurate, и drift detection —
correctly identify когда clips misplaced vs absent.

### 2.5 Drift orphan model (детальный flow)

При triggered drift (move bin/file with clips):

```
trigger: bin/file перемещён в Premiere
  ↓
mark old bin as orphan (помечен «чужим», не наша ответственность)
old bin stays where moved — plugin не trogает
  ↓
if eye=on AND new FS-event for this row:
  recreate empty bin in SoT position
  import new file into recreated bin
  (existing clips в orphan bin не reimported — dedup blocks)
  ↓
Magnet (later, manual):
  walk orphan bins
  for each clip in orphan: if its path matches healthy row → move clip into healthy bin
  orphan bin stays where it was (mediator не destructs)
  drift cleared on row, → healthy
```

**Mirror DEL** для drifted row force-disabled (parity required, cannot
trust which bin maps to FS path).

**Side-files в orphan bin** остаются untouched.

### 2.6 FLT selective destruct flow

При `FLT=on` toggle на parent:

```
for sub in parent.subs:
  if sub.has_side_files():
    sub stays (mediator не destructs not-our content)
    extract our files upward (FLT semantic preserved для our content)
    side-files остаются в sub untouched
  else:
    extract our files upward
    destroy sub (sub был 100% ours, safe to remove)
```

При `FLT=off` (revert):

```
for our files в parent's flat-bucket:
  if sub_for_this_file_still_exists() (because side-files preserved it):
    file pulls back into existing sub (sub already has side-files, our file rejoins)
  else:
    sub recreated, file goes in
```

Visual «half-flat» (some subs gone, some stay) — это truth, не bug.

**Herder Bucket DROPPED** — mediator никогда не destructs not-its-own,
поэтому safety net не нужен.

### 2.7 Two-step recovery distinction

**Refresh (manual Check & Import)**:
- Solves **Axis B** (content coverage)
- Re-imports missing clips into existing bins
- Triggers diff health check (per 2.3) before fires Mirror DEL
- **Не** moves existing clips
- Eye stored=off **persists** через Refresh (one-time content re-sync, не
  policy restore)

**Magnet**:
- Solves **Axis A** (structure parity)
- Moves scattered clips into correct bin
- Recreates moved bins в SoT position
- **Не** re-imports new content (для этого Refresh)

**They don't overlap by design.** Если row violates both axes (rare
combination) — нужны оба тула (Magnet first для structure, Refresh потом для content).

### 2.8 Eye pause persistence rule

Когда autoimport-paused fires (eye stored → off):

| Action | Что recovers | Eye stored value |
|---|---|---|
| Refresh | Content (one-time re-sync) | Stays `off` |
| Mode-toggle 2x | Content (one-time re-sync, equivalent Refresh) | Stays `off` |
| Manual eye flip on в Adv | Policy fully restored | Becomes `on` |

**Critical**: только manual eye flip restores policy. Refresh / mode-toggle
не trogают stored eye. После них **next FS event** триггерит pause cycle
снова, пока eye не flipped.

**Why**: mediator-respectful — policy change требует explicit per-row user
act. Content recovery может быть accidental (mode-toggle), и это OK
(content fix не overrides intent).

### 2.9 Empty moved bin rule

**Move bin С CLIPS** → drift (Axis A — clips misplaced).
**Move EMPTY bin** → orphan instantly, healthy (нечего misplaced).

**Why**: drift definition говорит «clips exist somewhere в Premiere но not
в bin». Empty bin → нет clips → нечему быть misplaced → не drift.

**Recovery** для empty moved bin: при следующем FS-event для row plugin
recreate'ит bin в SoT position. Refresh тоже recreate'ит. Orphan bin
остаётся где переехал.

### 2.10 Mirror DEL невозможен в Simplified mode

DEL column hidden в Simplified (per #41 spec). Поэтому DEL=on недостижим →
3-way handshake не складывается → Mirror DEL не fires в Simplified mode.

В Simplified case «delete bin in Premiere with eye=on» = case #2
(autoimport-paused). НЕ Mirror DEL.

**Spec**: добавить explicit статement в §9: «Mirror DEL is unavailable in
Simplified mode (DEL column hidden per #41).»

### 2.11 Source Name / Bin Name display toggle

**Решение**: custom labeling в Premiere bin'ах разрешён. Через display
toggle на column header.

**Контракт**:
1. Column header — `SOURCE NAME` (default mode), не просто `NAME`
2. ЛКМ на header = sort (стандарт)
3. RMB на header → context menu с опцией «Display: Bin Name» (toggle)
4. Two modes:
   - `SOURCE NAME` — все rows show FS-derived имя
   - `BIN NAME` — все rows show Premiere bin label
5. Internal mapping всегда через Premiere internal bin ID. Manifest never
   depends on label. Toggle = display layer only.
6. Hover на row name → tooltip с alternative именем если diverged.

**Implications**:
- Case #12 (rename bin label, без move) → silent. NOT drift.
- Case #4 (move/path-rename bin) → drift (mapping нарушен structurally).

### 2.12 Asymmetric ambiguity axiom (уже в §16 spec)

Plugin's response to destruction events asymmetric:

| destruction trigger | plugin knows intent | response |
|---|---|---|
| Premiere-side (3-way handshake — Mirror DEL) | Yes — deliberate | row gone (no Missing carry-over) |
| Premiere-side (no handshake) | No — see two-axes model | drift OR paused per axis violated |
| FS-side (delete / offline / eacces) | No — ambiguous | always Missing с retry strategy |

---

## 3 · Manifest behavior across events

| Event | Manifest impact |
|---|---|
| Successful import | Entry created с new clipID, `status=ours` |
| Dedup-rejected import | Entry created с existing clipID, `status=dedup-existing` |
| Delete bin (eye=on, no Mirror DEL) | Entries для удалённого bin'а **cleared** |
| Delete bin (Mirror DEL fires) | Entries cleared per §9 flow |
| Move bin (with/without clips) | **Unchanged** — mapping через internal ID, не label/path |
| Rename bin (label only) | **Unchanged** — same internal ID |
| Cancel mid-import | Reflects partial state (some entries created, rest pending) |
| Autocancel (non-dedup error) | Reflects state на момент failure |
| User adds side-file via Premiere | **Unchanged** — мы не tracking чужое |
| User toggles eye=off explicitly | **Preserved** (на случай восстановления) |
| × on row (force-disable) | **Preserved** (soft-stop family) |
| FS file deleted in Finder | Entry **stays** (file becomes offline в Premiere natively) |
| FS folder deleted/offline | Entries stay (row → missing, manifest preserved для recovery) |

---

## 4 · Recovery tools mapping

| Trigger | Violation axis | Tool | Why |
|---|---|---|---|
| Move bin/file in Premiere | A (drift) | **Magnet** | Move misplaced clips |
| Partial manual import + watch folder | A (drift) | **Magnet** | Pull scattered clips |
| Delete bin/file (eye=on) | B (paused) | **Refresh** | Re-import missing |
| Cancel mid-import | B (paused) | **Refresh** | Continue imports |
| Autocancel (non-dedup) | B (paused) | **Refresh** | Retry imports |
| Folder offline / drive disconnected | (Missing) | Reconnect | Environmental |
| Folder deleted in Finder | (Missing) | Relink (⌕) or × | Ambiguous origin |
| User explicit eye=off в Adv | (User intent) | Eye flip on | User act, no auto-recovery |
| User × on row | (User intent) | ← (arrow-left) | User act, soft-stop |

**Mode-toggle 2x** (Simplified↔Adv↔Simplified) = equivalent Refresh для
Axis B. НЕ recovery для Axis A — структура mode-toggle'ом не лечится.

---

## 5 · Polish bucket (visual / UX refinements)

### Pulse / blink LED при first violation event

При первом violation для row (drift OR autoimport-paused) — короткий pulse
LED для attention. Не blocking, просто attention attractor.

### Side-file info indicator на row

Когда bin содержит side-files (over-representation, not drift) — тонкий
info chip или dot на row для visibility. Чисто information, не enforcement.

### Footer tip «unknown import failure — try relaunch premiere»

Для case #11.new (autocancel) — текстовая подсказка в footer / tooltip.
Помогает юзеру понять что delegate'ить downstream.

### Magnet кнопка в Simplified header (открытый дизайн)

Открытый вопрос: добавлять ли Magnet в Simplified header (5-button row)?

- Pro: drift recovery directly in Simplified без mode-switch
- Con: загромождает minimal chrome philosophy

Если НЕ добавлять — recovery для drift в Simplified через mode-toggle в Adv +
Magnet там.

### DEL countdown ring visual (DROPPED — не утверждено)

В §9 был описан красный borderCountdown ring на DEL ячейке. **Нигде не
утверждено визуально**.

Текущее: timer показывается **только в progress panel** (+ LED state
mirror-deleting на row).

### Drift cascade visual policy

Final: full cascade up to root, тот же 4px solid `accentFill` для всех
drifted rows. Truth wins over aesthetics. Если позже окажется чрезмерно —
разделить full vs soft-cascade indicator.

### Hover tooltip на row name (active feature, see 2.11)

В обоих modes (SOURCE NAME / BIN NAME) hover на row → alternative имя
показывается tooltip'ом если diverged.

---

## 6 · Open questions (для будущего обсуждения)

### 6.1 DEL diff health detection — concrete checks

Detection of «trustworthy» левый на implementation. Какие конкретно health
checks предлагаются?

Кандидаты:
- Premiere process responsiveness (heartbeat ping)
- Manifest schema integrity (deserialize OK, no nulls в required fields)
- Recent FS events queue drained (no in-flight)
- Clock tolerance (manifest timestamps within reasonable bounds)
- Plugin's own state machine in clean state (no in-flight ops)

Нужно prototype + validate с QA scenarios.

### 6.2 Magnet button visibility in Simplified

См. polish bucket. Не решено.

### 6.3 Real-world QA test plan when matrix finalized

После финализации матрицы — пройти каждый case через actual QA scenarios
с реальным Premiere'ом. Особенно:
- #11 (partial manual + watch folder)
- #11.new (autocancel)
- #4 (move bin) с FLT toggle

Validate что spec matches actual behavior.

### 6.4 «Spinning» edge cases — drift + paused coexistence

Rare scenarios where row violates both axes:
- Cancel mid-import → partial files imported → user moves what's imported
  to wrong bin → drift (clips misplaced) + paused (incomplete coverage)
- Move bin with clips → user удаляет файлы из FS → drift (was clips
  misplaced) + missing (now FS path issue)

Validate UI signals не conflict (yellow LED + eye-closed glyph + red toggle
in Simplified одновременно — readable?). Polish-bucket.

---

## 7 · Implementation guidance — что нужно сделать

### Spec updates (state-design.md)

1. **§1** — drifted state added (4px solid `accentFill`); Missing
   clarified как folder-level only; cascade rule
2. **§9** — Mirror DEL diff-based + safety hierarchy + Simplified-disabled
   + autocancel mention; countdown ring marked dropped
3. **§14** — переписан: orphan model + selective FLT (side-files protect
   subs) + Herder Bucket DROPPED + Magnet expanded scope; Scenarios A-D
   refactored
4. **§16** — axiom expanded: eye=timing, DEL=permission, axes A/B
   independent, asymmetric ambiguity, manifest-as-FS-knowledge

### CSV sync

5. **mirror-decisions.csv** — sync с финальной русской матрицей (16 cases)
6. **mirror-decisions.ru.csv** — superseded, либо удалить либо point to
   Decision Matrix - Лист1.csv

### JS mockup updates (panel.figma-script.js)

7. `panelHeader()` / `panelHeaderSimplified()` — column header text:
   `NAME` → `SOURCE NAME`. Add chevron `▾` для context menu hint.
8. **§1 demo rows** — добавить drifted state demo row + paused state demo row
9. **§1 annotation cards** — S5 «Drifted» + S6 «Autoimport-paused» (или
   объединить в «Mirror desync» card)
10. **§9 implications** — update текстовку с diff-based DEL + Simplified note
11. **§11 icon legend** — add Source/Bin Name toggle entry + Magnet
    expanded scope mention
12. **§14** — переписать full section: drop Herder Bucket, refactor
    scenarios, add orphan model
13. **§REF state taxonomy** — +1 column drifted; autoimport-paused —
    note as sub-state (not main LED class)

### Decision Matrix - Лист1.csv

14. После audit (этот документ) — confirmed final, sync to English.
15. После sync — может быть renamed `mirror-decisions-discussion.csv` или
    deleted (decision juzer's).

---

## 8 · Decision history (chronological Q&A log)

### Q1 — Mirror DEL prerequisite eye=on?

Initial proposal (mine): require eye=on for DEL.

Юзер's clarification: eye = trigger timing (auto vs manual), DEL = outbound
permission. Они orthogonal, не require each other.

**Confirmed (2026-04-29)**: eye/DEL orthogonal, не prerequisite. Spec §9
already correct (никакого eye=on requirement). Update §16 axiom для clarity.

### Q2 — Herder Bucket judg

Initial proposal (in earlier §14): Herder Bucket as safety net для
side-files when destructive op.

Юзер's pushback: если plugin никогда не destructs not-its-own → safety net
не нужен. Mediator pure principle.

**Confirmed (2026-04-29)**: Drop Herder Bucket entirely. FLT selective
destruct (sub stays if has side-files). Scenarios A-D refactored.

### Q3 — Drift visual + cascade

Initial proposal (mine): yellow hollow 6px LED для drifted; soft cascade
до direct parent.

Юзер's pushback: 4px solid `accentFill` (existing palette token) — reuse,
не invent. Full cascade up to root — truth over aesthetics.

**Confirmed (2026-04-29)**: 4px solid `accentFill`, full cascade.

### Q4 — Axes formulation precision

Initial proposal (mine): Axis A = «bin under-represents FS» (broad).

Юзер's pushback: drift = «files в Premiere но не дома» (clips misplaced).
Paused = «files в FS без clips где-либо» + plugin failure. Different axes,
different recovery tools.

**Confirmed (2026-04-29)**:
- Drift = misplaced clips (Magnet recovers)
- Paused = absent clips + plugin failure (Refresh recovers, force-pause
  prevents retry-loop)
- Independent axes, can coexist

### Q5 — Bin label rename initial decision

Initial proposal (mine): silent + Mirror DEL block.

Юзер's pushback: конгруэнтность с case #4 ломается (move=drift но
rename=silent — inconsistent). Pure mediator: bin label = часть SoT.

Я первоначально согласился (drift). Но затем юзер отозвал:

### Q6 — Bin label rename revised — allow custom labeling

Юзер's revised position: Source Name / Bin Name display toggle. Plugin
respects user's labeling autonomy. Custom rename → silent.

**Confirmed (2026-04-29)**:
- Column header `SOURCE NAME` (default), RMB → toggle `BIN NAME`
- ЛКМ = sort (Premiere standard)
- Internal mapping через Premiere internal bin ID (label = display layer)
- Case #12 → silent

### Q7 — Empty moved bin

**Confirmed (2026-04-29)**: orphan instantly, NOT drift. Reason: нечего
misplaced (no clips). Recovery: refresh при FS-event recreate bin.

### Q8 — Simplified «broken» state contract formalization

Initial proposal (mine): row-aggregate state.

Юзер's correction: event-trigger flag, set on ANY pause event при
simplified=on. Не aggregate. Не user-toggleable.

**Confirmed (2026-04-29)**: pseudo-code контракт записан в 2.2.

### Q9 — Manifest definition (α vs β)

Two options:
- α: manifest = log of plugin's successful imports
- β: manifest = full FS knowledge (включая dedup-rejected)

Initial my position: β (full knowledge).

Юзер's critique: β interpretation создаёт illusion что dedup invisible. Real
QA case (#11): user импортит manually, потом adds watch folder, plugin
видит dedup-rejected — в bin nothing landed (clips остались в чужих bins).
User видит «плагин не сработал» — даже если manifest fully populated.

**Resolved (2026-04-29)**: manifest = β (full FS knowledge), но drift
detection added — после walk SheepDog проверяет «все ли manifest clips
физически в нашем bin?». Если нет → drift. Это address QA case через
visible signal без жертвы manifest model integrity.

### Q10 — Spec update sequence

После audit + user review русской матрицы: sync English CSV → patch spec
(§1/§9/§14/§16) → patch panel.figma-script.js → commit batch.
