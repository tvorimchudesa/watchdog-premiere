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

# v1.1 Infrastructure — PLANNED

## 14.5. Defensive infrastructure: Bridge timeout + Cancel + Debug log
> **Приоритет:** ДО фич v1.1. Без этого BUG-001 продолжит убивать сессии без диагностики.
> Three-in-one: разблокировать зависшие Promise, дать юзеру exit, собрать данные для repro.

### 14.5.1. Bridge per-call timeout (hard safety net)
> Каждый `Bridge.call(fn, args)` имеет timeout default **30s** (per-call, не per-total).
> Назначение: защита от "user not present" (ноут ушёл в sleep, скрытая модалка Premiere).
> Cancel button (§14.5.2) обслуживает "user present" — не ждёт timeout.

> **Как тестить (DevTools → Chrome `http://localhost:8088` → панель SheepDog):**
> ```js
> // 1. Проверить default
> Bridge.getDefaultTimeout()                 // → 30000
>
> // 2. Поставить минимум — 100ms (clamp floor в bridge.js). Гарантированно
> //    триггерится на любом Bridge.importFiles round-trip.
> Bridge.setDefaultTimeout(100)
>
> // 3. Sync All на любой папке с медиа
> //    → в console: "BRIDGE_TIMEOUT: importFilesToBin did not respond within 100ms"
> //    → UI разблокируется, Cancel исчезает
>
> // 4. Восстановить
> Bridge.setDefaultTimeout(30000)
> ```
>
> **Почему не 2000ms:** chunk из 10 файлов у Premiere летит за <2s, timeout не
> успевает стрельнуть. 100ms (floor) — надёжно.

- [Да] `Bridge.getDefaultTimeout()` возвращает `30000` после старта
- [Да] `Bridge.setDefaultTimeout(100)` + Sync All → timeout срабатывает, импорт не висит
- [Да] Error виден в DevTools console: `"BRIDGE_TIMEOUT: importFilesToBin did not respond within 100ms"`  <!-- Но фактически файлы в проект импортнулись, но я так понимаю это ок -->
- [Да] После timeout UI разблокирован, Cancel button исчезает, можно запустить новый Sync All
- [Да] `setDefaultTimeout(30000)` восстанавливает default, нормальный импорт работает 

<!-- И еще момент, мы сейчас показываем прогресс батчами. Но юзеру похуй вообще на то что мы батчами отслеживаем x + 10 of N, ему важен прогресс именно of N, потому предлагаю юзеру выводить прогресс глобального одного бара -->

### 14.5.2. Cancel button visible from t=0
> Cancel доступна **с секунды 0** импорта — юзер сам решает когда stop.
> Cancel cancel'ит текущий pending Bridge call (не ждёт timeout) и очищает queue.

> **Как тестить:**
> Подготовь папку с ~30+ mp4/png файлами (чтобы импорт был заметно долгим).
> 1. Sync All → сразу видна красная кнопка Cancel рядом с "Importing 0/30..."
> 2. Жми Cancel в первые 1-2 секунды
> 3. Статус моментально: `"Cancelled — X of Y imported"`
> 4. Добавь новую папку + Sync All → работает нормально (state чистый)
> 5. Повтори с Auto Sync ON (добавь папку при Auto Sync) → Cancel тоже доступен

- [ ] Cancel button появляется одновременно со статусом "Importing..." (секунда 0)
- [ ] Клик Cancel → статус меняется на "Cancelled — X of Y imported" моментально (не ждём timeout)
- [ ] Progress bar исчезает, Cancel button исчезает
- [ ] Повторный Sync All сразу после Cancel работает
- [ ] Cancel во время initial scan (Auto Sync ON + добавление папки) тоже работает

### 14.5.3. Batch chunking (natural progress)
> Importer разбивает queue на **chunks по 5-10 файлов** per Bridge.importFiles call.
> Прогресс "X of N" обновляется после каждого chunk → юзер видит движение каждые 2-3s.
> Per-batch timeout (§14.5.1) → один завис не убивает весь импорт.

> **Как тестить:**
> Папка с **25-50** медиа-файлами (не 3-5 — важен сам факт множественных chunks).
> 1. Sync All → прогресс "0/40" → через ~секунду "10/40" → "20/40" → ...
> 2. Должно быть **несколько обновлений** статуса, не одно "0/40" и сразу "40/40"
> 3. Если хочешь увидеть stall hint: в DevTools `Importer.setStallMs(1500)` + Sync All → после ~1.5s прогресса статус меняется на "Importing... this batch is slow (chunk X/Y)"
> 4. Верни `Importer.setStallMs(10000)` чтобы stall hint не мешал

- [ ] Sync All с 25+ файлами → прогресс обновляется пошагово (видны минимум 3 промежуточных значения)
- [ ] Default chunk size = 10 (проверь в `sheepdog/js/modules/importer.js:21`)
- [ ] Final status нормальный: "Imported N files" (или с `(M failed)` если были ошибки)
- [ ] Stall hint: `Importer.setStallMs(1500)` + Sync All → статус "...this batch is slow..." появляется
- [ ] Error в одном chunk (напр timeout) → остальные chunks продолжают работать, в финале "N imported (M failed)"

### 14.5.4. Debug mode + log file
> Event trace в `sheepdog-debug.log` рядом с проектом. Off by default.
> Log format: `[ISO-timestamp] [LEVEL] [component] message`
> Level: INFO / WARN / ERROR
> Append-only, rotate при > 10 MB (keep last 3 files).

> **Как тестить (DevTools консоль):**
> ```js
> // 1. Включить debug mode
> Logger.isEnabled()                         // → false (default)
> Logger.setEnabled(true)
>
> // 2. Узнать куда пишется
> Logger.getPath()                           // → "C:/.../project-folder/sheepdog-debug.log"
>
> // 3. Триггернуть события
> //    - Нажми Sync All в панели
> //    - Toggle Auto Sync ON/OFF
> //    - Нажми Cancel во время импорта
>
> // 4. Открыть log файл в редакторе — должны быть строки типа:
> //    [2026-04-17T...] [INFO] [App] Sync All started, folders=2
> //    [2026-04-17T...] [INFO] [App] Cancel clicked by user
> //    [2026-04-17T...] [INFO] [Importer] Flush complete: imported=5 errors=0 cancelled=true
>
> // 5. Выключить
> Logger.setEnabled(false)
> ```

- [ ] `Logger.isEnabled()` возвращает `false` после старта (off by default)
- [ ] `Logger.setEnabled(true)` включает логирование
- [ ] `Logger.getPath()` возвращает путь вида `.../sheepdog-debug.log` рядом с проектом
- [ ] Sync All / Auto Sync toggle / Cancel → в log появляются записи
- [ ] Формат: `[ISO-timestamp] [LEVEL] [component] message`
- [ ] OFF: новые события не пишутся в файл (существующие строки остаются)
- [ ] Rotate (ручной тест — опционально): создать фейковый log > 10MB → следующая запись триггерит rotate, создаются `.1`, `.2`, `.3`
- [ ] Settings dialog с toggle "Debug mode" — отложено до §18

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
> Табы: **General** (Bridge timeout, Debug mode, Show per-folder actions), **Filters** (extensions allowlist), **Ignored** (regex patterns), **About**.
>
> **UI-level safety bounds** (отличаются от API-level sanity в Bridge/Logger):
> - Bridge timeout: slider/input 5000-120000 ms (default 30000). Нельзя поставить <5s или >2min через UI.
> - API (DevTools `Bridge.setDefaultTimeout(X)`) принимает 100-600000 ms — нужно для тестов/dev.
- [ ] Кнопка-шестерёнка в header панели → открывается модалка
- [ ] Таб General: slider "Bridge timeout" (5-120s), toggle "Debug mode", toggle "Show per-folder actions"
- [ ] Таб General: UI enforces 5000-120000 ms bound — ввод вне диапазона clamp'ится
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

## 22. Progress bar improvements — PLANNED
> Текущий progress bar показывает только "Importing X/Y..." и % fill.
> При chunked-импорте (§14.5.3) и dedupe-heavy папках этого мало — юзер не
> видит что происходит: сколько chunks осталось, сколько уже в проекте, почему
> "застыло". Прогресс = коммуникация, не декорация.
>
> Implementation hooks уже есть: `progressCallback` получает
> `{done, total, chunkIndex, chunkTotal, stalled}`, `stallCallback` — `{chunkIndex, chunkTotal, stuckMs}`.
> Большинство пунктов — работа в `showProgress()` в [app.js](sheepdog/js/app.js#L34-L39).

### 22.1. Live-информация во время импорта
- [ ] Chunk-счётчик в статусе: `"Importing 45/152 (chunk 5/16)"` — юзер видит что batch-прогресс жив
- [ ] Live skipped count: `"Importing 45/152 (12 already in project)"` — не ждём финала чтобы увидеть что dedupe работает
- [ ] Live errors count если > 0: `"Importing 45/152 (3 failed)"` — ранняя видимость проблем

### 22.2. Stall-состояние визуально
- [ ] При `onStall` progress bar меняет цвет (оранжевый/жёлтый) — не только текст
- [ ] Pulse/shimmer анимация во время stall → сразу ясно что "ещё крутится, но долго"
- [ ] После завершения chunk возвращается к обычному цвету

### 22.3. ETA (optional, после 2-3 chunks)
- [ ] Rolling average времени per chunk → "~12s remaining" в статусе
- [ ] Не показывать ETA для коротких импортов (< 3 chunks) — враньё на малых n
- [ ] Сбрасывается при stall (чтобы не показывать неактуальный ETA)

### 22.4. Final state polish
- [ ] `hideProgress()` с задержкой 1-2s после complete — юзер успевает прочитать финальный статус
- [ ] Fade-out анимация вместо резкого `display:none`
- [ ] Cancel button исчезает синхронно с progress bar (а не отдельно)

---

# KNOWN BUGS — TO INVESTIGATE

## BUG-001: Manual/Sync All stuck on "0 of N" — import Promise hangs
> Обнаружен 2026-04-17. Repro не найден, но симптомы детальны.
> **Симптом:**
> - Запустил Manual Sync → статус "Imported 0 of N" (или Sync All)
> - Прогресс НЕ двигается, зависает на 0
> - Панель в остальном отзывчива: можно добавлять новые папки, их статус выводится корректно
> - Снос bin в Premiere — не помогает
> - Снос watch folder из плагина — не помогает
> - Перезапуск панели (close/open в Window → Extensions) — не помогает
> - **Только полный перезапуск Premiere Pro** восстанавливает работу
>
> **Гипотеза root cause:** `Importer.flush()` висит на `Bridge.importFiles()` — Promise никогда не resolve/reject.
> Возможные причины:
> 1. ExtendScript `app.project.importFiles(...)` кинул исключение, которое потерялось
> 2. Premiere показывает модалку где-то не видно и ждёт user interaction
> 3. CEF callback от `cs.evalScript(...)` никогда не выстрелил
> 4. Queue state не сбрасывается даже при новых операциях → deadlock
>
> **Triggers (догадки):**
> - Большое кол-во файлов в одном batch?
> - Специфичное расширение?
> - Offline items в bin до Sync All?
> - Flat mode ON?
> - Определённая последовательность действий (например drag-drop → Manual → Sync All)?
>
> **Workaround:** полный restart Premiere Pro.
> **Fix-direction:** §14.5 (timeout + Cancel + debug log) сделает баг видимым и unstick'ает UI.
>
> **TODO:**
> - [ ] Собрать repro: попробовать trigger-факторы в изоляции (много файлов / spec extension / post drag-drop / Flat ON)
> - [ ] После §14.5: включить debug mode → ждать следующего появления → собрать log
> - [ ] Проверить в DevTools console когда случится: есть ли uncaught exception в момент hang
> - [ ] Проверить Bridge.diagnose() перед Sync All: все ли компоненты ok
> - [ ] Если repro найден → fix → закрыть баг

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

# DEV NOTES

> Справочник для нас, не для пользователя. User-facing Settings dialog (§18) и
> полноценный debug mode — v1.1+. Пока всё тестирование идёт через DevTools.

## Как читать/заполнять этот чеклист

**Чекбоксы:**
- `[ ]` — не тестировалось
- `[Да]` / `[Yes]` — прошло
- `[Нет]` — не прошло или заблокировано. **Всегда** с inline-комментом почему.

**Inline-комменты:** `<!-- причина/контекст -->` сразу после пункта. Для
заметок когда тест блокирован, даёт неожиданное поведение, или нужен нюанс.

**Обновление:** если тест-инструкция устарела (напр. `setDefaultTimeout(2000)`
перестал срабатывать из-за изменённых chunks) — правим рецепт и ресетим
соответствующие чекбоксы в `[ ]`, а не оставляем старые `[Нет]`.

**Секции:**
- §1–9 — MVP (стабильная база)
- §10–14 — v1.0 features (shipped)
- §14.5 — v1.1 defensive infrastructure (Bridge timeout, Cancel, Logger)
- §15–21 — v1.1 features (planned)
- KNOWN BUGS — баги для repro
- REJECTED / DEFERRED — отклонённые идеи с причиной

## Debug mode — internal reference

> Off by default. Включается только через DevTools. Используем для диагностики
> BUG-001 и будущих "зависов". Юзер-toggle отложен до §18.

**Toggle (DevTools → Chrome `http://localhost:8088` → панель SheepDog):**
```js
Logger.isEnabled()        // false by default
Logger.setEnabled(true)   // включить
Logger.getPath()          // полный путь к log файлу
Logger.getFolder()        // только директория проекта
Logger.setEnabled(false)  // выключить
```

**Location:** `{projectDir}/sheepdog-debug.log` — рядом с `.prproj`.

**Format:** `[ISO-timestamp] [LEVEL] [component] message`
- Levels: `INFO` / `WARN` / `ERROR`
- Append-only, без перезаписи между сессиями.

**Rotation:** при > 10 MB текущий log переименовывается в `.1`, старые сдвигаются
(`.1 → .2 → .3`). `.3` удаляется. Итого максимум 4 файла на диске.

**Что логируется сейчас:**
- `App`: Panel started, Sync All started/scan done, Sync folder, Auto Sync
  toggle ON/OFF, Cancel click, Mirror deletion, Diagnose failure
- `Importer`: Flush complete (imported/skipped/errors/cancelled), Chunk stalled

**Чего НЕ логируется (кандидаты если встретим BUG-001 снова):**
- Per-chunk Bridge calls (paths + bin + raw result)
- Failed chunk error messages (сейчас только в `console.error`)
- Watcher events (file detected / deleted / ignored)

**Расширяем по необходимости** — не добавляем логи спекулятивно.

## Важные файлы для отладки

- `{projectDir}/sheepdog-settings.json` — глобальные настройки (toggle state,
  Bridge timeout, debugMode, allowed extensions)
- `{projectDir}/sheepdog-folders.json` — watch folders config (SOT)
- `{projectDir}/sheepdog-debug.log[.1/.2/.3]` — debug log (если включён)

## Вызов панели + DevTools

1. `%APPDATA%\Adobe\CEP\extensions\` должен содержать symlink на `sheepdog/`
2. Registry: `HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.11\PlayerDebugMode = 1`
3. Premiere → Window → Extensions → SheepDog
4. DevTools: Chrome → `http://localhost:8088` → клик по панели SheepDog
5. **CEP кэширует JS** — после правок всегда close/open панели, иначе старый код.

---

**Дата тестирования:** 16-17.04.2026
**Версия Premiere:** 25
**Результат MVP:** Всё ок
**Результат v1.0:** Всё ок (§10–14)