# Panel Architecture Concept — v1.2

- **Status:** WIP / draft
- **Started:** 2026-04-20, continued 2026-04-21
- **Supersedes:** не заменяет v1, **дополняет** по state model, status lamp, cascade semantics и global autosync
- **Trigger:** ревью Figma mockup'а (`figma-sheepdog-panel-v1.2.js`) — обнаружены грубые семантические ошибки в данных и архитектурные пробелы в рендер-модели
- **Author context:** session с Opus — фикс `02_Image` eye (asymmetric cascade violation) разросся в полную переработку state-модели

---

## 0. Scope

Этот документ фиксирует **доуточнения** к v1:

- разделение **Tier** (user control) и **Status** (engine state) в rendering model
- спецификация **Status-лампы** (первая колонка, coloured dot)
- унификация **cascade semantics** по всем чекбокс-колонкам (SUB / REL / SEQ / FLT / EYE)
- модель **global autosync = virtual root** каскада (Discord/role-permissions pattern)
- **tooltip & affordance** policies для drift / inheritance
- порядок реализации в `figma-sheepdog-panel-v1.2.js`

**Не трогаем**: layout, data schema (остаётся v2 из §10 v1), safety cover mechanics, FLT v2 резолв — они как в v1.

---

## 1. Motivation — что болело в v1

При ревью mockup'а всплыли:

1. **«Disabled» стал мусорным ящиком.** В разных местах под disabled подразумевалось:
   - media offline (движок не может)
   - parent SUB OFF (родитель самоустранился)
   - новая папка ещё не сканировалась (pending)
   - global autosync OFF в ранних обсуждениях (override)

   Это **разные семантические категории**, смешанные в одно render-состояние → непонятно что делают клики, что произойдёт при изменении среды.

2. **Global autosync vs per-folder eye — модель недоопределена.** В v1 §7.2 было: `global OFF → eye hidden`, `global ON → eye visible`. Это implies global-as-kill-switch, но рождает вопросы:
   - что делать с explicit-OFF папками при global ON?
   - как выразить «я эту папку никогда не хочу синкать» independent of global?
   - где хранится per-folder intent при global ON — исчезает? dormant?

3. **Status первой колонки (ST dot) в v1 была placeholder-ом.** Пять состояний перечислены (§3.1), но без visual language и без кликабельности. Нужен полноценный state-indicator с affordance для drift.

4. **Cascade rules для REL/SEQ/FLT не определены.** v1 говорит «inheritance», но не уточняет: symmetric? asymmetric? Locked или Inherited tier? Какие forbidden pairs?

5. **Асимметричный cascade eye (memory: `feedback_eye_asymmetric_cascade`) не приведён в данных.** Строка `02_Image` имела `eye: "off"` при parent `03_Assets` с `eye: "on"` — нарушение HARD LOCK cascade.

---

## 2. Ключевой концепт: Tier ≠ Status

Самый важный sdvig в v1.2 — **разведение двух ортогональных осей** render-модели.

### 2.1. Tier (user control)

**Вопрос**: «Могу я редактировать эту ячейку? Откуда пришло её значение?»

**Ценности** — 4 уровня таксономии из `figma-sheepdog-checkbox-variants.js`:

| Tier | Meaning |
|------|---------|
| Overridden | explicit per-row intent — юзер сам поставил |
| Inherited | from parent (или virtual root — см. §4) — soft cascade |
| Locked | hard-lock от parent — нельзя override локально |
| Disabled | dormant — клики сохраняют intent, но движок не действует |

### 2.2. Status (engine state)

**Вопрос**: «Что движок делает / может ли делать с этой папкой прямо сейчас?»

**Ценности**:

| Status | Meaning |
|--------|---------|
| Online | reality matches intent |
| Drift | reality ≠ intent — fixable |
| Scanning | measuring, result unknown |
| Unreachable | offline media, permission denied, corrupt reference |
| Idle-off | intent = «не измерять» (eye closed, parent SUB off) |
| Pending | никогда не измерялось (новая папка) |

### 2.3. Композиция, не замена

Tier и Status **composable**. Примеры:

| Сценарий | Status | Tier на ячейках |
|----------|--------|-----------------|
| Media offline, eye open, Overridden ON | Unreachable (red lamp) | Disabled (dashed) — intent preserved |
| Parent SUB OFF, child с own intent | Idle-off (hollow grey) | Disabled на ячейках child'а |
| Folder сканируется прямо сейчас | Scanning (spinner) | Locked across row |
| Только добавлена папка | Pending (hollow grey) | normal (Inherited от global) |
| Soft-stop: SUB был ON, поставили OFF, старые sub-bins остались | Drift (amber) | normal |
| Всё синхронно | Online (green) | normal |

### 2.4. Cascade mapping: Status → Tier

Status **обёртывает** Tier. Когда Status меняет доступность ячеек:

| Status | Effect on Tier rendering |
|--------|--------------------------|
| Unreachable | все ячейки row → Disabled (intent preserved, dormant) |
| Scanning | все ячейки row → Locked (temporary freeze) |
| Idle-off (from parent SUB OFF) | все ячейки child row → Disabled |
| Pending | normal Tier rendering, но lamp hollow |
| Drift | normal Tier rendering, но lamp amber + reconcile affordance |
| Online | normal Tier rendering, lamp green |

**Правило**: Tier говорит про intent, Status говорит про runtime. Visual layering: Tier рендерит ячейку, Status рендерит лампу и опционально row-level backdrop.

---

## 3. Status lamp — спецификация col 1 (ST)

### 3.1. Матрица визуала

| Status | Glyph | Fill | Stroke | Animation | Overlay |
|--------|-------|------|--------|-----------|---------|
| Online | ● solid | green | — | — | — |
| Drift | ● solid | amber | — | — | `!` |
| Scanning | ◌ ring | — | amber | rotate | — |
| Pending | ◌ ring | — | grey | — | — |
| Idle-off | ◌ ring | — | grey | — | — |
| Unreachable | ● solid | red | — | — | `✕` |

### 3.2. Accessibility — color + shape redundancy

Color-blind safety: **форма и color оба несут смысл**.

- Filled circle = measured + actionable
- Empty ring = not measured / intentionally idle
- Spinner = measuring now
- `!` overlay = drift (reconcilable)
- `✕` overlay = unreachable (not reconcilable until env fixed)

Dark mode: проверить contrast ≥ 4.5:1 на всех fills.

### 3.3. Yellow affordance — Reconcile dropdown

Drift-лампа **кликабельна**. Клик → small menu:

| Action | Semantics | Destructive? |
|--------|-----------|--------------|
| **Gather Sheeps** | подгрести разбросанное под текущий intent | Yes — confirm modal |
| **Absorb Reality** | обновить intent под текущее состояние | No |
| **Ignore Drift** | пометить как accepted drift; лампа → outline amber | No |

**Причина клика**: drift без резолва превращается в постоянный шум. Без affordance юзер игнорит yellow, лампа становится декором.

### 3.4. Soft-stop как подкласс drift

Пример: SUB был ON, юзер переключил OFF. Движок перестал добавлять новые subfolders, но уже созданные bin'ы в .prproj остались.

**Для MVP**: это просто drift (yellow). Тот же Reconcile dropdown.

**Опционально v1.3**: sub-tier «accepted legacy» как outline amber (если юзер сознательно оставил). Не MVP — не плодим tier'ы раньше времени.

### 3.5. Pending vs Idle-off — одинаковая визуальная лампа

Оба = `◌ hollow grey`. Различие **не в lamp'е**, а в других колонках:

- **Pending** → eye колонка Inherited от global, только что добавлена, data ещё не накоплена
- **Idle-off** → eye Overridden OFF (или Inherited OFF от parent-off-eye), интент явно «не трогать»

Контекст строки дизамбигирует. SRP сохраняется: lamp выражает «я не измеряю», не объясняет почему.

### 3.6. Red — объединяем offline / error / perm-denied

Все три = «движок не может работать с этой папкой». Одна лампа (red solid + ✕), tooltip даёт причину: `«Drive K: unplugged»` / `«Access denied»` / `«Project references missing bin»`. SRP: лампа = «статус drift», не типология ошибок.

---

## 4. Global autosync — virtual root model (Discord-pattern)

### 4.1. Концепт

Глобальный autosync **не** внешний override. Он — **виртуальный корень cascade**.

```
[Global autosync]  (virtual root, value ON/OFF)
    │
    ├─ root folder 1 (Overridden | Inherited)
    │   ├─ subfolder 1.1 (Overridden | Inherited от root 1 или global)
    │   └─ subfolder 1.2
    ├─ root folder 2
    └─ …
```

### 4.2. Per-folder eye states

| Tier | Meaning |
|------|---------|
| **Overridden ON** | «Всегда синкать, ignore global» — вечный opt-in |
| **Overridden OFF** | «Никогда не синкать, ignore global» — вечный opt-out |
| **Inherited** (from parent or global) | «Follow cascade» — зависит от parent; если parent тоже Inherited — от global |

**Новая папка** по дефолту создаётся с **Inherited** (от global).

### 4.3. Cascade propagation

Работает asymmetric eye-rule из memory (`feedback_eye_asymmetric_cascade.md`):

- **Global ON** → open eye (virtual root) → **HARD LOCK cascade**: все Inherited потомки = **Locked ON**
- **Global OFF** → closed eye → **SOFT INHERIT cascade**: Inherited потомки = **Inherited OFF** (можно override в Overridden ON)

**Overridden ON** папка сама становится open-eye root для своих потомков (hard-lock cascade вниз от неё), независимо от global.

**Overridden OFF** папка каскадирует soft-inherit вниз.

### 4.4. Matrix исходов

| Global | Per-folder (own intent) | Effective render | Sync behavior |
|--------|-------------------------|------------------|---------------|
| ON | Overridden ON | open eye, Overridden | synced (explicit) |
| ON | Inherited | open eye, Locked ON (от global) | synced (cascade) |
| ON | Overridden OFF | closed eye, Overridden | NOT synced (explicit opt-out) |
| OFF | Overridden ON | open eye, Overridden | synced (survives global OFF) |
| OFF | Inherited | closed eye, Inherited OFF | NOT synced (cascade) |
| OFF | Overridden OFF | closed eye, Overridden | NOT synced |

### 4.5. Use cases решаются

- **Archive bin «never touch»** → Overridden OFF permanent, independent of global
- **Hero shot «always sync»** → Overridden ON permanent, survives global OFF
- **Ingest mode** → Global ON, все Inherited активируются, Overridden не трогаются
- **Panic pause** → пока не закрыт — edge case; будет «Pause All» snapshot-button в v1.3

### 4.6. Tooltip source disclosure

Каждая Inherited eye ячейка при hover показывает источник:

- «Inherited from: **Global**» (если cascade дошёл до virtual root без перехвата)
- «Inherited from: **03_Assets**» (если перехвачен parent-override ближе)

Различие источника **не требует разных tier'ов** — поведение идентично, только tooltip.

### 4.7. Замена старой модели v1 §7.2

**Было (v1)**: `global OFF → eye column hidden`.
**Стало (v1.2)**: eye column **всегда видна**. Global — часть cascade, не switch.

### 4.8. Первоклик-хинт

Когда юзер впервые кликает eye-ячейку, которая эффективно Locked от global:

- One-time toast: *«Saved — applies when Global Autosync is off»*
- Dismissible. Future clicks silent.

Причина: визуально клик может выглядеть «не сработавшим» (Locked не меняется). Toast снимает путаницу.

---

## 5. Cascade semantics per column

### 5.1. Правило умолчания

**Default cascade = symmetric Inherited в обе стороны.** Исключения требуют domain-специфичного обоснования.

### 5.2. Таблица

| Column | Cascade | Justification |
|--------|---------|---------------|
| **SUB** | asymmetric: ON → Inherited, OFF → **Disabled** | OFF = structural self-removal — дети не могут участвовать в non-existent structure |
| **EYE** | asymmetric: ON → **Locked** (hard), OFF → Inherited (soft) | safety invariant — «открытый глаз» = «я гарантирую watch», нельзя тихо отвалиться у потомков |
| **REL** | symmetric Inherited | preference, не safety. Per-branch override легитимен (NAS share vs local SSD) |
| **SEQ** | symmetric Inherited | processing rule, override legitimate per subfolder |
| **FLT** | symmetric Inherited | каскад по rows определён в v1 §5.2 (v2 flatten logic); tier tone — Inherited, не Locked |

### 5.3. Forbidden pair coercion

Асимметричные cascade создают запрещённые (Tier, Value) пары, которые рендер должен coerce'ить:

| Raw intent (класс, значение) | Coerced render | Reason |
|-------------------------------|----------------|--------|
| `eye (Inherited, ON)` | `(Locked, ON)` | open eye не может быть soft-inherit — только hard |
| `eye (Locked, OFF)` | `(Inherited, OFF)` | closed eye не может hard-lock — только soft |
| `SUB (Inherited, OFF)` | — | допустимо (ребёнок следует OFF parent'у) |
| `SUB (Disabled, OFF)` | — | легитимно (parent self-removed, child dormant) |

**Coercion выполняется в render-функции** (`checkbox()` / `eyeToggle()`), не в данных. Данные хранят user intent, render резолвит legal state.

### 5.4. Применённое в panel v1.2.js — надо довыверить

- `eyeToggle()` уже coerce'ит forbidden pairs (сделано 2026-04-20, см. session history)
- `checkbox()` для SUB OFF cascade — TBD (аудит treeRows на Phase A)
- `02_Image` пофиксен 2026-04-21 (`eye: "off"` → `eye: "inherited-on"` → render как Locked ON)

---

## 6. Tooltips & affordances

### 6.1. Что показывать на hover

| Target | Tooltip |
|--------|---------|
| Status lamp (any) | «Online» / «Drift: N files scattered» / «Scanning 12 of 48» / «Unreachable: Drive K: unplugged» |
| Yellow lamp | adds: «Click to reconcile» |
| Inherited cell | «Inherited from: [source name]» |
| Overridden cell | «Overridden here. Parent value: [ON/OFF]» |
| Locked cell | «Locked by: [parent name]. To change, edit parent.» |
| Disabled cell | «Dormant: [reason, e.g. parent SUB is off]. Clicks save intent for later.» |

### 6.2. Click behavior invariants

| Cell Tier | Click action |
|-----------|--------------|
| Overridden | toggle значение, mutate row |
| Inherited | toggle → становится Overridden с противоположным значением |
| Locked | no-op visual pulse + tooltip «Locked by parent» |
| Disabled | mutate **stored intent**; lamp/row не меняет state (dormant) |

### 6.3. Reconcile dropdown UX

- Триггер: клик на yellow (drift) lamp
- Layout: небольшой popover под лампой, 3 пункта vertically
- Hover на «Gather Sheeps» → secondary tooltip: «N files will move from X to Y»
- После выбора «Ignore Drift» → лампа переключается на outline amber (hollow with amber stroke)

---

## 7. Implementation roadmap

Работа в `figma-sheepdog-panel-v1.2.js`. Порядок утверждён 2026-04-21: **A → E → C → B → D**.

Принцип: чистое до структурного. Сначала данные (A) + существующий рендер (E) вычищаются. Затем добавляется новый чистый visual (C, self-contained в col 1). Затем структурное изменение cascade-модели (B, virtual root). Полировка мета-слоем (D, tooltips) — в конце, чтобы не переделывать при структурных изменениях.

### Neutral eye — как реализуется (вариант A подтверждён)

Neutral eye **не отдельный tier и не новый glyph**. Это переиспользование существующего Inherited tier с source=Global. Внедрение распределено:

- **Phase B** — cascade-механика: Inherited eye ячейки резолвятся через global как virtual root. Асимметричное правило (open eye = HARD LOCK) применяется от global вниз.
- **Phase D** — tooltip source disclosure: «Inherited from: Global» vs «Inherited from: 03_Assets». Визуально неразличимо — поведение и значение идентичны.

Отвергнутая альтернатива (distinct neutral glyph, вариант B) — см. §9 decision log.

### Phase A — Semantic correctness in existing data

**Цель**: данные treeRows не нарушают cascade-правила; forbidden pairs отсутствуют на уровне intent'а.

Tasks:
- Аудит всех treeRows на asymmetric cascade violations (как `02_Image`)
- Для каждой row с `eye: "off"` — проверить что у всех предков тоже OFF или Overridden OFF
- Для каждой row с `sub: "off"` — проверить детей (они должны быть Disabled, не active)
- Зафиксировать полный список «грубых ошибок» от юзера (открытые вопросы Q2 из приоритетов)

Deliverable: все treeRows проходят lint на (Tier, Value) legality.

Dependencies: нет (чистый data pass).

### Phase E — Asymmetric cascade visual correctness audit

**Цель**: render-функции (`eyeToggle()`, `checkbox()`) корректно coerce'ят все forbidden pairs во всех demo-примерах.

Tasks:
- Verify `eyeToggle()` coercion на всех 6 состояниях: Overridden ON/OFF, Inherited ON/OFF, Locked ON/OFF
- Verify `checkbox()` для SUB: ON → Inherited cascade, OFF → Disabled cascade у child
- Cross-check demo examples: §4.5 guards, §4.6 lockout demo, §4.7 DEL rows, §7 globalOverride demo, legendDemo
- Каждый forbidden pair в `treeRows` должен render'иться через coerced state

Deliverable: никаких визуальных артефактов; все forbidden pairs приводятся к legal render.

Dependencies: Phase A (данные уже чистые).

### Phase C — Status lamp (col 1 redesign)

**Цель**: col 1 (ST) — полноценный 6-state indicator с color+shape redundancy.

Tasks:
- Таксономия: Online (● green) / Drift (● amber + `!`) / Scanning (◌ amber spin) / Pending (◌ grey) / Idle-off (◌ grey) / Unreachable (● red + `✕`)
- Glyph library — shared renderer `statusLamp(status, tooltip)`
- Color + shape redundancy (accessibility)
- Scanning animation placeholder (static spinner glyph для mockup'а, реальная rotate — implementation phase)
- Per treeRow назначение status в соответствии с контекстом (offline row → red, just-added row → hollow grey, etc.)
- Минимум один demo row для каждого из 6 состояний

Deliverable: col 1 рендерит 6 различимых состояний; каждое покрыто хотя бы одной demo row.

Dependencies: Phase A+E (чистые данные и рендер).

### Phase B — Global autosync = virtual root

**Цель**: global стал частью cascade-дерева, Inherited eye резолвится от него.

Tasks:
- Добавить в mockup header блок с **global autosync toggle** (ON/OFF) — поверх существующего header'а (см. v1 §7.1)
- Добавить root-level field в treeRows data: `globalAutosync: "on" | "off"`
- `eyeToggle()` + cascade resolver: Inherited без явного parent source → резолв через globalAutosync
- Asymmetric rule применяется от virtual root: `global ON` → Inherited потомки = **Locked ON**; `global OFF` → Inherited потомки = **Inherited OFF**
- Demo-секция **side-by-side**: две копии treeRows, одна с `global ON`, вторая с `global OFF` — показать cascade-эффект визуально (без реального toggle'а в mockup'е — это уже implementation)
- Убедиться что Overridden ON/OFF переживают оба состояния global

Deliverable: cascade визуально корректен при обоих значениях global; Overridden intent явно виден как «survives global».

Dependencies: Phase C (status lamp нужна чтобы видеть эффект global на pending/idle-off/online).

### Phase D — Tooltips & affordances

**Цель**: hover и click-affordances объясняют что юзер видит.

Tasks:
- Hover tooltips для всех tier ячеек (см. §6.1 таблицу)
- **Source disclosure для Inherited** — ключевое место реализации Neutral: «Inherited from: Global» vs «Inherited from: [parent name]»
- Hover tooltips для всех status lamp состояний (reason disclosure)
- Reconcile dropdown как click affordance для yellow (drift) lamp — mockup stub:
  - popover 3 кнопки: Gather Sheeps / Absorb Reality / Ignore Drift
  - не functional, только visual
- First-click hint toast для Locked eye (от global) — «Saved — applies when Global Autosync is off»

Deliverable: любая клеточная/лампочная неоднозначность резолвится через hover.

Dependencies: Phase B (global cascade работает, tooltip знает что сказать про source).

### Checkpoint между фазами

После каждой фазы — `node --check` на файл. После C, B, D — визуальный ревью юзером перед следующей фазой.

### Out of scope для v1.2

- Functional реализация Reconcile actions (Gather/Absorb/Ignore) — это UI stub, не behaviour
- Real global toggle interactivity — demo показывает два состояния статически
- «Pause All» button — v1.3
- Distinct neutral glyph — отвергнуто в пользу Inherited reuse

---

## 8. Non-goals (v1.2 scope limits)

- **Не** добавляем functional logic — это всё ещё Figma mockup, click-affordances визуальные
- **Не** трогаем data schema `folders[].eye` (добавим `globalAutosync` отдельным root field при Phase B)
- **Не** проектируем Settings panel для global autosync — это header toggle + будущий dialog
- **Не** реализуем Reconcile actions (Gather/Absorb/Ignore) — только UI stub
- **Не** добавляем «Pause All» button — v1.3

---

## 9. Decision log

- **2026-04-20**: Tier/Status disambiguation. Trigger — review mockup'а, `disabled` накопил слишком много смыслов. Resolution: два ortho оси, composable.
- **2026-04-20**: Status lamp 6-state taxonomy (Online / Drift / Scanning / Pending / Idle-off / Unreachable). Yellow кликабельна = Reconcile dropdown.
- **2026-04-20**: Red объединяет offline / error / perm-denied (SRP на уровне лампы; причина — в tooltip).
- **2026-04-21**: Global autosync = virtual root (Discord pattern). **Отвергнуто**: kill-switch с Disabled-override per-folder. **Выбрано**: virtual root + Overridden/Inherited eye states. Reasoning:
  - Permanent per-folder intent (archive, hero) — реальный use case
  - Self-describing current state > counterfactual reasoning
  - Не требует новых tier'ов — reuses Inherited
  - Unified cascade: global просто часть дерева
- **2026-04-21**: REL/SEQ/FLT cascade = symmetric Inherited. Asymmetric (EYE, SUB OFF) требует domain justification. Default = symmetric Inherited.
- **2026-04-21**: `02_Image` row fix — `eye: "off"` → `eye: "inherited-on"` per asymmetric cascade (parent `03_Assets` has open eye → HARD LOCK).
- **2026-04-20**: Checkbox/eye taxonomy (TC palette, body-path styling) ported from `figma-sheepdog-checkbox-variants.js` to main panel.
- **2026-04-21**: **Neutral eye — вариант A принят**: переиспользование Inherited tier + tooltip source disclosure. **Отвергнуто**: distinct neutral glyph (вариант B, «открытый eye без зрачка»). Reasoning: ноль новых визуалов, ноль новых tier'ов, меньше cognitive load. Semantically Inherited-from-Global и Inherited-from-parent идентичны по поведению — различать только через tooltip.
- **2026-04-21**: Implementation phase order утверждён — **A → E → C → B → D**. Принцип: чистое до структурного, мета-слой (tooltips) — в конце.
- **2026-04-21**: §4.6 + §4.7 Row D — Locked → Disabled переклассификация. Trigger: визуальный ревью mockup'а, «SUB=off cascade» читался как «parent forcing value», что семантически ложно (engine dormant, нет coercion). Resolution: (a) SUB/REL/SEQ/FLT у потомков внутри SUB=off поддерева → **Disabled tier** (dashed empty, stored value preserved), не Locked; (b) EYE при этом остаётся hard-locked parent'ом → новый композитный tier **Disabled+Locked** (backDim body + backMid dashed stroke). Reasoning: dormancy ≠ coercion; asymmetric eye cascade orthogonal to SUB dormancy и переживает её. Extended `checkbox()` + `eyeToggle()` palette: `disabled-locked-on` / `disabled-locked-off`. Применено к §4.6 (2025_Q4, shoot_01) и §4.7 Row D (reelC).

---

## 10. Open questions

1. **Soft-stop «accepted drift» sub-tier** — добавлять outline amber или ограничиться toggle ignore? v1.3 решение.
2. **«Pause All» global snapshot-button** — для panic-off сценария. Virtual-root модель не закрывает этот кейс (Overridden ON переживают global OFF). v1.3.
3. **Reconcile dropdown UX** — 3 кнопки в popover или nested menu? UI passing при implementation.
4. **Status lamp 6-я category «Error w/ recovery»** (scan failed retry-able) vs «Error hard» (corrupt ref)? MVP объединяем в red-unreachable.
5. **Tooltip source disclosure глубина** — для вложенных Inherited показывать полную цепочку («from: Global → 03_Assets → 02_Image») или только immediate source? MVP: immediate, v1.3 — цепочка опционально.

---

## Appendix A — Cross-references

- `figma-sheepdog-panel-v1.2.js` §1 (tree rows), §3 (safety cover), §4 (guards), §7 (global override demo)
- `figma-sheepdog-checkbox-variants.js` — canonical taxonomy definitions (TC palette, tier rendering)
- `v1 Panel Architecture Concept.md` — base document, §3.1 (STATE dot), §5 (override rules), §7.2 (global eye, superseded)
- Memory: `feedback_eye_asymmetric_cascade.md`, `feedback_sheepdog_disabled_cover.md`, `feedback_safety_cover_visual.md`
