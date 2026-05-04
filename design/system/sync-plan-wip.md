# Sync Plan — WIP working doc

> **Purpose**: track multi-session sync sweep applying decisions from `edge-cases-wip.md` (27 foundational rules + Rule T1.1 v2 + locked T-items + 29-case matrix) into `state-design.md` / `parked-notes.md` / `mirror-decisions.csv` / `panel.figma-script.js`.
>
> **Workflow**: one phase per session с fresh context. После phase → commit → update status here → close session. Next phase в новой session.
>
> **Why split**: контекст-окно конечный. Single-shot sync рискует пропустить детали или сломать mockup (silent collapse bugs). Phase isolation = focused depth + verification points.

## Status legend

- 🔴 NOT STARTED
- 🟡 IN PROGRESS (current session)
- 🟢 DONE (committed + verified)
- ⏭ SKIPPED (verified no changes needed)

## Source of truth

Decisions come from:
- **`edge-cases-wip.md`** — 27 foundational rules + Rule T1.1 v2 + locked T-items + edge case decisions
- **`relink-merge-matrix.ru.csv`** — 29-case decision matrix

**Pre-flight для каждой phase**: read these two docs first to refresh context before edits.

---

## Phase 1 — `state-design.md` (foundation spec) 🔴

**Goal:** apply 27 foundational rules + T-item decisions to primary spec doc. **Самая критичная phase** — без правильного spec остальные docs misalign.

### Pre-flight checklist
- [ ] Read `edge-cases-wip.md` foundational rules section (lines ~600-720)
- [ ] Read Rule T1.1 v2 (three-layer disable model, ~line 35-130)
- [ ] Read all T-items с status 🟢 LOCKED (Tier 1-4 sections)
- [ ] Skim current `state-design.md` structure to understand existing sections

### Touchpoints

#### Section rewrites / replacements

**§"5. Disabled causes" → REPLACE**
- Old: 3 causes / 1 runtime model (own × / parent SUB / parent disabled — all single LED)
- New: **three-layer disable taxonomy** (Rule T1.1 v2 + Rule 8)
  - Layer 1 System Force (path-missing, strongest)
  - Layer 2 Manual Intent (`"none"|"disable"|"enable"`, three-valued, persistent)
  - Layer 3 Cascade (computed from parent.SUB=off OR parent.disabled, OR-activate / AND-deactivate)
- Keep single observable LED для всех Disabled causes
- Add per-row `effective_enabled` independence (Rule 9 / T2.1')
- Add override-enable mechanic (manual_intent="enable" overrides cascade)
- Auto-create empty placeholder bins для ancestor chain when descendant enabled

**§"6. Context-aware ×" → EXTEND**
- Add toggle UX (two-state per click — Rule T1.1 v2)
- Add bulk × on mixed selection (Rule T2.3 follow-as-capable)

**§"7. Ghost row" → RENAME TO "Relink mechanics" + REWRITE**
- No more ghost rows (Rule T3.3 FS-SoT principle)
- New content:
  - Add ≠ Relink (Rule 15)
  - Refined relink rules table (Rule T2.6: refuse / merge / move / restructure)
  - «Виноградная ветвь» children translocation (Rule 13)
  - Source Name vs Bin Name preservation (Rule 12)
  - Auto-rebase mechanic via changeMediaPath() (Rule 21 dedup levels)
  - Side-file conversion when path coverage lost (Rule 25)
  - Bin restructure rules (Rule 27 Restructure operation)
  - Reference matrix CSV для full case enumeration
  - Path coverage = recursive walker reach (Rule 19)

**§"10. Missing subtypes" → EXTEND**
- Was parked, now lock with concrete intervals (Rule T3.1):
  - enoent: 30s × 5 → 5min × 12 → 1h indefinitely. Stop after 24h
  - offline: 5-10s × 360 → 1min × 60 → 5min indefinitely. OS volume event short-circuit
  - eacces: NO auto-retry
  - other: 1min × 10 → 10min indefinitely
  - Common: jitter ±20%, async, 100% retry on init

**§"12. Tier model" → REFINE**
- Confirm live-bind inheritance (Rule 10 / T3.2)
- Note: per-column behavior — все toggle columns live-bind, LBL computed-at-creation, DEL never inherits

**§13 Simplified — clarify «Children defaults» subsection**
- Add per-column I/D choice (Rule T3.2 — letters MVP, polish v1.1+)

**§16 — REFINE multiple subsections**
- Drift formal definition (Rule 26): bin-level trigger added, cascade up to root explicit
- Drift exception (Rule 24): drift = единственная exception где file-axis влияет на row state
- Mirror DEL SUSPICIOUS handling (Rule 11 / T1.3): block trash + force-uncheck DEL on row + recursive autoimport-pause (CORRECTED from previous "import wins")
- Side-files mechanic (Rule 25): clip side-file when path loses coverage; «подданство плагину» metaphor; transitions enumerated
- Two-axes violations (Rule 7): drift / paused, non-overlapping recovery (already there, verify)
- Bin position vs legitimacy independence (Rule 22)
- Three-operations on bin legitimacy → four-operations (Rule 27): Confer / Restructure / Transfer / Withdraw

#### New sections to add

**§"Manifest" (NEW)**
- Schema example (Rule T1.4 + Rule 5 + Rule 23)
- Persistence cadence: hybrid debounced + immediate-on-critical
- nodeId-based tracking (not path-based)
- Manifest = full FS knowledge incl. dedup-rejected entries
- Membership = boolean legitimacy implicit (Rule 27)

**§"Initialization & async walk" (NEW)**
- Async walker contract (Rule T1.2)
- UI opens на cached manifest, walker async background
- Walker idempotent + transactional per-event
- Buttons NOT locked during scan
- 100% retry на init для Missing paths

**§"Events" — EXTEND**
- Add idempotency note (Rule T1.5): events sequential by nature, idempotent, no ordering rules
- No loop possible by design

#### Decision log additions

Add new entries для everything locked в session. Numbering #60+ continuing from existing log:

- #60 already added (Events orthogonal — done in prior commit)
- #61: Two-axes violation model (already #50, verify)
- ... compile from edge-cases-wip Decision log + lock list

Specifically NEW entries needed:
- T1.1 v2: Three-layer disable taxonomy
- T1.2: Async walker, silent at row + global progress
- T1.3: Mirror DEL SUSPICIOUS = block + uncheck + recursive pause
- T1.4: Manifest hybrid persistence
- T1.5: Event idempotency
- T2.1': Override-enable child через per-row effective_enabled
- T2.3: Bulk × follow-as-capable
- T2.5: Missing+Disabled subsumed (close design debt #11)
- T2.6: Relink mechanics refined rules table
- T3.1: Missing retry intervals (concrete)
- T3.2: Live-bind inheritance + Settings I/D
- T3.3: FS-SoT eliminates ghost rows
- T3.4: Refuse-duplicate vs allow-merge
- T3.5: Ghost concept eliminated (close design debt #9)
- T4.1: Auto-re-parent + auto-Magnet on root-inside
- T4.2: Drift wins over rename
- T4.3: Merge linking via auto-dedup at merge time
- E1: SUB=off keeps coverage
- E2: Drift cleared via rebase + side-file
- E3: Source busy = lock; target busy = queue
- Rule 14-27 articulations

#### Stale references to remove

Grep these terms — verify usage updated or removed:
- "ghost row" (concept eliminated)
- "auto-ghost" (eliminated)
- "two-flag model" (replaced by three-layer)
- "forced(reason)" (refactored)
- "path-missing" as forced reason (now system-level)
- Design debt items #3, #8, #9 → close
- Design debt #11 → close

#### Artifacts table update

- Reference `relink-merge-matrix.ru.csv` (newly created)
- Reference `edge-cases-wip.md` if not already
- Reference `sync-plan-wip.md` (this doc, while WIP)

### Estimated effort
~25-35 edits в одном файле. Workflow: open file, work линейно по §, commit at end.

### Verification criteria
- [ ] All 27 rules referenced/articulated в spec sections
- [ ] No stale references to «ghost row» / «two-flag» / «auto-ghost»
- [ ] All T-item locks (T1.1 v2 - T4.3) reflected
- [ ] Decision log has new entries
- [ ] Artifacts table includes matrix CSV
- [ ] Internal § cross-references correct
- [ ] No syntax errors in markdown

### Commit message template
```
state-design — sync sweep phase 1: foundational rules + three-layer disable

Phase 1 of sync sweep applying edge-cases-wip.md decisions.

Major changes:
- §5 Disabled causes: replaced 3-causes-1-runtime model with three-layer
  taxonomy (System Force / Manual Intent tri-state / Cascade computed)
- §7 Ghost row → renamed to "Relink mechanics", rewritten per FS-SoT
  principle (no ghosts), refined relink rules table, viperedonye etc.
- §10 Missing subtypes: locked with concrete retry intervals
- §16: drift refinements (bin-level trigger + cascade up explicit),
  Mirror DEL SUSPICIOUS corrected behavior
- New §"Manifest": schema + nodeId tracking + hybrid persistence
- New §"Initialization & async walk": startup behavior contract
- §"Events": idempotency note added
- Decision log: ~17 new entries (#60+) for T-item locks + rule articulations
- Artifacts: added relink-merge-matrix.ru.csv reference

Stale terms removed: ghost row, auto-ghost, two-flag model, forced(reason).
Design debt items #3, #8, #9, #11 closed.

Source: edge-cases-wip.md foundational rules + locked T-items.
Tracker: sync-plan-wip.md
```

---

## Phase 2 — `parked-notes.md` (operational contracts) 🔴

**Goal:** add active contracts + polish bucket items + decision history entries.

### Pre-flight checklist
- [ ] Read Phase 1 result (`state-design.md` post-update) для consistency
- [ ] Re-read `edge-cases-wip.md` polish bucket entries
- [ ] Skim current `parked-notes.md` for existing contracts to refine

### Touchpoints

**Active contracts to add/refine** (§2):
- Relink mechanics contract (path coverage + bins переезд + side-file conversion)
- Merge mechanics contract (transfer + auto-dedup at merge time + cleanup per rule 16)
- Three-layer disable contract (Rule T1.1 v2)
- Manifest persistence (debounced + immediate-on-critical)
- Event idempotency
- Async walker contract
- nodeId-based tracking (Rule 23)
- Path coverage = подданство (Rule 25 metaphor)

**Polish bucket additions** (§5):
- Tooltip differentiation для Disabled causes (T2.1)
- Recovery tool surfacing (button highlight per state, T3.8 + T2.2)
- Dead-sheep logo для Plugin Unhealthy (T3.6)
- Settings I/D letters → better visual (T3.2 polish)
- Move heuristic auto-detection (T4.3 v1.1+)
- Aggressive dedup with content hash (T4.3 Settings toggle)
- Notification on autoimport-pause (T2.2)
- Pulse LED on first violation event

**Open questions section** (§6):
- DEL diff health checks predicates → moved to LOCKED (rule T1.3 concrete predicates)
- Magnet в Simplified (T3.8 parked)
- Real-world QA test plan (when matrix finalized)
- Spinning edge cases drift+paused coexistence (T3.7 parked)

**Decision history** (§8):
- Append Q11+ entries для new architecture decisions:
  - Q11 Bin position ≠ legitimacy (independent axes)
  - Q12 FLT toggle conditional behavior
  - Q13 FS-SoT eliminates ghost rows
  - Q14 Three-layer disable taxonomy
  - Q15 Two matching axes (folder vs file)
  - Q16 Side-file = path coverage loss («подданство»)
  - Q17 Auto-dedup via changeMediaPath() at merge
  - Q18 Manual intent persistence across cascade flips
  - etc.

**Implementation guidance** (§7):
- Mark all session items as ✓ DONE
- Note that sync-plan-wip.md tracks remaining sync work

### Estimated effort
~15-20 edits, mostly additive (new contracts + polish entries).

### Verification criteria
- [ ] All Rule 22-27 contracts articulated
- [ ] Polish bucket has 7-8 new items
- [ ] Decision history has Q11-Q18+ entries
- [ ] No stale references
- [ ] Cross-links to state-design.md correct

### Commit message template
```
parked-notes — sync sweep phase 2: contracts + polish + decision history

Phase 2 of sync sweep. Adds active contracts and polish bucket items
locked in session, plus decision history continuation Q11+.

Active contracts:
- Relink mechanics (path coverage + bins переезд + side-file conversion)
- Merge mechanics (auto-dedup via changeMediaPath at merge time)
- Three-layer disable (T1.1 v2)
- Manifest persistence (debounced + immediate-on-critical)
- Event idempotency
- Async walker
- nodeId tracking
- Path coverage = подданство (Rule 25)

Polish bucket: 8 new items deferred to v1.1+.

Decision history: Q11-Q18+ for session's architectural decisions.

Tracker: sync-plan-wip.md
```

---

## Phase 3 — CSV touch-ups 🔴

**Goal:** verify `mirror-decisions.csv` / `.ru.csv` aligned with refined rules. Likely minor.

### Pre-flight checklist
- [ ] Read Phase 1 §16 result для drift definition consistency
- [ ] Skim both CSVs

### Touchpoints

**Possible updates:**
- Drift formal definition reference (Rule 26 refined — bin-level trigger added). Cells mentioning drift might benefit from clarification.
- Mirror DEL SUSPICIOUS handling (Rule T1.3 corrected — block + uncheck instead of import-wins). Affects cases involving Mirror DEL.
- Path coverage = подданство — может add note in case #6 (side-file added by user) or similar.
- Three-layer disable — case #9 (manual eye toggle) — verify still aligned (manual layer of disable). Probably no change.

**Verification:**
- [ ] All 16 cases still consistent with refined rules
- [ ] No cell contradicts new rules

### Estimated effort
Quick — possibly skip if CSVs already aligned. Maybe 2-3 small edits.

### Commit message template
```
mirror-decisions — sync sweep phase 3: minor refinements

Verified all 16 cases against refined rules. Minor clarifications:
- Drift definition reference per Rule 26 v2 (bin-level trigger)
- Mirror DEL SUSPICIOUS corrected behavior reference
- ... [or "no changes needed"]

Tracker: sync-plan-wip.md
```

---

## Phase 4 — `panel.figma-script.js` (HIGH RISK) 🔴

**Goal:** apply visual mockup updates per refined rules. **Run в Scripter после каждого chunk.**

### CRITICAL safety notes
- File is ~5800 lines — DO NOT read whole file at once
- Edit specific sections via Read + Edit с offset/limit
- After EACH chunk of edits → `node --check design/mockups/panel/panel.figma-script.js`
- After major changes → user runs in Figma Scripter to visually verify (no collapse bugs)
- Common silent collapse causes: missing `resize()` before `layoutMode`, `null` passed where API expects value, STRETCH child in HUG parent

### Pre-flight checklist
- [ ] Read Phase 1 result для spec alignment
- [ ] Skim mockup section structure (Grep for `// §` markers)
- [ ] Familiarize with existing helpers (stateCell, row, columnHeaderBar, etc.)

### Touchpoints

**§1 Main panel + annotation cards:**
- × annotation card → toggle behavior + manual_intent UX
- Possibly add demo row showing manual_intent="enable" override (parent SUB=off + child override-enabled)
- Verify «autoimport-pause» annotation still aligned (event-trigger contract)

**§6 FLT mechanics:**
- Verify FLT toggle ON/OFF behavior matches refined Rule 16 (conditional recreate vs transfer)

**§7 Safety cover:**
- Likely no changes — мechanic не менялся

**§9 Mirror DEL:**
- mdDiff card SUSPICIOUS row → corrected behavior («block trash + uncheck DEL + recursive pause» instead of «import wins»)

**§11 icon legend:**
- Magnet card → clarify Rule 27 (Magnet restructures positions, never deletes; preserves side-files)
- Refresh card → clarify Axis B recovery (rule 21 Refresh recovery path)

**§13 Plugin boundary:**
- Implication bullets → cross-reference new spec §"Manifest" + §"Initialization & async walk" if added in Phase 1
- Two-axes model bullet → verify aligned

**§14 Magnet + side-files preservation:**
- Verify «mediator never destructs not-its-own» messaging clear
- Side-file mechanic note (Rule 25)

**§REF state taxonomy:**
- Verify aligned с refined rules (no actual changes likely — taxonomy still 5 states + transient)
- Events table — может add «relink» / «merge» events если missing

**Annotation cards — possible new:**
- Three-layer disable annotation card (manual / cascade / system)
- Side-file mechanic annotation card

### Estimated effort
1-2 sessions. **Should be standalone session с fresh context.** Many small edits, frequent verification.

### Verification criteria per chunk
- [ ] `node --check` PARSE OK after every Edit batch
- [ ] User runs in Figma Scripter visually (request screenshot if uncertain)
- [ ] No silent collapse bugs (all sections render properly)

### Commit message template
```
panel-mockup — sync sweep phase 4: visual updates per refined rules

Phase 4 of sync sweep — visual mockup synced с refined rules.

Updates:
- §1 × annotation card: toggle UX + manual_intent (T1.1 v2)
- §9 Mirror DEL SUSPICIOUS: corrected behavior (block + uncheck + recursive)
- §11 Magnet/Refresh icon legends: rule references updated
- §13 boundary: cross-refs to new spec sections
- §REF state taxonomy: verified, [no changes / minor updates]
- ...

node --check PARSE OK. Visual verified в Figma Scripter.

Tracker: sync-plan-wip.md
```

---

## Phase 5 — Cleanup + cross-links 🔴

**Goal:** final cleanup, verify all docs cross-reference correctly, archive sync-plan-wip.

### Pre-flight checklist
- [ ] All previous phases ✓
- [ ] No outstanding TODOs in any doc

### Touchpoints

**`design/system/README.md`:**
- Verify all listed files accurate
- Add `sync-plan-wip.md` while WIP, remove after Phase 5 complete (или leave as historical artifact)
- Verify three-tier model description still accurate (rules 1-13 + new 14-27)

**Internal links audit:**
- `state-design.md` → links to parked-notes / mirror-decisions / matrix valid?
- `parked-notes.md` → links to state-design valid?
- `edge-cases-wip.md` → can be marked as ✓ ALL LOCKED, archive-ready

**Stale terminology audit:**
- Grep across all docs для:
  - "ghost row" — should be 0 hits (or only в archive)
  - "auto-ghost" — should be 0
  - "two-flag" — should be 0 (replaced by three-layer)
  - "forced(reason)" — should be refactored
  - Old design debt #3, #8, #9, #11 references

**Update `edge-cases-wip.md`:**
- Mark all items as ✓ FULLY SYNCED
- Add note "All decisions synced into spec/parked-notes/mockup as of 2026-XX-XX"
- Optionally rename to `edge-cases-archived.md` or move to archive folder

**Decide fate of `sync-plan-wip.md` (this doc):**
- Option A: leave as historical artifact (track of phases done)
- Option B: archive в `design/archive/` after sync complete
- Option C: delete (decisions captured в commit log)

### Estimated effort
Quick — mostly verification + 2-3 small edits.

### Commit message template
```
sync sweep phase 5: cleanup + final cross-link audit

Phase 5 (final) of sync sweep:
- README updated to reflect all sync'd files
- Internal links audited (all valid)
- Stale terminology grep clean (no hits for ghost/two-flag/auto-ghost)
- edge-cases-wip.md marked ALL SYNCED
- sync-plan-wip.md [archived / deleted / preserved as record]

ALL ARCHITECTURAL DECISIONS FROM 2026-04-30 / 2026-05-04 SESSIONS NOW
FULLY REFLECTED IN PRIMARY SPEC (state-design.md), CONTRACTS DOC
(parked-notes.md), EVENT MATRIX (mirror-decisions.csv), AND VISUAL
MOCKUP (panel.figma-script.js).

Ready for implementation handoff.
```

---

## Quick reference — Rule → primary sync target map

| Rule | Where to apply | Notes |
|---|---|---|
| 1 FS-SoT | §16 + §"7. Relink mechanics" | foundation principle |
| 2 Mediator preserves not-its-own | §14 + parked-notes | already mostly there |
| 3 Asymmetric ambiguity | §16 (already there) | verify wording |
| 4 Eye=timing DEL=permission | parked-notes §2.1 | already there |
| 5 Manifest = full FS knowledge | new §"Manifest" | add section |
| 6 Three-tier model | §"Events" | already там, add idempotency |
| 7 Two-axes violations | §16 | already там, verify |
| 8 Three-layer disable | §"5. Disabled causes" REPLACE | major rewrite |
| 9 Per-row effective_enabled | §"5. Disabled causes" override | new mechanic |
| 10 Live-bind inheritance | §12 + §15 Settings | refine |
| 11 Mirror DEL diff hierarchy | §16 SUSPICIOUS corrected | correction |
| 12 Source ≠ Bin Name | §13 already there | verify |
| 13 Виноградная ветвь | §"7. Relink mechanics" | new |
| 14 Path relative-from-row | §"Manifest" or §"Implementation" | new |
| 15 Add ≠ Relink | §"7. Relink mechanics" | new |
| 16 Bin deletion conditions | §"7. Relink mechanics" + §6 FLT | refine |
| 17 Row destruction outcomes | §"7. Relink mechanics" + §6 × matrix | refine |
| 18 Merge = explicit | §"7. Relink mechanics" | new |
| 19 Path coverage = walker reach | §"7. Relink mechanics" | new |
| 20 Bin label cosmetic | §13 + §"7. Relink mechanics" | refine |
| 21 Three dedup levels | §16 + parked-notes | refine |
| 22 Bin status taxonomy + position | §"7. Relink mechanics" + §16 | new |
| 23 nodeId tracking | §"Manifest" | new |
| 24 Two matching axes | §16 + §"5. Disabled causes" | new |
| 25 Side-files mechanic / подданство | §16 + §"7. Relink mechanics" | new |
| 26 Drift formal definition | §16 (already там, refine) | bin-level + cascade |
| 27 Four-operations on legitimacy | §"Manifest" or §"7. Relink mechanics" | new |

---

## After all phases done

1. ✓ Mark `edge-cases-wip.md` as ALL SYNCED
2. ✓ Decide fate of this doc (`sync-plan-wip.md`)
3. ✓ Final commit: «Sync sweep complete»
4. → Ready for implementation phase
