# Edge Cases — WIP working doc

> **Purpose**: дискуссионная площадка для open architectural questions. Решения локятся здесь сначала, затем sync'аются в `state-design.md` / `parked-notes.md` / `mirror-decisions.csv` / `panel.figma-script.js`.
>
> **Workflow**: question → options → discussion → DECISION → sync target identified → checked off (move to «Closed» bottom section).
>
> **Status marks**:
> - 🟢 **LOCKED** — решение принято, готово к sync
> - 🟡 **LEANING** — proposal на столе, awaiting user confirm
> - 🔴 **OPEN** — нужна discussion / data
> - ⚫ **PARKED** — отложено в polish bucket / v1.1+, в spec идёт как «parked» note
>
> **Sync targets** (где decision должна отразиться когда LOCKED):
> - `state-design.md` — primary spec (numbered §, decision log)
> - `parked-notes.md` — active contracts, design debt, polish bucket
> - `mirror-decisions.csv` — 16-case event matrix
> - `panel.figma-script.js` — visual mockup

---

## 🚨 Active deep-dive block (NEXT)

После lock'а всех confirmed items ниже — **T4.1 + T4.3 это единый архитектурный блок**:
- T4.1 — Root-inside-root через OS rename / move
- T4.3 — Merge linking mechanic (Missing row → existing covered path)

Они tightly связаны: оба про situation когда FS-side move создаёт overlap между tracked roots, и оба требуют merge / dedup logic. Решать вместе.

См. секции внизу (Tier 4) — там discussion notes собраны для focused session.

---

## Tier 1 — Blocks implementation

### T1.1 — Force-disable child storage 🟢 LOCKED (two-flag model)

**Q**: как мы запоминаем что child row force-disabled между запусками плагина?

**Decision**: Two-flag composable model.

**Per-row flags:**
- `manually_disabled: bool` — set by user × click. Cleared by user ← click. Independent of FS / parent state.
- `forced(reason)` — set by plugin under conditions. Reasons:
  - `parent-sub-off` — auto-clears when parent SUB → on
  - `parent-disabled` — auto-clears when parent re-enables
  - `path-missing` — auto-clears when path returns
  - ~~`auto-ghost`~~ — **ELIMINATED** per T3.3 (FS-SoT principle, no ghost rows needed)

**Effective state**:
```
effective_disabled = manually_disabled OR (forced != null)
```

**Recovery asymmetry:**
- `←` clears `manually_disabled` only
- Plugin auto-clears `forced` when cause clears
- Both flags can coexist (rare combo) — both must clear для row → enabled

**Sync targets**:
- `state-design.md` §"5. Disabled causes" — extend with two-flag model
- `state-design.md` §"7. Ghost row" — переименовать / переписать (см. T3.3)
- Decision log entry
- Config schema (при implementation)

---

### T1.2 — Premiere closed + watcher events 🟢 LOCKED (silent + global progress)

**Q**: что плагин делает с FS events которые произошли пока Premiere был closed?

**Context**: плагин = CEP extension, живёт inside Premiere process. Premiere closes → plugin closes. Watcher мёртв between sessions. Events lost. На startup walker re-probes.

**Decision**: **(b) async — silent at row + global progress + non-locked buttons**.

**Mechanics:**
- UI открывается **мгновенно** на cached manifest
- Initial walker async background, deltas через нормальный event pipeline
- Row LEDs остаются healthy (не busy) — scan ≠ import
- Progress visible в §10 panel («Initial scan: 3/47 watch folders»)
- **Buttons НЕ locked** — walker idempotent + transactional per-event

**Edge cases handling:**

| user act during scan | walker behavior |
|---|---|
| × on row | config updated → walker on next event respects no-row → doesn't add |
| Toggle SUB / EYE / etc | config updated → walker idempotent re-reads each iteration |
| Refresh click | no-op (already scanning) |
| Mirror DEL fires | gated by predicates (T1.3) — manifest freshness fails → SUSPICIOUS → block |
| Magnet click | no-op (drift not yet detected — manifest still building) |
| Add new watch folder | enqueued, walker picks up |

**First-ever open (no cache):** UI пустая + progress в §10 panel. Когда первая folder scanned → её row appears.

**Sync targets**:
- `state-design.md` — new §"Initialization & async walk" subsection (или extend §"Implementation")
- `parked-notes.md` §"Active contracts" — async-walk + walker-idempotency contracts
- `panel.figma-script.js` §10 — progress panel «Initial walk in progress» variant (TBD design)

---

### T1.3 — DEL diff health checks 🟢 LOCKED (block + uncheck + recursive)

**Q**: какие конкретные signals категоризируют diff в TRUSTED / SUSPICIOUS / BROKEN, и что делать на SUSPICIOUS / BROKEN?

**TRUSTED — все должны hold:**
- Diff exact match: deleted bin manifest entries == FS files мы tracked, no extras
- Manifest fresh: timestamp последнего sync < 30s назад
- Premiere ExtendScript responsive: heartbeat ping returned within 500ms timeout
- No concurrent FS event for этого path (queue empty for this row)
- Plugin state machine clean: no in-flight ops для этой row

**SUSPICIOUS — любое из:**
- Diff has gaps: clip в deleted bin которого не было в нашем manifest (user side-file)
- Dedup-rejected entries elsewhere в Premiere (clips moved, не deleted)
- Manifest stale: timestamp > 30s threshold
- Premiere reports fewer/different items than expected
- FS shows files we не tracked в deleted bin

**BROKEN — любое из:**
- Manifest deserialize fails / null in required fields
- ExtendScript returns error / timeout
- Plugin state corrupted: in-flight op detected, race condition
- Multiple events firing simultaneously для same row
- Clock skew: manifest timestamp from future / impossible past

**Behavior on each tier:**

| tier | action |
|---|---|
| **TRUSTED** | proceed → OS trash with 5s cancellable timer |
| **SUSPICIOUS** | block trash + force-uncheck DEL on row + plugin attempts heal (sync manifest, ping ExtendScript) → fall through to recursive autoimport-pause event fires (Coverage violation, no DEL alignment now) |
| **BROKEN** | abort destructive path → recursive autoimport-pause event fires |

**Both SUSPICIOUS and BROKEN** converge на autoimport-pause event firing. Difference: SUSPICIOUS additionally unticks DEL on row + attempts self-heal.

**Feature gate** (release-level): DEL не shipping до того как ALL predicates implemented + tested. Слишком опасная функция чтобы ship с partial coverage.

**Notification** на SUSPICIOUS/BROKEN — parked v1.1+ (no UX surface for explanation in MVP).

**Sync targets**:
- `parked-notes.md` §6.1 — replace «open question» with locked predicates
- `state-design.md` §16 Mirror DEL — add SUSPICIOUS = block+uncheck behavior detail
- `panel.figma-script.js` §9 mdDiff card — update SUSPICIOUS row («import wins» → «block trash + uncheck DEL + recursive pause»)

---

### T1.4 — Manifest persistence cadence 🟢 LOCKED (hybrid d)

**Decision**: **(d) Hybrid — debounced batch + immediate-on-critical**.

**Mechanics:**
- In-memory always current
- Debounced flush 200-500ms after mutations (high-frequency events batched)
- Immediate flush on critical events: Mirror DEL fires, autoimport-pause, drift-detection, merge

**Crash window:** ~500ms. Critical events immediate.

**Sync targets**:
- `state-design.md` — new §"Manifest" section
- `parked-notes.md` §"Active contracts" — manifest persistence contract

---

### T1.5 — Event ordering 🟢 LOCKED (sequential, idempotent)

**Decision**: events sequential by nature (different triggers), idempotent (firing twice = same result), no ordering rules needed. Loop невозможен by design (drift не triggers imports; pause prevents future autoimport).

**Sync targets**:
- `state-design.md` §"Events" — add idempotency note
- `parked-notes.md` §"Active contracts" — event idempotency contract

---

## Tier 2 — UX details

### T2.1 — Tooltip differentiation для Disabled causes ⚫ PARKED

Tooltips это polish bucket. Park v1.1+.

**Sync targets**:
- `parked-notes.md` §5 Polish bucket — add tooltip differentiation entry

---

### T2.1' (REFRAMED) — Override-enable child despite parent SUB=off / parent disabled 🟢 LOCKED

**Q**: можно ли override-enable child пока parent SUB=off или parent disabled?

**Decision**: Yes — both scenarios coexist через unified per-row `effective_enabled`.

**Mechanic:**
- Per-row `effective_enabled = !manually_disabled AND !forced` (independent compute)
- `manually_enabled` (user click ←) overrides `forced(parent-cause)` для этой row
- Walker checks per-row, не cascade

**Two scenarios both enabled:**

**A) Parent SUB=off + child override-enable:**
- Walker still respects SUB=off для других children
- Override'нутый child specifically watched
- Use case: «не recurse, но эту конкретную папку tracked»

**B) Parent disabled + child override-enable:**
- Parent's bin recreates as **empty placeholder** в Premiere (bin tree must mirror SoT)
- Parent's own FS path NOT watched
- Child's FS path IS watched
- Imports flow в child's bin, parent's stays empty

**New mechanism added**: auto-create empty placeholder bins для ancestor chain when descendant enabled. Это additional implementation work но affordance valuable.

**Sync targets**:
- `state-design.md` §"5. Disabled causes" — add override-enable mechanic
- `state-design.md` §"Implementation" — placeholder bin auto-create rule
- `mirror-decisions.csv` — possibly new case for «override-enable in disabled subtree»

---

### T2.3 — Bulk × on mixed selection 🟢 LOCKED

**User decision**:
- Click on **child** × → all children в selection take it (as capable). Roots & missing rows ignore (different event).
- Click on **root** × → root mutates (gets removed). Its children пострадают потому что parent gone. Other roots / missing rows ignore.
- Same grammar как 3-cycle bulk in §4.

**Sync targets**:
- `state-design.md` §6 × matrix — extend with bulk rules
- `panel.figma-script.js` §1 × annotation card — add bulk note

---

### T2.4 — Whole-row bulk reset affordance ⚫ PARKED

**Sync targets**:
- `parked-notes.md` §5 Polish bucket — already mentioned

---

### T2.5 — Missing + Disabled edge case visual 🟢 LOCKED (no special visual)

**User decision**: после relink missing решён, остаётся обычный Disabled. No special visual.

**Sync targets**:
- `state-design.md` design debt #11 — close as «no visual needed; Disabled subsumes after restore»

---

### T2.6 — Relink mechanics 🟢 LOCKED (refined rules)

**Refined relink rules table:**

| target path | result |
|---|---|
| **Inside any tracked root's recursive coverage** (даже если row там ещё не создан) — duplicate-tracking attempt | REFUSE — нельзя 2 row для одного path |
| **Inside another tracked tree's coverage, но это explicit user intent — Missing row → existing path** | **MERGE** — see T4.3 (deep-dive block) |
| **Outside all tracked coverage** | row → new ROOT |
| **ABOVE existing tracked root** (новый path содержит existing root) | RESTRUCTURE — see T4.1 (deep-dive block) |
| **Same path as relinked row's current** | refuse (no-op) |

**Children of relinked row:**
- Translocate как «виноградная ветвь» в config tree вместе с parent
- Если в новом FS pathname дети-«близнецы» found (name match) → они inherit positions
- Если не found → dead-weight Missing

**Folder rename via relink:**
- Source Name updates (FS basename)
- Bin Name preserved (Premiere bin ID intact)

**Sync targets**:
- `state-design.md` §7 Ghost row → переименовать в "Relink mechanics"
- `state-design.md` §"Events" — add `relink` event row
- `mirror-decisions.csv` — possibly new case
- Decision log entry

---

## Tier 3 — Polish-friendly

### T3.1 — Retry strategy per Missing subtype 🟢 LOCKED (best-practice intervals)

**Q**: когда плагин re-probe'ит Missing path чтобы detect возврат?

**Decision**: best-practice intervals + OS-event integration.

**Intervals:**

| event | strategy |
|---|---|
| **Plugin initialization** | 100% retry — walker re-probes ALL paths from scratch |
| **Runtime enoent** (folder gone) | periodic re-probe 30s × 5 → 5min × 12 → 1h indefinitely. Stop after 24h без success (unless user clicks Refresh) |
| **Runtime offline** (drive unmounted) | OS volume mount event = instant short-circuit (macOS `NSWorkspaceDidMountNotification` / Windows `WM_DEVICECHANGE`). Fallback poll 5-10s × 60 → 1min × 30 → 5min indefinitely |
| **Runtime eacces** (permission denied) | NO auto-retry. User clicks Refresh required |
| **Runtime other** (IO / symlink / path too long) | 1min × 10 → 10min indefinitely |
| **User-clicked Refresh** | bypass schedule, immediate probe |

**Common rules**:
- Jitter ±20% чтобы избежать thundering herd на shared drive
- All retries fire async, не блокируют UI

**Sync targets**:
- `state-design.md` §"10. Missing subtypes" — был parked, теперь lock with concrete intervals
- Move from design debt #1 to active contract

---

### T3.2 — Cascade на existing children при parent toggle 🟢 LOCKED (live-bind uniform)

**Decision**: live-bound inheritance, uniform across toggle columns.

**Rules:**
- Children с no stored value live-bind to parent's current value
- User pin (override) breaks binding
- Per-column behavior:
  - **Toggle columns** (SUB / EYE / SEQ / REL / FLT) — live-bind uniform
  - **LBL** — computed at creation (per-row organization, не cascade)
  - **DEL** — never inherits (#41), default off, opt-in per row

**Settings UI extension** (per user spec):
```
Settings:
├── Root defaults (5 columns: SUB | SEQ | EYE | REL | FLT)
│   └── on/off toggles — applied to NEW root rows
└── Children defaults (5 columns)
    └── per-cell: "I" (Inherit from parent) OR "D" (use root Default)
```

MVP с буквами I/D — ugly но работает. Polish v1.1+:
- Radio buttons: ⊖ Inherit / ⚙ Default
- Or chips, or visual indicator

**Implications:**
- Walker creates new child → reads I/D per column → applies inherit-from-parent или default-from-settings
- Existing children stay where они were (per live-bind: with no stored value — auto-update on parent toggle; with pinned value — stay pinned)

**Sync targets**:
- `state-design.md` §12 Tier model — confirm live-bind мechanic
- `state-design.md` §15 Settings — add «Children defaults» subsection
- `panel.figma-script.js` §12 Settings card — add Children defaults subsection
- `parked-notes.md` §"Active contracts" — inheritance live-bind contract
- `parked-notes.md` §5 Polish bucket — I/D letters → better visual (v1.1+)

---

### T3.3 — Multi-relink ghost cleanup 🟢 LOCKED (FS-SoT, no ghost rows)

**Decision**: **FS-SoT principle** — plugin reflects FS truth, no ghost rows.

**Mechanic:**
- User relinks row A → B
- Row перемещается на B
- Path A на FS остаётся (не deleted)
- Walker on next pass — если A under tracked root → walker creates new row at A с default settings → imports content
- **No ghost mechanism, no `forced(auto-ghost)` flag**

**Implications:**
- T1.1 forced reasons упрощены (no auto-ghost)
- Mental model упрощается — plugin ВСЕГДА reflects FS truth, никаких «hidden remembered intents»
- Если юзер хочет чтобы A не tracked → пусть удалит folder через Finder (FS = SoT)

**Sync targets**:
- `state-design.md` §"7. Ghost row" → переписать как "Relink mechanics" (no ghost concept)
- `state-design.md` design debt #3 (Ghost row origin), #8 (Multi-relink ghost cleanup) — close as «no ghost mechanism»

---

### T3.4 — Path conflict on relink 🟢 LOCKED (refined)

**Decision (refined per T4.3 discussion)**:
- **Refuse** if target = duplicate-tracking attempt (path already covered, нет explicit merge intent)
- **Allow as MERGE** if user explicitly relinks Missing row → existing covered path (T4.3)

**Sync targets**:
- `state-design.md` §7 — clarify refuse vs merge
- Decision log entry

---

### T3.5 — Ghost row vs user-blacklist visual 🟢 LOCKED (moot)

**Decision**: ghost concept eliminated (T3.3). Question moot.

**Sync targets**:
- `state-design.md` design debt #9 — close as «ghost concept eliminated»

---

### T3.6 — Plugin-level Unhealthy (S5) ⚫ PARKED

**User idea**: плагин logo (8-bit sheep) рендерится как «dead sheep» variant when global plugin state unhealthy.

**Sync targets**:
- `parked-notes.md` §5 Polish bucket — add «Dead sheep logo for Plugin Unhealthy state»
- `state-design.md` §11 Plugin-level Unhealthy — note dead-sheep visual concept

---

### T3.7 — «Spinning» edge case (drift + paused coexistence) ⚫ PARKED

**Visual concern**: 4px solid `accentFill` (drifted) + eye-closed glyph (paused) + (Simplified) red toggle bg = three signals simultaneously. Readable?

**Decision**: Park. На QA validate. Recovery sequencing — Magnet → Refresh, или Refresh → relink в зависимости от combo.

**Sync targets**:
- `parked-notes.md` §6.4 — leave open with «validate at QA» note
- `state-design.md` §16 — add note про coexistence recovery sequencing

---

### T3.8 — Magnet button в Simplified header ⚫ PARKED

**Sync targets**:
- `parked-notes.md` §5 Polish bucket — already there

---

## Tier 4 — Deep-dive block (NEXT FOCUS)

### T4.1 — Root inside watched root (via OS rename / move) 🔴 OPEN — needs refining

**Original spec context** (decision #19): root path inside watched root запрещён. Edge case: user перемещает folder via OS такая что watched root ends up nested.

**User's clarification on simple case (Scenario X):**
- `/a/b/c/d`, plugin watches `b` (= `/a/b`)
- User renames `/a` → `/xyz`
- Path `/a/b` no longer exists → row → **Missing**
- Stand recovery: Relink на `/xyz/b` (preserves settings) или × delete
- **Trivial — no special handling.**

**My original framing (Scenario Y) — actually distinct case:**
- Plugin watches `/A` AND `/B` (two separate roots)
- User moves `/B` via Finder INTO `/A/B/`
- After move: `/A/B/` exists physically, `/B` no longer exists
- Walker results:
  - Root2 (`/B`) → path missing → Missing
  - Root1 (`/A`) walker → sees new content `/A/B/` → autoimport
- **No nested-root config violation** — это два независимых events, обрабатываются normally

**Open question**: что с **settings preservation** для Root2 после move?

Two paths:

**(A) Simple — manual user-driven relink:**
- Root2 → Missing (standard)
- Root1 → walker imports new content with default settings (lose Root2's config)
- User видит Missing + new content
- User вручную Relink'ает Missing row на `/A/B/` → triggers MERGE (T4.3)
- Settings preserved через merge dialog

**(B) Smart — plugin auto-detects move:**
- Plugin detects file-content/inode match between gone Root2 path и new content под Root1
- Notification: «Detected /B moved to /A/B. Apply Root2's settings to new location?»
- User confirms → settings auto-migrate
- **Complex** — fingerprint matching, false positives risk

**Connection to T4.3 (merge)**: путь (A) превращает T4.1 в **trigger для merge flow** (T4.3 handles the actual logic). Путь (B) добавляет automation на top of merge logic.

**Proposal (Claude)**: **(A) simple** — manual user-triggered merge. Plugin не auto-detects move. Aligned с «mediator never destructs / second-guess not-its-own». Auto-detection (B) — park v1.1+.

**User position**: needs further discussion (per current message thread).

**Decision blockers**:
- Locking T4.3 (merge mechanic) first — потому что (A) depends on merge flow being solid
- After T4.3 lock → T4.1 reduces to «manual user relink → triggers merge» (trivial)

---

### T4.2 — Bin rename + move simultaneously 🟢 LOCKED

**User decision**: Drift wins. Bin orphan'ed. Rename даже не доходит до плагина уже. Row LED dimmed-blue (drifted).

**Logic**: rename = silent (case #12), drift = visual (case #4). Drift takes precedence.

**Sync targets**:
- `mirror-decisions.csv` case #4 notes — add «if rename + move simultaneously: drift wins»
- `state-design.md` §16 — possibly add edge case note

---

### T4.3 — Merge linking mechanic 🔴 OPEN — main deep-dive

**Q**: как обработать relink Missing row на path что уже covered другим tracked root? И как избежать double-import при OS folder move?

**Two sub-problems:**

#### Sub-problem 1: Merge dialog mechanic (когда user explicitly relinks)

**Refined linking policy:**
- Refuse: 2 rows для одного physical path (duplicate-tracking)
- **Allow as MERGE**: Missing row → path covered by another tracked tree (explicit user intent to unify)

**UI dialog:**

```
┌────────────────────────────────────────────────┐
│ Merge folder                                   │
│                                                │
│ Row "External Footage" (Missing) will merge    │
│ into existing tracked path /Project/Footage    │
│                                                │
│ Settings to keep:                              │
│  ○ Receiving side (/Project/Footage)           │
│  ● Incoming side (External Footage)            │
│                                                │
│ Children analysis:                             │
│  • 8 files match by name → will MERGE          │
│  • 3 files no match → dead-weight Missing      │
│  • 2 children rows match by name → cascade     │
│                                                │
│  [Cancel]  [Merge]                             │
└────────────────────────────────────────────────┘
```

**Children logic:**
- Name-match с receiving side child → merged (settings choice cascades)
- No name-match → dead-weight Missing under new parent
- Inheritance-pinned children → inherit parent's new effective settings (per T3.2 live-bind)

**Bins logic:**
- **Receiving side wins** — existing bin structure preserved
- Incoming side's bins effectively dissolve (clips migrate via auto-dedup, см. ниже)
- Empty bins без side-files → cleanup (mediator принцип, manifest-empty only)
- Empty bins WITH side-files → preserve

#### Sub-problem 2: Double-import prevention via auto-dedup-at-merge-time

**Problem flow:**
1. User moves folder via OS (`/A/B` → `/C/B`)
2. Premiere clips для `/A/B/file.mxf` → offline (paths gone)
3. Plugin walker через секунды → видит new files в `/C/B` → autoimport (eye=on default)
4. Result: **double import** — old offline clips + new auto-imported clips

**Rejected approaches:**
- ❌ Premiere API lockdown (option a) — `onMediaOffline` API timing unreliable, lazy
- ❌ Disable autoimport for new children — bad UX in legitimate cases
- ❌ Pre-detect via OS API — non-portable, complex

**Adopted approach: auto-dedup via `changeMediaPath()` at merge time**

Premiere API: `ProjectItem.changeMediaPath(newPath)` + `canChangeMediaPath()`. Plugin программно relink offline clips на existing imported clips.

**Auto-dedup algorithm at merge:**
```
for each offline_clip in incoming_side's_offline_clips:
  matches = find_clips_in_receiving_side's_subtree where:
    name == offline_clip.name AND
    size == offline_clip.size AND
    mtime == offline_clip.mtime
  
  if exactly_one_match:
    changeMediaPath(offline_clip, match.path)  # relink offline → new path
    if match.is_used_in_timeline:
      keep both (offline now relinked, match was duplicate but timeline-used)
    else:
      delete match  # was a duplicate auto-import, safe to remove
  
  elif multiple_matches OR no_matches:
    keep offline as Missing dead-weight (user decides manually)
```

**Notification post-merge:** «Merged X files. N duplicates removed. K duplicates kept (timeline usage).»

**Edge cases:**

| edge | handling |
|---|---|
| Same name+size+mtime, different content (rare) | strict match. Mitigation: optional Settings toggle «aggressive dedup with content hash» (slow, off by default, parked v1.1+) |
| User did relink in Premiere himself before plugin sees | `changeMediaPath()` refuses (clip already linked); no-op, log it |
| File timeline-used + duplicate detected | keep both (timeline-used wins) |
| Side-files в incoming bins | preserved per «mediator never destructs not-its-own» |

#### Move heuristic auto-detection (parked v1.1+)

Watcher buffers DELETE+ADD events в time window (e.g. 1s). Matching name+size+mtime → treat as MOVE (update manifest in place + `changeMediaPath()` proactively, no double import). Skip user-triggered merge altogether.

**Complexity high → park as polish v1.1+.**

#### Questions for confirm:

1. Merge dialog UI (settings choice + children preview + Cancel/Merge) — OK?
2. Auto-dedup via `changeMediaPath()` (strict name+size+mtime match) — OK?
3. «Aggressive dedup with content hash» Settings toggle parked v1.1+ — OK?
4. Move heuristic auto-detection parked v1.1+ — OK?
5. Empty bins без side-files cleanup at merge — OK?
6. Premiere API lockdown rejected (unreliable) — OK?

**Status**: 🔴 OPEN — awaiting user confirms на 6 sub-questions выше.

**Sync targets when LOCKED**:
- `state-design.md` §"7. Ghost row" → "Relink mechanics" — add merge sub-section
- `state-design.md` §"Events" — add `merge` event row (mutates: row removed from config + receiving row's manifest enriched + Premiere clips auto-relinked)
- `mirror-decisions.csv` — add merge case
- `parked-notes.md` §"Active contracts" — merge contract
- `parked-notes.md` §5 Polish bucket — aggressive dedup, move heuristic
- `panel.figma-script.js` — possibly merge dialog mockup card (TBD)

---

## Foundational rules (27 explicit rules)

После сессии 2026-04-30: extracted всё что implicit'но или явно locked в систему правил. Решения в decision matrix derive from these.

### Принципы (semantic-уровень)

**1. FS = SoT** — plugin reflects FS truth. Folder existуeт на FS → walker tracks. Никаких ghost rows. (T3.3)

**2. Mediator never destructs not-its-own** — side-files / side-bins preserved через все operations. (T2.6, §14 Magnet)

**3. Asymmetric ambiguity axiom** — Premiere-side destruction = deliberate (3-way handshake), FS-side = ambiguous → Missing. (§16)

**4. Eye = trigger timing, DEL = outbound permission** — orthogonal axes. (parked-notes 2.1)

**5. Manifest = full FS knowledge** — incl. dedup-rejected entries. (parked-notes 2.4)

### State / data model

**6. Three-tier model** — States observable / Settings mutable / Events verbs. Idempotent, sequential. (state-design §"Events")

**7. Two-axes violations** — Axis A drift (clips misplaced) / Axis B paused (Coverage broken). Non-overlapping recovery (Magnet vs Refresh). (§16)

**8. Two-flag disability** — `manually_disabled` + `forced(reason)` composable. Reasons: parent-sub-off / parent-disabled / path-missing. NO auto-ghost. (T1.1)

**9. Per-row effective_enabled** — override-enable possible despite cascade. Auto-create empty placeholder bins для ancestor chain when descendant enabled. (T2.1')

**10. Live-bind inheritance** — children с no stored value follow parent live, pin breaks. Settings has «Children defaults» с per-column I/D choice. (T3.2)

**11. Mirror DEL via diff + safety hierarchy** — TRUSTED → trash; SUSPICIOUS → block + uncheck DEL + recursive autoimport-pause; BROKEN → recursive autoimport-pause. (§16, T1.3)

### Identity / display

**12. Source Name ≠ Bin Name** — bin label independent of FS path. Bin label is cosmetic, follows merge dialog choice. (case #12, T2.6, T3.2 #20)

**13. «Виноградная ветвь»** — children translocate dead-weight Missing on relink without folder-name-match. (T2.6)

### NEW (locked в этой session)

**14. Path operations relative-from-row** — drift detection, dedup, merge name-matching сравнивают paths relative от tracked root, не absolute. Manifest stores relative paths internally. Absolute computed at runtime: `row.path + "/" + child.relative`.

**15. Add ≠ Relink** — different gestures, both на PATH:
- **Add Folder / drag-drop**: create new row → REFUSE если path occupied (duplicate-tracking)
- **Relink**: move existing row → ALLOW merge если target covered

**16. Bin deletion conditions** — plugin deletes bin ONLY когда все hold:
1. Bin в plugin's manifest (legitimate plugin-owned)
2. Bin не содержит side-files (clip-level user content)
3. Bin не содержит side-bins (recursive sub-bin user content)
4. Deletion триггерится explicit operation:
   - **FLT toggle ON** — flattened-away bins (если no side-files; иначе bin survives as «FLT-displaced»)
   - **FLT toggle OFF**: conditional behavior:
     - Bin was destroyed на FLT=on (no side-files) → **recreate** new bin at SoT position (MVP default — convenient for user)
     - Bin survived FLT=on (had side-files, marked «FLT-displaced») → **transfer back** to SoT position via moveItem (preserves nodeId + side-files inside)
   - **Mirror DEL** — 3-way handshake
   - **Merge cleanup** — incoming side's emptied bins после content transfer
   - **Relink restructure cleanup** — empty bins matching gone-folders (bins не survived relink because their FS counterpart absent в new path AND no side-files inside)
- Operations что НЕ удаляют: Magnet (restructures positions only, never deletes), × healthy child (force-disable, не destroy), FS events

**17. Row destruction outcomes** — destruction triggers:
- × on root (any state) → remove from config
- × on missing child → cleanup config entry
- Merge target absorbs source (source row destroyed после content transfer)

NOT destruction: × on healthy child = force-disable (soft-stop). × on disabled child = restore.

After destruction:
- Children: dead-weight Missing under new parent (merge case) или vanish если no walker covers (× standalone root)
- Old FS path: handled per FS-SoT (re-detected if under tracked root → fresh row reimport; standalone → vanishes)
- Premiere bins:
  - × root → demoted to side-bins (no transfer happens, manifest entries removed)
  - × missing child → manifest entry removed, bin demoted
  - **Merge** → bins transfer to target's manifest (NOT demoted — they ride with content). Source's emptied bins после transfer → delete per rule 16.

**Метафора (от user)**: row = bin's **виза**. Без row → no виза → no легитность. Bin's tourist visa expires при row destruction.

**18. Merge = explicit user gesture only** — never auto-triggered by FS events. Walker не auto-merges.

**19. Path coverage = recursive walker reach** — refuse rule applies к ANY path within tracked root's recursive coverage, даже если row для него ещё не создан.

**20. Bin label cosmetic, follows merge choice** — bin labels = display attribute, обрабатываются как и functional settings — receiving vs incoming dialog choice cascades.

**21. Three dedup levels + autoimport-pause on file-dedup** — autoimport pipeline:
- **dedup-path** — file already в manifest at этом row → skip
- **dedup-file** — file content (name+size+mtime) matches existing Premiere clip ANYWHERE (incl. offline) → skip + force-fire autoimport-pause event for healthy rows (Missing rows already disabled, не paused)
- **no dedup** — file new content → import

**22. Side-bin status taxonomy + position independence** — bin имеет ДВЕ независимые axes:

**Axis 1 — Legitimacy** (manifest membership = boolean):
- **Legitimate plugin-owned** — в manifest + tracked by alive row (incl. Missing row's bins)
- **Side-bin** — NOT в manifest (user-created в Premiere outside plugin OR demoted from legitimate when row vanished)

**Axis 2 — Position** (где bin physically located в Premiere bin tree):
- **At SoT-expected position** — clean state, mirrors FS structure
- **Displaced** — user moved bin / FLT-survived with side-files / etc. Position mismatch с expected.

**Position is independent от legitimacy.** Plugin tracks по nodeId — bin can move в Premiere without losing legitimacy.

**Behavior matrix:**

| legitimacy × position | autoimport | drift trigger | recovery |
|---|---|---|---|
| Legitimate × at-SoT | ✓ normal | none | n/a |
| Legitimate × displaced | ✓ continues (files import into displaced bin) | YES — when first clip lands → drift fires per rule 26 | Magnet moves bin back to SoT (с side-files inside) |
| Side-bin × any position | ✗ plugin ignores | n/a | Magnet может pull files OUT, но bin не touched |

**Rule of thumb** (user's metaphor): row = bin's виза. Без row → no виза → side-bin.

**23. Plugin tracks via Premiere nodeId, not path** — manifest stores nodeIds для bins/clips. Operations use nodeId (changeMediaPath, moveItem, removeItem). Identity stable across relink/merge.

**24. Two matching axes** — folders↔rows↔bins match by **folder-name** (relative path). Files↔clips match by **content** (name+size+mtime). Different axes:
- Row state (Missing/Healthy/Drifted) driven by **folder-axis only**
- File-axis affects dedup, drift detection, side-file detection — но **НЕ row state**
- File missing/moved doesn't put row в Missing — folder gone does

**25. Side-files mechanic** — clip that left plugin's coverage становится side-file (mirror к side-bins). Creation events:
- User imports file via Premiere directly into plugin-owned bin (case #6)
- User relinks Premiere clip to FS path outside tracked roots
- Single file moved out of tracked folder + relinked в Premiere to unwatched

Plugin никогда не trogает side-files. Bin содержащий side-file → blocked from auto-deletion (rule 16 condition).

**26. Drift formal definition** — DRIFT triggered when ALL hold:
1. File **exists в FS** at path P (under tracked root)
2. File **exists в Premiere** as clip (any state — online OR offline)
3. Clip's **parent bin в Premiere ≠ expected bin** (= bin что mirrors FS folder containing P per row's manifest)

→ Row covering P → DRIFT state.

**Bin movement triggers drift through clip-axis**: если user moves displaced bin containing clips → all contained clips effectively at new position → drift fires on those clips. Empty displaced bin = silent (no drift) until first file imports.

NOT drift:
- File not yet imported (absent в Premiere) — это «pending import», not drift
- Clip offline + at original FS path — clip's path matches expected bin → no drift
- File relinked to unwatched location → side-file, not drift
- Empty displaced bin — silent until file enters

Drift cleared by: Magnet (moves bin OR clip back to SoT, side-files preserved) OR Merge (auto-dedup migrates).

**27. Four-operations on bin legitimacy + position** — manifest membership = boolean legitimacy implicit. No explicit field needed:

**Legitimacy ops (manifest membership changes):**
- **Confer** = ADD bin entry to manifest (at row creation: walker discovery / Add Folder UI)
- **Transfer** = MOVE manifest entry from source row to target row при merge (preserves nodeId, Premiere object continuity, bin physically moves via moveItem)
- **Withdraw** = REMOVE manifest entry → bin становится side-bin implicitly (× root, × missing child, OR merge source after content fully transferred)

**Position ops (no legitimacy change, bin stays in manifest):**
- **Restructure** = update relative path mapping when row's path changes (relink). Bins re-mirrored to new FS structure: matching folders kept (paths updated), non-matching empty bins без side-files → delete per rule 16, non-matching bins с content → drift detected.

Manifest stores ONLY legitimate bins. Side-bins discovered each walker pass via diff (Premiere bin tree − manifest = side-bins). Position determinable per nodeId path в Premiere bin tree.

---

## Decision Matrix

> Matrix вынесена в отдельный CSV для удобства review/edit в spreadsheet:
>
> **[`relink-merge-matrix.ru.csv`](relink-merge-matrix.ru.csv)** — 35 cases (4 Add Folder + 31 Relink). Columns: action / source_state / target_path / outcome / row_after / children_fate / old_fs_path / bins_fate / rules_applied / notes.
>
> Cells derivable from foundational rules 1-27 выше. Если case не выводится — gap, нужно discuss.

### Edge cases для дискуссии (требуют user decision)

После прохождения matrix выявлены потенциальные edge cases, не однозначно derivable from rules:

**E1 — Relink across tracked tree boundary:**
- Source row Healthy child под Root1
- Target = path under Root2 (other tracked root)
- Что значит «свободный path»? Если path под Root2's recursive coverage → covered (rule 19) → MERGE? Или просто under Root2 = becomes child of Root2?
- **Discussion needed:** target classification — «свободный» means «не в any tracked root coverage»; если under another tracked root но row для него ещё не создан — это считается covered (rule 19) → merge, не free move. Это rules-derivable если строго применять #19, но worth confirming.

**E2 — Relink Drifted row на path где no clips (clean folder):**
- Source row Drifted (clips misplaced в Premiere)
- Target = path где нет files
- After relink: row at new empty path → walker finds nothing → row becomes... empty Healthy? Drift status preserved или cleared?
- **Discussion needed:** drift definition rule 26 requires file existence в FS. If new path empty → no drift trigger → drift cleared by virtue of nothing to drift on. Old clips (где они were) → handled per FS-SoT.

**E3 — Merge during active autoimport:**
- Plugin currently importing files for new row (busy state)
- User triggers merge на другую row
- Race condition — merge dialog UI vs ongoing import
- **Discussion needed:** queue merge until import done? Or refuse with «busy»? Per rule 6 (Busy = race-prevention) — likely refuse с toast.

**E4 — Multiple roots renamed simultaneously creating overlap:**
- Edge of T4.1 — user does multiple FS rename ops в quick succession
- Multiple roots become Missing simultaneously
- Plugin receives delayed events
- **Discussion needed:** processing order, race resolution. Per rule 1.5 events sequential idempotent → just process in arrival order, each independently. Should converge but worth validating.

---

- ~~Manual bin deletion in Premiere~~ → resolved by Mirror DEL §9
- ~~Simplified / Easy Mode naming~~ → resolved §13
- ~~Global Auto-Import toggle semantics~~ → resolved §13 (Advanced rename)
- ~~↺ reset glyph~~ → superseded by 3-click cycle §12

---

## Status summary

🟢 **LOCKED (13 items):** T1.1 / T1.2 / T1.3 / T1.4 / T1.5 / T2.1' / T2.3 / T2.5 / T2.6 / T3.1 / T3.2 / T3.3 / T3.4 / T3.5 / T4.2

⚫ **PARKED (5 items):** T2.1 / T2.4 / T3.6 / T3.7 / T3.8

🔴 **OPEN — deep-dive block:**
- **T4.1** — Root-inside-root (mostly resolves через matrix RESTRUCTURE column)
- **T4.3** — Merge linking mechanic (matrix покрывает основное, остаются edge cases E1-E4)

🟢 **Foundational rules:** 27 explicit rules locked (1-13 existing + 14-27 new in this session). Decision matrix derived from rules.

📋 **Decision Matrix:** [`relink-merge-matrix.ru.csv`](relink-merge-matrix.ru.csv) — 35 cases (4 Add + 31 Relink). 4 edge cases (E1-E4) for further discussion в WIP doc.

---

## Next steps

1. **User reviews matrix** — walk through cases, validate cells, identify gaps. Address E1-E4 edge cases.
2. **Lock matrix** — when satisfied, all relink/merge decisions are derivable.
3. **Sync sweep** для всех 🟢 LOCKED items + matrix в spec/parked-notes/mockup (single commit или две части).
3. **After deep-dive lock** — second sync sweep для T4.1/T4.3
