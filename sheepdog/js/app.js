/*
 * SheepDog — Main application entry point
 * Connects UI to modules. No business logic here (SRP).
 */

(function () {
  "use strict";

  var path = typeof require !== "undefined" ? require("path") : null;
  var fs = typeof require !== "undefined" ? require("fs") : null;

  // --- DOM references ---
  var btnSync = document.getElementById("btn-sync");
  var toggleMirror = document.getElementById("toggle-mirror");
  var toggleAuto = document.getElementById("toggle-auto");
  var btnAddFolder = document.getElementById("btn-add-folder");
  var foldersContainer = document.getElementById("folders");
  var emptyState = document.getElementById("empty-state");
  var progressSection = document.getElementById("progress-section");
  var progressFill = document.getElementById("progress-fill");
  var progressText = document.getElementById("progress-text");
  var statusEl = document.getElementById("status");

  // --- Project directory (derived from .prproj path) ---
  var projectDir = null;

  // --- Status ---
  function setStatus(text) {
    statusEl.textContent = text;
  }

  // --- Progress ---
  function showProgress(done, total) {
    progressSection.classList.remove("hidden");
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    progressFill.style.width = pct + "%";
    progressText.textContent = "Importing " + done + "/" + total + "...";
  }

  function hideProgress() {
    progressSection.classList.add("hidden");
    progressFill.style.width = "0%";
  }

  // --- Folder list rendering ---
  function renderFolders() {
    var folders = FolderManager.getAll();
    foldersContainer.innerHTML = "";

    if (folders.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }
    emptyState.classList.add("hidden");

    folders.forEach(function (folder) {
      var item = document.createElement("div");
      item.className = "folder-item";

      var toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.className = "folder-toggle";
      toggle.checked = folder.enabled;
      toggle.addEventListener("change", function () {
        FolderManager.update(folder.id, { enabled: toggle.checked });
        if (toggle.checked) {
          Watcher.addFolder(FolderManager.getById(folder.id));
        } else {
          Watcher.removeFolder(folder.id);
        }
        updateStatus();
      });

      var pathEl = document.createElement("span");
      pathEl.className = "folder-path";
      pathEl.textContent = folder.path;
      pathEl.title = folder.path;

      var bin = document.createElement("span");
      bin.className = "folder-bin";
      bin.textContent = "\u2192 " + folder.targetBin;

      var flattenLabel = document.createElement("label");
      flattenLabel.className = "folder-flatten";
      flattenLabel.title = "Flatten: all subfolder files go into one bin";
      var flattenCheck = document.createElement("input");
      flattenCheck.type = "checkbox";
      flattenCheck.checked = folder.flatten || false;
      flattenCheck.addEventListener("change", function () {
        FolderManager.update(folder.id, { flatten: flattenCheck.checked });
      });
      var flattenText = document.createElement("span");
      flattenText.textContent = "Flat";
      flattenLabel.appendChild(flattenCheck);
      flattenLabel.appendChild(flattenText);

      var removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-danger";
      removeBtn.textContent = "\u00d7";
      removeBtn.addEventListener("click", function () {
        Watcher.removeFolder(folder.id);
        FolderManager.remove(folder.id);
        renderFolders();
      });

      item.appendChild(toggle);
      item.appendChild(pathEl);
      item.appendChild(bin);
      item.appendChild(flattenLabel);
      item.appendChild(removeBtn);
      foldersContainer.appendChild(item);
    });

    updateStatus();
  }

  function updateStatus() {
    var enabled = FolderManager.getEnabled().length;
    if (enabled > 0) {
      setStatus("Watching " + enabled + " folder" + (enabled > 1 ? "s" : ""));
    } else {
      setStatus("Ready");
    }
  }

  // --- Sync All: scan existing files and import ---
  function syncAll() {
    var folders = FolderManager.getEnabled();
    if (folders.length === 0) {
      setStatus("No folders to sync");
      return;
    }

    setStatus("Scanning folders...");
    Watcher.clearSeen();

    folders.forEach(function (folder) {
      scanFolder(folder.path, folder, folder.subfolders);
    });

    var queueLen = Importer.queueLength();
    if (queueLen === 0) {
      setStatus("All synced — no new files");
      return;
    }

    Importer.flush();
  }

  /**
   * Recursively scan a folder and enqueue files.
   */
  function scanFolder(dirPath, folderConfig, recurse) {
    if (!fs) return;
    try {
      var entries = fs.readdirSync(dirPath);
      entries.forEach(function (entry) {
        var fullPath = path.join(dirPath, entry);
        try {
          var stat = fs.statSync(fullPath);
          if (stat.isFile()) {
            Importer.enqueue(fullPath, folderConfig);
          } else if (stat.isDirectory() && recurse) {
            scanFolder(fullPath, folderConfig, true);
          }
        } catch (e) {
          // Skip inaccessible entries
        }
      });
    } catch (e) {
      console.error("[App] Failed to scan " + dirPath + ":", e.message);
    }
  }

  // --- Wire up Importer callbacks ---
  Importer.onProgress(function (progress) {
    showProgress(progress.done, progress.total);
  });

  Importer.onComplete(function (result) {
    hideProgress();
    setStatus("Imported " + result.imported + " file" + (result.imported !== 1 ? "s" : "") +
      (result.errors > 0 ? " (" + result.errors + " failed)" : ""));
  });

  // --- Wire up Watcher → Importer ---
  Watcher.onFileDetected(function (event) {
    Importer.enqueue(event.filePath, event.folderConfig);

    // Auto-flush after a short debounce
    clearTimeout(Watcher._flushTimer);
    Watcher._flushTimer = setTimeout(function () {
      Importer.flush();
    }, 1000);
  });

  // --- Wire up Watcher → Mirror Deletions ---
  Watcher.onFileDeleted(function (event) {
    if (!SettingsManager.get("mirrorDeletions")) return;

    var binPath = event.folderConfig.targetBin;
    if (event.folderConfig.subfolders && !event.folderConfig.flatten) {
      var fileDir = path.dirname(event.filePath);
      var relDir = path.relative(event.folderConfig.path, fileDir);
      if (relDir && relDir !== ".") {
        binPath = event.folderConfig.targetBin + "/" + relDir.replace(/\\/g, "/");
      }
    }

    Bridge.removeFile(event.filePath, binPath).then(function (result) {
      if (result.success) {
        setStatus("Mirrored deletion: " + path.basename(event.filePath));
      }
    }).catch(function (err) {
      console.error("[App] Mirror deletion failed:", err.message);
    });
  });

  // --- Startup ---
  function init() {
    setStatus("Initializing...");

    Bridge.ping().then(function (result) {
      if (result !== "ok") {
        setStatus("Panel loaded (standalone mode)");
        renderFolders();
        return;
      }

      // Get project path to initialize persistence
      return Bridge.getProjectPath().then(function (projPath) {
        if (projPath && path) {
          projectDir = path.dirname(projPath);
          SettingsManager.init(projectDir);
          FolderManager.init(projectDir);

          // Apply settings
          Importer.setAllowedExtensions(SettingsManager.get("allowedExtensions"));
          toggleAuto.checked = SettingsManager.get("autoSync");
          toggleMirror.checked = SettingsManager.get("mirrorDeletions");

          // Start watchers if autoSync was on
          if (SettingsManager.get("autoSync")) {
            Watcher.start(FolderManager.getEnabled());
          }
        }

        setStatus("Connected to Premiere Pro");
        renderFolders();
      });
    }).catch(function () {
      setStatus("Panel loaded (standalone mode)");
      renderFolders();
    });
  }

  // --- UI Event handlers ---
  btnSync.addEventListener("click", function () {
    syncAll();
  });

  toggleAuto.addEventListener("change", function () {
    var isOn = toggleAuto.checked;
    SettingsManager.set("autoSync", isOn);

    if (isOn) {
      Watcher.start(FolderManager.getEnabled());
      setStatus("Auto Sync ON — watching " + FolderManager.getEnabled().length + " folders");
    } else {
      Watcher.stop();
      setStatus("Auto Sync OFF");
    }
  });

  toggleMirror.addEventListener("change", function () {
    SettingsManager.set("mirrorDeletions", toggleMirror.checked);
    setStatus(toggleMirror.checked ? "Mirror Deletions ON" : "Mirror Deletions OFF");
  });

  btnAddFolder.addEventListener("click", function () {
    var folderPath = prompt("Enter folder path to watch:");
    if (!folderPath) return;

    // Validate path exists
    if (fs && !fs.existsSync(folderPath)) {
      alert("Folder not found: " + folderPath);
      return;
    }

    var folder = FolderManager.add(folderPath);

    // Start watching if autoSync is on
    if (toggleAuto.checked) {
      Watcher.addFolder(folder);
    }

    renderFolders();
  });

  // --- Drag & Drop ---
  var dropOverlay = document.getElementById("drop-overlay");
  var dragCounter = 0; // Track enter/leave across child elements

  function addDroppedFolder(folderPath) {
    if (fs && !fs.existsSync(folderPath)) return;
    if (fs && !fs.statSync(folderPath).isDirectory()) return;

    // Skip if already watched
    var existing = FolderManager.getAll();
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].path === folderPath) {
        setStatus("Already watching: " + path.basename(folderPath));
        return;
      }
    }

    var folder = FolderManager.add(folderPath);
    if (toggleAuto.checked) {
      Watcher.addFolder(folder);
    }
    renderFolders();
  }

  document.addEventListener("dragenter", function (e) {
    e.preventDefault();
    dragCounter++;
    dropOverlay.classList.remove("hidden");
  });

  document.addEventListener("dragleave", function (e) {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      dropOverlay.classList.add("hidden");
    }
  });

  document.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });

  document.addEventListener("drop", function (e) {
    e.preventDefault();
    dragCounter = 0;
    dropOverlay.classList.add("hidden");

    var files = e.dataTransfer.files;
    var added = 0;
    for (var i = 0; i < files.length; i++) {
      var filePath = files[i].path;
      if (filePath && fs && fs.statSync(filePath).isDirectory()) {
        addDroppedFolder(filePath);
        added++;
      }
    }

    if (added === 0) {
      setStatus("Drop a folder, not files");
    }
  });

  // --- Init ---
  init();
})();
