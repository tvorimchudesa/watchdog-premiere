# SheepDog MVP — Checklist

<!-- Пример как комменты писать -->

## 1. Панель базово работает
- [Да] Панель открывается без ошибок
- [Да] Видны кнопки: Sync All, Auto Sync toggle, + Add
- [Да] Статус внизу: "Connected to Premiere Pro" (не "standalone mode")

## 2. Bridge (JS ↔ ExtendScript)
- [Да] DevTools доступен: `http://localhost:8088` в Chrome
- [Да] `Bridge.ping()` → `"ok"`
- [Да] `Bridge.getProjectPath()` → путь к .prproj
- [Да] `Bridge.getRootBinName()` → имя проекта

> **Как тестить Bridge:** Открой Chrome → `http://localhost:8088` → кликни на ссылку панели SheepDog → откроется DevTools. Перейди во вкладку **Console** и набери:
> ```js
> Bridge.ping().then(r => console.log(r)).catch(e => console.log("ERR:", e))
> ```
> Должно вывести `ok`. Аналогично для остальных:
> ```js
> Bridge.getProjectPath().then(r => console.log(r))
> Bridge.getRootBinName().then(r => console.log(r))
> ```
> **ВАЖНО:** CSInterface.js заменён на настоящий SDK из Premiere 2025. Перезапусти панель (закрой/открой в Window → Extensions) перед тестом.

## 3. Add Folder
- [Да] + Add → ввести путь → папка появляется в списке 
- [Да] Отображается: toggle, путь, → bin-имя, кнопка ×
- [Да] Добавить вторую папку — обе видны
- [Да] Удалить первую (×) — вторая остаётся

## 4. Import (Sync All)
- [Да] Тестовая папка с 2-3 .mp4/.png файлами
- [Да] Добавить папку → Sync All
- [Да] Файлы появились в Premiere bin (имя = имя папки)
- [Да] Progress bar показался и исчез
- [Да] Статус: "Imported N files" 

## 5. Extension Filter (Defense in Depth)
- [Да] Положить .txt в watched папку 
- [Да] Sync All → .txt НЕ импортировался
- [Да] .mp4/.png импортировались

## 6. Auto Sync (Watcher)
- [да] Включить Auto Sync toggle
- [Да] Положить новый .mp4 → через ~3 сек появляется в bin
- [Да] Положить .txt → НЕ импортируется
- [Да] Выключить Auto Sync → новые файлы не подхватываются 

## 7. Persistence
- [Да] Добавить 2 папки, включить Auto Sync
- [Да] Закрыть/открыть панель
- [Да] Папки и Auto Sync сохранились

## 8. Subfolders
- [Да] Создать подпапку в watched folder
- [Да] Положить файл в подпапку
- [Да] Sync All → файл импортируется

## 9. Subfolder → Sub-bin (bugfix)
> Файлы из подпапок должны попадать в соответствующие sub-bin-ы, а не в корневой bin.
> Перезапусти панель перед тестом — код importer.js обновлён.
- [Yes] Структура: `footage/day1/cam_a/clip.mp4`
- [Yes] Добавить `footage/day1` как watch folder
- [Yes] Sync All → в Premiere: bin `day1` → sub-bin `cam_a` → `clip.mp4`
- [Yes] Файл из корня `footage/day1/photo.png` → bin `day1` (без sub-bin)

---

# v1.0 Features

## 10. Drag & Drop
> Перетащить папку из Explorer прямо на панель SheepDog.
- [Да] Перетащить папку на панель → появляется синий overlay "Drop folder to watch"
- [Да] Отпустить → папка добавляется в список
- [Да] Перетащить файл (не папку) → статус "Drop a folder, not files"
- [Да] Перетащить уже добавленную папку → статус "Already watching: ..."
- [Да] Перетащить 2 папки одновременно → обе добавляются

## 11. Mirror Deletions (disk→bin)
> При удалении файла с диска — удаляется из bin в Premiere. Только disk→bin, НЕ наоборот.
> **Known limitation:** Premiere Pro лочит медиафайлы после импорта. Удалить файл с диска можно только если он не используется на timeline или после удаления из bin.
- [Да] Включить Auto Sync + включить toggle **Mirror Del**
- [Да] Добавить watch folder, Sync All → файлы в bin
- [Нет] Удалить файл из watch folder на диске <!-- Premiere лочит файл. Known limitation — см. выше -->
- [Нет] Через ~3 сек файл удалён из bin в Premiere
- [Нет] Выключить Mirror Del → удалить файл с диска → в bin остаётся
- [Нет] Подпапка: удалить файл из `footage/day1/cam_a/` → удаляется из sub-bin `cam_a`

> **Workaround для теста:** удалить файл из bin в Premiere, затем удалить с диска — lock снимется. Или тестировать с файлами которые не на timeline.

## 12. Flatten Mode + Safety-cover
> Flatten теперь использует safety-cover UI (3 клика: locked → unlocked → active).
> При активации: moveBin — файлы перемещаются из sub-bin-ов в корень (timeline не слетает).
> При деактивации: unflatten — файлы возвращаются в sub-bin-ы по disk path.
- [Да] Добавить папку с подпапками, Sync All → создаются sub-bin-ы
- [Да] Кнопка Flat — серая (locked). Один клик → белая рамка (unlocked)
- [Да] Второй клик → активация: файлы перемещаются из sub-bin-ов в корень bin
- [Да] Статус: "Flattened — moved N files"
- [Да] Пустые sub-bin-ы удалены (пробуем deleteItems → remove fallback)
- [Да] Файлы на timeline всё ещё работают (moveBin, не re-import)
- [Да] С Auto Sync: новый файл в подпапке → попадает в корневой bin (не в sub-bin)
- [Да] Клик на активный Flat → unflatten: файлы возвращаются в sub-bin-ы
- [Да] Статус: "Unflattened — moved N files"
- [Да] Перезапуск панели → состояние Flat сохранилось

## 13. Dedupe при импорте
> Встроено в importFilesToBin (ExtendScript). Перед импортом проверяет все mediaPath в проекте.
- [Да] Добавить папку, Sync All → файлы в bin
- [Да] Повторно Sync All → статус "All synced — no new files" (дубликаты не создаются)
- [Да] Включить Flat, Sync All → новые файлы не дублируют существующие
- [Да] Auto Sync: файл уже в проекте → повторно не импортируется

## 14. Auto Sync initial scan (QoL)
> Когда Auto Sync ON, добавление папки или включение toggle должно **сразу**
> подтянуть existing файлы, а не только watch'ить будущие события.
> Иначе label "Auto" врёт: пользователь добавил 500 файлов, ждёт — ничего не происходит.
> Dedupe в importFilesToBin защищает от повторного импорта.

### 14.1. Добавление папки при Auto Sync ON
- [Да] Очистить проект (или новый пустой проект)
- [Да] Включить Auto Sync toggle
- [Да] Подготовить папку с 3-5 .mp4 файлами (**не** watched)
- [Да] + Add → указать путь к этой папке
- [Да] Статус пробегает: "Scanning <name>..." → "Imported N files"
- [Да] Файлы появились в bin сразу, без нажатия Sync All
- [Да] Повторно добавить ту же папку через drag & drop → "Already watching: ..."
- [Да] Положить новый файл в эту папку → через ~3 сек импортируется (Watcher жив)

### 14.2. Включение Auto Sync при existing папках
- [Да] Auto Sync OFF. Добавить 2 папки с файлами (пока без импорта)
- [Да] Нажать Sync All → файлы импортированы
- [Да] Удалить пару файлов из bin в Premiere (оставив их на диске)
- [Да] Выключить Auto Sync, перезапустить панель — Auto Sync остался OFF
- [Да] Включить Auto Sync toggle
- [Да] Статус: "Scanning folders..." → "Imported N files" (только удалённые ранее)
- [Да] Dedupe: остальные файлы не дублируются

### 14.3. Drag & drop при Auto Sync ON
- [Да] Auto Sync ON
- [Да] Перетащить папку с файлами на панель → initial scan запускается сам
- [Да] Статус: "Scanning <name>..." → "Imported N files"

### 14.4. Edge cases
- [Да] Auto Sync OFF + добавление папки → initial scan **НЕ** запускается (ожидаемо)
- [Да] Auto Sync ON + добавление пустой папки → "All synced — no new files"
- [Да] Auto Sync ON + добавление папки где все файлы уже в проекте (импорт SheepDog ИЛИ вручную через File → Import — дедуп по mediaPath) → "All synced — no new files"

---

# v1.1 Features — PLANNED

## 15. Ignored folders (regex/glob) — PLANNED
> Игнорировать системный мусор и прокси-папки при сканировании.
> Defaults: `.DS_Store`, `Thumbs.db`, `**/proxy/**`, `**/.*` (скрытые), `**/Adobe Premiere Pro Auto-Save/**`.
> Пользователь может добавлять свои паттерны через Settings.
- [ ] Defaults применяются сразу после установки (без настройки)
- [ ] Папка `footage/day1/.thumbnails/` → файлы внутри не импортируются
- [ ] `Thumbs.db` / `.DS_Store` не появляются в bin
- [ ] Пользовательский паттерн `**/proxies/**` → соответствующие файлы пропускаются
- [ ] Паттерны сохраняются после перезапуска
- [ ] Статус: "Skipped N ignored files" при Sync All

## 16. Image sequence support — PLANNED
> Серии EXR/DPX/TIF/PNG (`name.NNNN.ext`) импортируются как **один клип**, не как N стиллов.
> Критично для VFX/DI/motion workflow — без этого инструмент непригоден для renders.
> Реализация: детектор паттернов в importer, вызов `importFiles([firstFrame], true, binPath, true)` — `asNumberedStills=true`.
- [ ] Папка `renders/shot_010/` с `shot_010.0001.exr`–`shot_010.0100.exr` → 1 клип в bin (не 100 стиллов)
- [ ] Клип называется по базе (`shot_010`), длительность соответствует N кадрам при project fps
- [ ] Смешанная папка: EXR-серия + .mp4 → серия как клип, mp4 как видео
- [ ] Несколько серий в одной папке (`shot_010.*.exr` + `shot_020.*.exr`) → 2 клипа
- [ ] Паттерны с underscore: `shot_010_0001.exr` — работает
- [ ] Неполная серия (пропущены кадры) → Premiere импортит с пропусками (его поведение по умолчанию)
- [ ] Dedupe: повторный Sync All → серия не дублируется
- [ ] Auto Sync: добавление нового кадра в существующую серию → серия обновляется (или impossible — задокументировать поведение)
- [ ] Одиночный .exr (не серия) → импортится как still, не как sequence

## 17. Color label per watch folder — PLANNED
> Каждой watch folder можно назначить Premiere color label (violet, iris, cerulean, forest, …).
> Все файлы из этой папки получают её label → визуальная навигация в bin.
- [ ] В списке folder-ов появляется color picker (9 стандартных Premiere цветов)
- [ ] Выбор цвета для папки → все импортируемые файлы получают этот label
- [ ] Label сохраняется в `sheepdog-folders.json`
- [ ] Существующие файлы (уже импортированные) получают label после клика "Apply color"
- [ ] Две папки с разными цветами → файлы различимы в bin

## 18. Settings dialog — PLANNED
> Модалка с табами для управления глобальными настройками.
> Табы: **General** (auto-save interval, UI density, **Show per-folder actions** toggle), **Filters** (extensions allowlist), **Ignored** (regex patterns), **About**.
- [ ] Кнопка-шестерёнка в header панели → открывается модалка
- [ ] Таб General: toggle "Show per-folder actions" — управляет видимостью ↻ / gear icons в folder-row
- [ ] Таб Filters: список расширений, add/remove, save
- [ ] Таб Ignored: список regex/glob паттернов, add/remove, save
- [ ] Изменения сохраняются в `sheepdog-settings.json`
- [ ] Закрытие без save → изменения отменяются
- [ ] Reset to defaults → стандартные значения возвращаются

## 19. Manual Sync per folder — PLANNED
> Иконка ↻ в каждой folder-row — синк только этой папки (scope-limited аналог Sync All).
> Семантика: idempotent, dedupe-aware, не трогает offline items.
> Включается тогглом "Show per-folder actions" в Settings.
- [ ] При "Show per-folder actions" ON → ↻ иконка в правой части каждой folder-row
- [ ] Клик ↻ → scan этой папки → import новых файлов (dedupe)
- [ ] Статус: "Scanning <folder>..." → "Imported N files" / "All synced — no new files"
- [ ] Offline items остаются offline (не удаляются и не реимпортятся молча)
- [ ] При OFF → иконка скрыта, Sync All в header работает как раньше
- [ ] Multiple clicks → последовательная обработка без дублей

## 20. Danger Zone: Reverse Mirror + per-folder actions — PLANNED
> Collapsible секция внизу панели. Все деструктивные действия здесь.
> Scope: per-folder (не глобально) — уменьшает blast radius.
> Реализация: gear icon per folder-row → раскрывает Danger Zone actions для этой папки.
> Recycle Bin only. Session undo stack. Append-only log `sheepdog-reverse-mirror.log.json`.

### 20.1. Reverse Mirror per folder (manual trigger)
- [ ] Gear icon в folder-row → expand → видны Danger Zone actions
- [ ] Кнопка "Sync bin deletions to disk" (safety-cover 3-state: locked → unlocked → active)
- [ ] Active → scan: files на диске в этой папке которых нет в bin → preview modal ("Send N files to Recycle: [list]")
- [ ] Confirm → send to OS Recycle Bin (via `trash` npm)
- [ ] Undo button доступна в сессии (не переживает перезапуск): "Undo last delete (N files)"
- [ ] Log записан в `sheepdog-reverse-mirror.log.json` (timestamp, filePath, binPath, status)
- [ ] Cancel в preview → ничего не удаляется

### 20.2. Clean offline media per folder (manual trigger)
> Отдельное действие: убрать из bin items чьи файлы исчезли с диска.
> Только в этой папке, preview перед подтверждением.
- [ ] В Danger Zone per folder → кнопка "🧹 Clean offline (N)" — счётчик актуален
- [ ] Preview modal со списком offline items
- [ ] Confirm → items удалены из bin (Bridge.removeFileFromBin)
- [ ] Timeline references становятся offline в Premiere (ожидаемо — они уже были broken)

## 21. Offline media indicator — PLANNED
> Информативное отображение "что broken" без автоматических действий.
> Pro-монтажёр сам решает что с этим делать.
- [ ] Глобальный footer: `⚠ 3 offline` — кликабельно
- [ ] Клик → модалка со списком: filename, parent folder, status (missing / outside watch folder)
- [ ] Per-folder badge: маленькая цифра `(N)` возле имени папки если есть offline внутри
- [ ] Статус обновляется: при Manual Sync / Sync All / Auto Sync tick
- [ ] Файлы которые юзер релинкнул вне watch folders → "outside watched folders" (не удалять, не тянуть)

---

# KNOWN BUGS — TO INVESTIGATE

## BUG-001: Sync All crash requires Premiere restart
> Обнаружен 2026-04-17. Repro не найден.
> **Симптом:** после некоторого действия Sync All перестаёт работать / панель зависает / import silently fails.
> **Triggers (что помнится):** связан с Sync All, возможно после специфичной последовательности.
> **Workaround:** полный перезапуск Premiere Pro (не просто reload панели).
> **TODO:**
> - [ ] Воспроизвести. Возможные факторы: большое кол-во файлов, offline items в bin, Flat mode ON, специфичные расширения
> - [ ] Логировать последние N операций в `sheepdog-debug.log` для post-mortem
> - [ ] Проверить: есть ли exception в DevTools console в момент бага
> - [ ] Проверить: есть ли ошибка в ExtendScript (Bridge.diagnose перед Sync All)
> - [ ] Если repro найден — баг чинится и этот пункт закрывается

---

# REJECTED / DEFERRED

## Reverse Mirror (bin→disk) as AUTO — REJECTED (2026-04-17)
> Авто-polling версия (автоматическая синхра bin→disk при каждом tick) отклонена.
> **Причина:** race condition с Auto Sync (disk→bin) без snapshot-инфраструктуры.
> **Заменено на §20.1:** manual trigger per folder в Danger Zone.
>
> Идея manual-версии сохраняет ценность (юзер хочет чистить disk от deleted-from-bin) без рисков автоматики.

## Clean Resync — REJECTED (2026-04-17)
> Удалить всё в целевых bin-ах и импортнуть заново. Nuclear option.
> **Причины:** рвёт timeline references. Никто не нажмёт эту кнопку на живом проекте. Теоретическая фича без реального use case.

---

**Дата тестирования:** 16-17.04.2026
**Версия Premiere:** 25
**Результат MVP:** Всё ок
**Результат v1.0:** Всё ок (§10–14)