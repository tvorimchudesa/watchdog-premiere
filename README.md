# Watchdog

CEP extension for Adobe Premiere Pro that automatically syncs system folders with project bins.

Drop a folder onto the panel — Watchdog monitors it for new files and imports them into the corresponding bin automatically.

## Features (MVP)

- **Auto Sync** — watches folders and imports new media files automatically
- **Manual Sync** — one-click sync for all watched folders
- **Watch Folders panel** — add, remove, configure watched directories
- **Subfolder support** — import with or without folder hierarchy
- **File extension filter** — whitelist of allowed media types
- **Progress indicator** — visual feedback during import

## Planned

- Image sequence detection
- Flatten subfolders mode
- Relative paths for project templates
- Color label assignment per folder
- Camera card auto-detection (RED, ARRI, P2, Panasonic)
- Import date metadata
- Ignored folders with regex support

## Tech Stack

- **CEP (Common Extensibility Platform)** — Premiere Pro extension framework
- **HTML/CSS/JS** — panel UI
- **Node.js** (via CEP) — filesystem watching
- **ExtendScript** — Premiere Pro scripting API

## Requirements

- Adobe Premiere Pro 2020+
- Windows or macOS

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Install extension (symlink for development)
npm run install-ext
```

## License

MIT
