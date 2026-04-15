# Watchtower v1.5 - Product Analysis

## Overview
Watchtower by Knights of the Editing Table - CEP extension for Premiere Pro and After Effects.
Syncs system folders with project bins, auto-importing new media files.
Price: $40 USD. License: 2 machines per user.

---

## UI Architecture (from video analysis)

### 1. Main Panel (always visible in Premiere Pro)
Compact floating/docked panel with:
- **Title bar**: "Watchtower" + hamburger menu (three lines)
- **3 action buttons** in a row:
  - **Eye icon** (toggle) - Auto Sync on/off. Blue when active, grey when off. Animated ring when toggling.
  - **Sync icon** (circular arrows) - Manual sync trigger
  - **Folder icon** - Opens Watch Folders panel
- **Progress bar** - thin line next to the buttons, shows import progress
- **Right-click context menu**: shows version ("Watchtower 1.5.0") and "Settings" option

### 2. Watch Folders Panel (modal dialog)
Full-width modal with table layout:
- **Header**: "Watch Folders" title, search field ("Search by name..."), filter dropdown ("All projects"/"MAIN"/"...")
- **Drag & drop zone**: "Drag and drop to add watch folders" message when empty
- **Table columns**:
  - **Name** (bin name in Premiere)
  - **Path** (filesystem path, clickable to change)
  - **STATE** indicator: online (green)/offline (red)/new
  - **SUB** checkbox - import subfolders
  - **RP** checkbox - relative path
  - **SEQ** checkbox - image sequence import
  - **FLT** checkbox - flatten subfolders
  - **LABEL** dropdown - color label selector (None, Violet, Iris, Caribbean, Lavender, Cerulean, Forest, Rose, Mango, Red, Blue, Cyan, Magenta, Tan, Green, Brown, Yellow)
- **Footer**: Cancel / OK buttons
- **Supports drag & drop** of folders from file manager AND bins from Premiere's project panel (shows link icon)

### 3. Settings Dialog (modal, 3 tabs)

#### Tab: General
- [ ] Show import options (for PSD, AI files)
- [ ] Add import date (metadata, Premiere Pro only)
- [x] Show notifications

#### Tab: Allowed Files
- Search field
- "ALLOWED EXTENSIONS" list with Add button
- Scrollable list of extensions (.dcr, .dfxp, .dib, .dif, .dng, .dpx, .dv, ...)

#### Tab: Ignored Folders
- Search field
- "IGNORED FOLDER NAMES" list with Add button
- Supports **regex** (e.g., `/\.download$/`)
- Default entries: "New folder", "untitled folder"

---

## Feature Breakdown

### Core Features
| Feature | Description | Complexity |
|---------|-------------|------------|
| **Folder Watching** | Monitor filesystem folders for changes | Medium |
| **Auto Sync** | Automatically import new files when detected | Medium |
| **Manual Sync** | One-click sync all watched folders | Low |
| **Progress Bar** | Visual feedback during import | Low |
| **Notifications** | Toast notifications on import complete | Low |

### Folder Management
| Feature | Description | Complexity |
|---------|-------------|------------|
| **Add via drag & drop** | Drag folders from Explorer/Finder onto panel | Medium |
| **Link existing bins** | Drag bins from Premiere onto panel, auto-detect path from files inside | High |
| **Folder state tracking** | Online/offline/new status | Medium |
| **Path editing** | Click path to change/fix broken links | Low |
| **Search & filter** | Search by name, filter by project | Low |

### Per-Folder Settings (checkboxes)
| Setting | Description | Complexity |
|---------|-------------|------------|
| **SUB** (Subfolders) | Import files from subfolders, creating matching bin hierarchy | Medium |
| **RP** (Relative Path) | Store path relative to .prproj location for portability | Low |
| **SEQ** (Image Sequence) | Detect and import image sequences as single items | High |
| **FLT** (Flatten) | Import all files from subfolders into single bin | Medium |

### Smart Detection
| Feature | Description | Complexity |
|---------|-------------|------------|
| **Camera card detection** | Detect RED, P2, Panasonic, ARRI folder structures | High |
| **Auto-enable FLT** | Automatically enable flatten for camera cards | Medium |
| **Image sequence detection** | Auto-enable SEQ when sequences found in folder | Medium |
| **Span media handling** | Import spanned clips without duplicates | High |
| **Wait for file write** | Don't import partially written/downloaded files | Medium |

### Labeling & Metadata
| Feature | Description | Complexity |
|---------|-------------|------------|
| **Color labels** | Assign Premiere label color per watch folder | Low |
| **Import date metadata** | Write import datetime to clip metadata (sortable format) | Medium |

### Global Settings
| Feature | Description | Complexity |
|---------|-------------|------------|
| **Allowed extensions** | Whitelist of importable file types | Low |
| **Ignored folders** | Blacklist folder names (supports regex) | Low-Medium |
| **Import options** | Show PSD/AI import dialogs | Low |

---

## Technical Architecture Assessment

### Platform: CEP (Common Extensibility Platform)
Based on the UI style (native-looking dark theme, modal dialogs) and Premiere Pro 2020+ support,
this is almost certainly a **CEP extension** (not UXP, which has limited Premiere Pro support as of 2025).

### Stack (estimated)
```
+---------------------------+
|    UI Layer (HTML/CSS/JS) |  <-- CEP Panel (Chromium-based)
|    - Main panel           |
|    - Watch Folders dialog |
|    - Settings dialog      |
+---------------------------+
|    Node.js Runtime        |  <-- CEP provides Node.js access
|    - fs.watch / chokidar  |      for filesystem operations
|    - File state tracking  |
|    - Config persistence   |
+---------------------------+
|    ExtendScript Bridge    |  <-- CSInterface.evalScript()
|    - app.project.importFiles()
|    - Bin creation/management
|    - Label assignment
|    - Metadata writing
+---------------------------+
|    Premiere Pro Host      |
+---------------------------+
```

### Key Technical Challenges
1. **File watcher reliability** - fs.watch is notoriously unreliable cross-platform; likely uses chokidar or custom polling
2. **"Wait for file write"** - Detecting when a file is fully written (not mid-copy/download). Likely polls file size stability.
3. **Image sequence detection** - Pattern matching filenames (e.g., img_0001.png, img_0002.png, ...)
4. **Camera card structures** - Hardcoded knowledge of RED (.R3D in subdirs), P2 (CONTENTS/VIDEO), ARRI (Clips/), Panasonic folder layouts
5. **Span media deduplication** - Understanding clip spanning across multiple cards
6. **ExtendScript limitations** - Old ES3-based scripting, synchronous, limited error handling
7. **Drag & drop from Premiere** - Intercepting bin drag events requires CEP event listeners

---

## Effort Estimate for Watchdog (our clone)

### MVP (4-6 weeks for 1 developer)
- Main panel with sync button and auto-sync toggle
- Watch Folders panel with add/remove
- Basic folder watching (new files)
- Import into corresponding bins
- SUB checkbox (subfolders)
- Progress bar
- Allowed file extensions filter

### V1.0 (8-12 weeks)
- All MVP features +
- RP (relative paths)
- SEQ (image sequences)
- FLT (flatten)
- Color labels
- Ignored folders with regex
- Drag & drop from file manager
- Settings persistence per project
- Notifications

### V1.5 (16-20 weeks)
- All V1.0 features +
- Camera card auto-detection
- Span media handling
- Link existing bins (drag from Premiere)
- Import date metadata
- Wait for file write completion
- Show import options for PSD/AI

### Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|
| CEP deprecation by Adobe | Medium | Monitor UXP progress, design with migration in mind |
| ExtendScript API limitations | Low | Well-documented, stable API |
| Cross-platform file watching | Medium | Use chokidar, extensive testing |
| Image sequence edge cases | High | Thorough pattern matching, user overrides |
| Camera card format changes | Low | Modular detection, easy to extend |
