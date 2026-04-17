/*
 * SheepDog — Importer module
 * Responsibility: Filter by extension + batch import via Bridge (SRP)
 * Defense in Depth: Extension filter here AND in Watcher.
 */

var Importer = (function () {
  "use strict";

  var path = require("path");

  // Default allowed extensions
  var DEFAULT_EXTENSIONS = [
    ".mp4", ".mov", ".mxf", ".avi", ".mkv", ".wmv", ".m4v",
    ".wav", ".mp3", ".aif", ".aiff", ".m4a", ".flac",
    ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".gif",
    ".psd", ".ai", ".exr", ".dpx", ".tga",
  ];

  // Queue: { filePath, binPath }
  var queue = [];

  // Allowed extensions (will be set from SettingsManager)
  var allowedExtensions = DEFAULT_EXTENSIONS.slice();

  // Callbacks
  var progressCallback = null;
  var completeCallback = null;

  // Import state
  var importing = false;

  /**
   * Check if a file extension is allowed.
   * @param {string} filePath
   * @returns {boolean}
   */
  function isAllowed(filePath) {
    var ext = path.extname(filePath).toLowerCase();
    return allowedExtensions.indexOf(ext) !== -1;
  }

  // --- Public API ---

  return {
    DEFAULT_EXTENSIONS: DEFAULT_EXTENSIONS,

    /**
     * Set allowed extensions list.
     * @param {string[]} extensions - e.g. [".mp4", ".mov"]
     */
    setAllowedExtensions: function (extensions) {
      allowedExtensions = extensions.map(function (e) {
        return e.toLowerCase();
      });
    },

    /**
     * Check if a file passes the extension filter.
     * Exposed for Watcher to do early rejection (Defense in Depth).
     * @param {string} filePath
     * @returns {boolean}
     */
    isAllowed: isAllowed,

    /**
     * Add a file to the import queue.
     * @param {string} filePath - Absolute file path
     * @param {Object} folderConfig - { targetBin, ... }
     */
    enqueue: function (filePath, folderConfig) {
      // Defense in Depth: filter again here
      if (!isAllowed(filePath)) return;

      // Compute bin path: targetBin + relative subfolder path
      // Flatten mode: all files go to root targetBin regardless of subfolder
      var binPath = folderConfig.targetBin;
      if (folderConfig.subfolders && !folderConfig.flatten) {
        var fileDir = path.dirname(filePath);
        var relDir = path.relative(folderConfig.path, fileDir);
        if (relDir && relDir !== ".") {
          binPath = folderConfig.targetBin + "/" + relDir.replace(/\\/g, "/");
        }
      }

      queue.push({
        filePath: filePath,
        binPath: binPath,
      });
    },

    /**
     * Import all queued files in batches, grouped by target bin.
     * @returns {Promise<{imported: number, errors: number}>}
     */
    flush: function () {
      if (importing || queue.length === 0) {
        return Promise.resolve({ imported: 0, errors: 0 });
      }

      importing = true;
      var items = queue.splice(0); // Take all and clear queue
      var total = items.length;
      var imported = 0;
      var errors = 0;

      // Group by binPath for batch import
      var groups = {};
      items.forEach(function (item) {
        if (!groups[item.binPath]) groups[item.binPath] = [];
        groups[item.binPath].push(item.filePath);
      });

      var binPaths = Object.keys(groups);
      var index = 0;

      function importNext() {
        if (index >= binPaths.length) {
          importing = false;
          if (completeCallback) completeCallback({ imported: imported, errors: errors });
          return Promise.resolve({ imported: imported, errors: errors });
        }

        var bin = binPaths[index];
        var paths = groups[bin];
        index++;

        // Dedupe is built into importFilesToBin (ExtendScript side)
        return Bridge.importFiles(paths, bin)
          .then(function (result) {
            if (result.success) {
              imported += result.imported;
            } else {
              errors += paths.length;
              console.error("[Importer] Failed to import to bin " + bin + ":", result.error);
            }

            if (progressCallback) {
              progressCallback({ done: imported + errors, total: total });
            }

            return importNext();
          })
          .catch(function (err) {
            errors += paths.length;
            console.error("[Importer] Bridge error:", err.message);

            if (progressCallback) {
              progressCallback({ done: imported + errors, total: total });
            }

            return importNext();
          });
      }

      if (progressCallback) progressCallback({ done: 0, total: total });
      return importNext();
    },

    /**
     * Get current queue length.
     * @returns {number}
     */
    queueLength: function () {
      return queue.length;
    },

    /**
     * Register progress callback.
     * @param {Function} cb - callback({done: number, total: number})
     */
    onProgress: function (cb) {
      progressCallback = cb;
    },

    /**
     * Register completion callback.
     * @param {Function} cb - callback({imported: number, errors: number})
     */
    onComplete: function (cb) {
      completeCallback = cb;
    },
  };
})();
