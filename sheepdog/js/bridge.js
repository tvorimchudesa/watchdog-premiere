/*
 * SheepDog — Bridge module
 * Single entry point for all ExtendScript communication (DRY).
 * Wraps CSInterface.evalScript in Promises with JSON parsing.
 * Every call supports per-call timeout + cancel token (defense in depth).
 */

var Bridge = (function () {
  "use strict";

  var cs = new CSInterface();

  var DEFAULT_TIMEOUT_MS = 30000;
  var defaultTimeoutMs = DEFAULT_TIMEOUT_MS;

  /**
   * Create a cancel token. Caller holds it, Bridge observes it.
   * token.cancel() rejects the in-flight call immediately on JS side.
   * ExtendScript keeps running — we just stop waiting for it.
   */
  function createCancelToken() {
    var token = {
      cancelled: false,
      _handler: null,
      cancel: function () {
        if (token.cancelled) return;
        token.cancelled = true;
        if (typeof token._handler === "function") token._handler();
      },
    };
    return token;
  }

  /**
   * Call an ExtendScript function with JSON args.
   * @param {string} fn
   * @param {Object} [args]
   * @param {{timeout?: number, cancelToken?: object}} [options]
   * @returns {Promise<*>}
   */
  function call(fn, args, options) {
    options = options || {};
    var timeoutMs = typeof options.timeout === "number" ? options.timeout : defaultTimeoutMs;
    var cancelToken = options.cancelToken || null;

    return new Promise(function (resolve, reject) {
      var script;
      if (args !== undefined) {
        var json = JSON.stringify(args).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        script = fn + "('" + json + "')";
      } else {
        script = fn + "()";
      }

      var settled = false;

      var timeoutId = setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error("BRIDGE_TIMEOUT: " + fn + " did not respond within " + timeoutMs + "ms"));
      }, timeoutMs);

      if (cancelToken) {
        if (cancelToken.cancelled) {
          settled = true;
          clearTimeout(timeoutId);
          reject(new Error("CANCELLED: " + fn + " cancelled by user"));
          return;
        }
        cancelToken._handler = function () {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          reject(new Error("CANCELLED: " + fn + " cancelled by user"));
        };
      }

      cs.evalScript(script, function (result) {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);

        if (result === "EvalScript error." || result === "undefined") {
          reject(new Error("ExtendScript error in " + fn));
          return;
        }
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          resolve(result);
        }
      });
    });
  }

  // --- Public API ---

  return {
    /**
     * Configure the default timeout (ms) for all Bridge calls.
     * API-level sanity floor 100ms (prevents NaN / zero / negative).
     * UI-level bounds (5000-120000) are enforced in the Settings dialog.
     * @param {number} ms
     */
    setDefaultTimeout: function (ms) {
      if (typeof ms !== "number" || !isFinite(ms)) return;
      if (ms < 100) ms = 100;
      if (ms > 600000) ms = 600000;
      defaultTimeoutMs = ms;
    },

    /**
     * Get current default timeout (ms).
     * @returns {number}
     */
    getDefaultTimeout: function () {
      return defaultTimeoutMs;
    },

    /**
     * Create a cancel token. Pass via options.cancelToken on any call.
     * Call token.cancel() to abort the in-flight call.
     * @returns {{cancelled: boolean, cancel: Function}}
     */
    createCancelToken: createCancelToken,

    importFiles: function (paths, binPath, options) {
      return call("importFilesToBin", { paths: paths, binPath: binPath }, options);
    },

    createBin: function (name, parentPath, options) {
      return call("createBin", { name: name, parentPath: parentPath || "" }, options);
    },

    getProjectPath: function (options) {
      return call("getProjectPath", undefined, options);
    },

    getRootBinName: function (options) {
      return call("getRootBinName", undefined, options);
    },

    removeFile: function (filePath, binPath, options) {
      return call("removeFileFromBin", { filePath: filePath, binPath: binPath }, options);
    },

    dedupeFiles: function (paths, options) {
      return call("dedupeFiles", { paths: paths }, options);
    },

    flattenBin: function (binPath, options) {
      return call("flattenBin", { binPath: binPath }, options);
    },

    unflattenBin: function (binPath, watchFolderPath, options) {
      return call("unflattenBin", { binPath: binPath, watchFolderPath: watchFolderPath }, options);
    },

    ping: function (options) {
      return call("ping", undefined, options);
    },

    diagnose: function (options) {
      return call("diagnose", undefined, options).then(function (raw) {
        var out = { ok: true };
        var parts = String(raw).split(";");
        for (var i = 0; i < parts.length; i++) {
          var kv = parts[i].split("=");
          if (kv.length === 2 && kv[0]) {
            var key = kv[0], val = kv[1];
            out[key] = val === "1" ? true : (val === "0" ? false : val);
            if (val === "0") out.ok = false;
          }
        }
        return out;
      });
    },
  };
})();
