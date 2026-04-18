/*
 * SheepDog — Importer module
 * Responsibility: Filter by extension + batch import via Bridge (SRP)
 * Defense in Depth: Extension filter here AND in Watcher.
 * Batch chunking + cancel token + stall hint (§14.5).
 */

var Importer = (function () {
  "use strict";

  var path = require("path");

  var DEFAULT_EXTENSIONS = [
    ".mp4", ".mov", ".mxf", ".avi", ".mkv", ".wmv", ".m4v",
    ".wav", ".mp3", ".aif", ".aiff", ".m4a", ".flac",
    ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".gif",
    ".psd", ".ai", ".exr", ".dpx", ".tga",
  ];

  var DEFAULT_CHUNK_SIZE = 10;
  var DEFAULT_STALL_MS = 10000;

  var queue = [];
  var allowedExtensions = DEFAULT_EXTENSIONS.slice();

  var progressCallback = null;
  var completeCallback = null;
  var stallCallback = null;

  var importing = false;
  var currentCancelToken = null;

  var chunkSize = DEFAULT_CHUNK_SIZE;
  var stallMs = DEFAULT_STALL_MS;

  function isAllowed(filePath) {
    var ext = path.extname(filePath).toLowerCase();
    return allowedExtensions.indexOf(ext) !== -1;
  }

  function chunk(arr, size) {
    var out = [];
    for (var i = 0; i < arr.length; i += size) {
      out.push(arr.slice(i, i + size));
    }
    return out;
  }

  // --- Public API ---

  return {
    DEFAULT_EXTENSIONS: DEFAULT_EXTENSIONS,

    setAllowedExtensions: function (extensions) {
      allowedExtensions = extensions.map(function (e) {
        return e.toLowerCase();
      });
    },

    setChunkSize: function (n) {
      if (typeof n !== "number" || !isFinite(n)) return;
      if (n < 1) n = 1;
      if (n > 100) n = 100;
      chunkSize = n;
    },

    setStallMs: function (ms) {
      if (typeof ms !== "number" || !isFinite(ms)) return;
      if (ms < 1000) ms = 1000;
      stallMs = ms;
    },

    isAllowed: isAllowed,

    enqueue: function (filePath, folderConfig) {
      if (!isAllowed(filePath)) return;

      var binPath = folderConfig.targetBin;
      if (folderConfig.subfolders && !folderConfig.flatten) {
        var fileDir = path.dirname(filePath);
        var relDir = path.relative(folderConfig.path, fileDir);
        if (relDir && relDir !== ".") {
          binPath = folderConfig.targetBin + "/" + relDir.replace(/\\/g, "/");
        }
      }

      queue.push({ filePath: filePath, binPath: binPath });
    },

    /**
     * Flush queue in chunks, grouped by target bin.
     * Progress fires per chunk completion. Cancellable via Importer.cancel().
     * @returns {Promise<{imported: number, skipped: number, errors: number, cancelled: boolean}>}
     */
    flush: function () {
      if (importing || queue.length === 0) {
        return Promise.resolve({ imported: 0, skipped: 0, errors: 0, cancelled: false });
      }

      importing = true;
      currentCancelToken = Bridge.createCancelToken();
      var token = currentCancelToken;

      var items = queue.splice(0);
      var total = items.length;
      var imported = 0;
      var skipped = 0;
      var errors = 0;

      var groups = {};
      items.forEach(function (item) {
        if (!groups[item.binPath]) groups[item.binPath] = [];
        groups[item.binPath].push(item.filePath);
      });

      var tasks = [];
      Object.keys(groups).forEach(function (bin) {
        chunk(groups[bin], chunkSize).forEach(function (batch) {
          tasks.push({ bin: bin, paths: batch });
        });
      });

      var totalChunks = tasks.length;
      var chunkIndex = 0;

      function finish(cancelled) {
        importing = false;
        currentCancelToken = null;
        var result = {
          imported: imported,
          skipped: skipped,
          errors: errors,
          cancelled: !!cancelled,
        };
        if (completeCallback) completeCallback(result);
        return result;
      }

      function runNext() {
        if (token.cancelled) return finish(true);
        if (chunkIndex >= tasks.length) return finish(false);

        var task = tasks[chunkIndex];
        chunkIndex++;

        var stallFired = false;
        var stallTimer = setTimeout(function () {
          stallFired = true;
          if (stallCallback) {
            stallCallback({
              chunkIndex: chunkIndex,
              chunkTotal: totalChunks,
              stuckMs: stallMs,
            });
          }
        }, stallMs);

        return Bridge.importFiles(task.paths, task.bin, { cancelToken: token })
          .then(function (result) {
            clearTimeout(stallTimer);
            if (result && result.success) {
              var got = result.imported || 0;
              var skip = result.skipped || 0;
              imported += got;
              skipped += skip;
              errors += task.paths.length - got - skip;
            } else {
              errors += task.paths.length;
              console.error("[Importer] Chunk failed for bin " + task.bin + ":",
                result && result.error);
            }
            if (progressCallback) {
              progressCallback({
                done: imported + skipped + errors,
                total: total,
                chunkIndex: chunkIndex,
                chunkTotal: totalChunks,
                stalled: stallFired,
              });
            }
            return runNext();
          })
          .catch(function (err) {
            clearTimeout(stallTimer);
            var msg = err && err.message ? err.message : String(err);
            if (msg.indexOf("CANCELLED") === 0) {
              return finish(true);
            }
            errors += task.paths.length;
            console.error("[Importer] Bridge error:", msg);
            if (progressCallback) {
              progressCallback({
                done: imported + skipped + errors,
                total: total,
                chunkIndex: chunkIndex,
                chunkTotal: totalChunks,
                stalled: stallFired,
                error: msg,
              });
            }
            return runNext();
          });
      }

      if (progressCallback) {
        progressCallback({
          done: 0,
          total: total,
          chunkIndex: 0,
          chunkTotal: totalChunks,
          stalled: false,
        });
      }
      return runNext();
    },

    /**
     * Cancel an in-progress flush. Safe to call anytime.
     * Current Bridge call rejects with CANCELLED; remaining chunks skipped.
     */
    cancel: function () {
      if (currentCancelToken) currentCancelToken.cancel();
      queue.length = 0;
    },

    isImporting: function () {
      return importing;
    },

    queueLength: function () {
      return queue.length;
    },

    onProgress: function (cb) { progressCallback = cb; },
    onComplete: function (cb) { completeCallback = cb; },
    onStall: function (cb) { stallCallback = cb; },
  };
})();
