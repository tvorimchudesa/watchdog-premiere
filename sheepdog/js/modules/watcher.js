/*
 * SheepDog — Watcher module
 * Responsibility: Detect new files in watch folders (SRP)
 * Uses chokidar for reliable cross-platform file watching.
 */

var Watcher = (function () {
  "use strict";

  var chokidar = require("chokidar");
  var path = require("path");

  // Active chokidar watchers keyed by folder ID
  var watchers = {};

  // Set of already-seen file paths (avoid duplicate imports)
  var seen = {};

  // Callbacks
  var onDetectCallback = null;
  var onDeleteCallback = null;

  // Temp file patterns to ignore
  var TEMP_PATTERNS = /(?:\.tmp|\.part|\.crdownload|~$|\.swp|\.lock)$/i;

  /**
   * Register callback for file detection.
   * @param {Function} cb - callback({filePath: string, folderConfig: Object})
   */
  function onFileDetected(cb) {
    onDetectCallback = cb;
  }

  /**
   * Start watching a single folder.
   * @param {Object} folderConfig - { id, path, subfolders, targetBin, enabled }
   */
  function watchFolder(folderConfig) {
    if (watchers[folderConfig.id]) {
      // Already watching — stop first
      stopFolder(folderConfig.id);
    }

    var watchPath = folderConfig.subfolders
      ? path.join(folderConfig.path, "**", "*")
      : path.join(folderConfig.path, "*");

    var watcher = chokidar.watch(watchPath, {
      ignored: TEMP_PATTERNS,
      persistent: true,
      ignoreInitial: true, // Don't fire for existing files on start
      awaitWriteFinish: {
        stabilityThreshold: 2000, // Wait 2s after last change
        pollInterval: 500,
      },
      depth: folderConfig.subfolders ? undefined : 0,
    });

    watcher.on("add", function (filePath) {
      // Normalize path for consistent dedup
      var normalized = path.normalize(filePath);

      // Skip if already seen
      if (seen[normalized]) return;
      seen[normalized] = true;

      // Skip temp files (Defense in Depth — chokidar ignored + our check)
      if (TEMP_PATTERNS.test(normalized)) return;

      if (onDetectCallback) {
        onDetectCallback({
          filePath: normalized,
          folderConfig: folderConfig,
        });
      }
    });

    watcher.on("unlink", function (filePath) {
      var normalized = path.normalize(filePath);
      delete seen[normalized];

      if (onDeleteCallback) {
        onDeleteCallback({
          filePath: normalized,
          folderConfig: folderConfig,
        });
      }
    });

    watcher.on("error", function (err) {
      console.error("[Watcher] Error on folder " + folderConfig.path + ":", err.message);
    });

    watchers[folderConfig.id] = watcher;
  }

  /**
   * Stop watching a single folder.
   * @param {string} folderId
   */
  function stopFolder(folderId) {
    if (watchers[folderId]) {
      watchers[folderId].close();
      delete watchers[folderId];
    }
  }

  // --- Public API ---

  return {
    onFileDetected: onFileDetected,

    /**
     * Register callback for file deletion.
     * @param {Function} cb - callback({filePath: string, folderConfig: Object})
     */
    onFileDeleted: function (cb) {
      onDeleteCallback = cb;
    },

    /**
     * Start watching all provided folders.
     * @param {Array} folders - array of folder configs
     */
    start: function (folders) {
      folders.forEach(function (folder) {
        if (folder.enabled) {
          watchFolder(folder);
        }
      });
    },

    /**
     * Stop all watchers.
     */
    stop: function () {
      Object.keys(watchers).forEach(function (id) {
        stopFolder(id);
      });
    },

    /**
     * Add a single folder to watch.
     * @param {Object} folderConfig
     */
    addFolder: function (folderConfig) {
      if (folderConfig.enabled) {
        watchFolder(folderConfig);
      }
    },

    /**
     * Remove a single folder from watching.
     * @param {string} folderId
     */
    removeFolder: function (folderId) {
      stopFolder(folderId);
    },

    /**
     * Clear the seen-files cache (used before manual Sync All).
     */
    clearSeen: function () {
      seen = {};
    },

    /**
     * Check if any watchers are active.
     * @returns {boolean}
     */
    isWatching: function () {
      return Object.keys(watchers).length > 0;
    },
  };
})();
