# SheepDog

CEP extension for Adobe Premiere Pro that automatically syncs system folders with project bins.

Drop a folder onto the panel — SheepDog monitors it for new files and imports them into the corresponding bin automatically.

## Features (MVP) ✅

- **Auto Sync** — watches folders and imports new media files automatically
- **Manual Sync** — one-click sync for all watched folders
- **Watch Folders panel** — add, remove, configure watched directories
- **Subfolder support** — imports with sub-bin hierarchy matching folder structure
- **File extension filter** — whitelist of allowed media types (Defense in Depth: filters in Watcher AND Importer)
- **Progress indicator** — visual feedback during import
- **Per-project config** — watchFolders.json + settings.json next to .prproj

## Planned (v1.0)

- Mirror Deletions toggle — file removed from disk → remove from bin
- Drag & drop folders from Explorer/Finder onto panel
- Global settings fallback → per-project override
- Flatten subfolders mode
- Color label assignment per folder
- Ignored folders with regex support
- Settings dialog (tabs: General / Allowed Files / Ignored Folders)
- Toast notifications on import complete
- Relative paths for project templates
- Image sequence detection

## Future (v1.5)

- Camera card auto-detection (RED, ARRI, P2, Panasonic)
- Span media import without duplicates
- Link existing Premiere bins via drag & drop
- Import date metadata
- Folder state tracking (online / offline / new)

## Tech Stack

- **CEP (Common Extensibility Platform)** — Premiere Pro extension framework
- **HTML/CSS/JS** — panel UI (dark theme matching Premiere)
- **Node.js** (via CEP) — filesystem watching (chokidar)
- **ExtendScript** — Premiere Pro scripting API (importFiles, bin CRUD)

## Architecture

Built on Apple coding principles: SRP, Minimal Surface, Defense in Depth, SOT, DRY.

```
Panel UI (index.html)
  → app.js (wiring only)
    → Bridge (js/bridge.js) — single entry to ExtendScript (DRY)
      → host.jsx — importFiles(), bin CRUD, metadata
    → Watcher (chokidar) — file detection (SRP)
    → Importer — filter + batch queue (Defense in Depth)
    → FolderManager — config CRUD (SOT: watchFolders.json)
    → SettingsManager — global settings (SOT: settings.json)
```

## Requirements

- Adobe Premiere Pro 2020+ (tested on 2025)
- Windows or macOS

## Development

```bash
cd sheepdog

# Install dependencies
npm install

# Enable CEP debug mode (Windows — run once)
# HKCU\SOFTWARE\Adobe\CSXS.11 → PlayerDebugMode = 1
# HKCU\SOFTWARE\Adobe\CSXS.12 → PlayerDebugMode = 1

# Create junction to CEP extensions folder
# mklink /J "%APPDATA%\Adobe\CEP\extensions\com.sheepdog.premiere" "<path-to-sheepdog>"

# Restart Premiere Pro → Window → Extensions → SheepDog
```

## License

MIT
