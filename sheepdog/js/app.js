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

      // Safety-cover for Flatten: locked → unlocked → active
      var flatCover = document.createElement("div");
      flatCover.className = "safety-cover";
      flatCover.title = "Flatten: move all subfolder files into one bin (click twice to activate)";
      flatCover.setAttribute("data-state", folder.flatten ? "active" : "locked");
      var flatBox = document.createElement("div");
      flatBox.className = "safety-box";
      var flatLabel = document.createElement("span");
      flatLabel.className = "safety-label";
      flatLabel.textContent = "Flat";
      flatCover.appendChild(flatBox);
      flatCover.appendChild(flatLabel);

      (function (fc, folderId, folderPath, targetBin) {
        fc.addEventListener("click", function () {
          var state = fc.getAttribute("data-state");

          if (state === "locked") {
            // locked → unlocked (cover open, not yet active)
            fc.setAttribute("data-state", "unlocked");
          } else if (state === "unlocked") {
            // unlocked → active: flatten the bin
            setStatus("Flattening " + targetBin + "...");
            Bridge.flattenBin(targetBin).then(function (result) {
              if (result.success) {
                fc.setAttribute("data-state", "active");
                FolderManager.update(folderId, { flatten: true });
                setStatus("Flattened \u2014 moved " + result.moved + " file" + (result.moved !== 1 ? "s" : ""));
              } else {
                fc.setAttribute("data-state", "locked");
                setStatus("Flatten failed: " + (result.error || "unknown"));
              }
            }).catch(function (err) {
              fc.setAttribute("data-state", "locked");
              setStatus("Flatten error: " + err.message);
            });
          } else if (state === "active") {
            // active → locked: unflatten (restore sub-bins)
            fc.setAttribute("data-state", "unlocked");
            // Second click on unlocked confirms unflatten
            var confirmUnflatten = function () {
              fc.removeEventListener("click", confirmUnflatten);
            };
            // Actually, go straight to unflatten for simplicity:
            setStatus("Unflattening " + targetBin + "...");
            Bridge.unflattenBin(targetBin, folderPath).then(function (result) {
              if (result.success) {
                fc.setAttribute("data-state", "locked");
                FolderManager.update(folderId, { flatten: false });
                setStatus("Unflattened \u2014 moved " + result.moved + " file" + (result.moved !== 1 ? "s" : ""));
              } else {
                fc.setAttribute("data-state", "active");
                setStatus("Unflatten failed: " + (result.error || "unknown"));
              }
            }).catch(function (err) {
              fc.setAttribute("data-state", "active");
              setStatus("Unflatten error: " + err.message);
            });
          }
        });
      })(flatCover, folder.id, folder.path, folder.targetBin);

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
      item.appendChild(flatCover);
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
   * Initial scan for a single folder. Used when a folder is newly added
   * while Auto Sync is ON — matches user mental model of "auto means auto".
   * Dedupe on the ExtendScript side prevents duplicate imports.
   */
  function syncFolder(folder) {
    if (!folder || !folder.enabled) return;
    setStatus("Scanning " + (path ? path.basename(folder.path) : folder.path) + "...");
    scanFolder(folder.path, folder, folder.subfolders);
    if (Importer.queueLength() === 0) {
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
    if (result.imported === 0 && result.errors === 0) {
      setStatus("All synced \u2014 no new files");
    } else {
      setStatus("Imported " + result.imported + " file" + (result.imported !== 1 ? "s" : "") +
        (result.errors > 0 ? " (" + result.errors + " failed)" : ""));
    }
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

      // Startup health check — surface broken ExtendScript state immediately
      // instead of failing silently when user tries to import.
      return Bridge.diagnose().then(function (env) {
        if (!env.ok) {
          var broken = [];
          if (!env.jsonOk) broken.push("JSON");
          if (!env.appOk) broken.push("app");
          if (!env.projectOk) broken.push("no project open");
          if (!env.rootItemOk) broken.push("rootItem");
          if (!env.binApiOk) broken.push("ProjectItemType");
          if (!env.importApiOk) broken.push("importFiles");
          setStatus("ExtendScript broken: " + broken.join(", "));
          console.error("[SheepDog] diagnose failed:", env);
          renderFolders();
          throw new Error("diagnose_failed");
        }

        return Bridge.getProjectPath();
      }).then(function (projPath) {
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
    }).catch(function (err) {
      // Preserve diagnose-specific status; only fall back to standalone
      // for genuine connection errors (ping failure, bridge offline).
      if (!err || err.message !== "diagnose_failed") {
        setStatus("Panel loaded (standalone mode)");
        renderFolders();
      }
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
      // Auto Sync ON means "make the project match the folders" — scan existing
      // content, not just watch for future events. Otherwise user adds 500 files,
      // toggles Auto Sync, sees nothing happen and assumes the tool is broken.
      syncAll();
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

    // Start watching if autoSync is on, then do initial scan of existing files.
    // Without the initial scan, "Auto Sync" only watches future events, which
    // breaks the user's mental model of the label.
    if (toggleAuto.checked) {
      Watcher.addFolder(folder);
      syncFolder(folder);
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
      syncFolder(folder);
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
