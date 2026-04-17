/*
 * SheepDog — Bridge module
 * Single entry point for all ExtendScript communication (DRY).
 * Wraps CSInterface.evalScript in Promises with JSON parsing.
 */

var Bridge = (function () {
  "use strict";

  var cs = new CSInterface();

  /**
   * Call an ExtendScript function with JSON args.
   * @param {string} fn - Function name in host.jsx
   * @param {Object} [args] - Arguments (will be JSON-stringified)
   * @returns {Promise<*>} Parsed result
   */
  function call(fn, args) {
    return new Promise(function (resolve, reject) {
      var script;
      if (args !== undefined) {
        var json = JSON.stringify(args).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        script = fn + "('" + json + "')";
      } else {
        script = fn + "()";
      }

      cs.evalScript(script, function (result) {
        if (result === "EvalScript error." || result === "undefined") {
          reject(new Error("ExtendScript error in " + fn));
          return;
        }
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          // Not JSON — return raw string
          resolve(result);
        }
      });
    });
  }

  // --- Public API ---

  return {
    /**
     * Import files into a Premiere bin.
     * @param {string[]} paths - Absolute file paths
     * @param {string} binPath - Slash-separated bin path (e.g. "Footage/Day1")
     * @returns {Promise<{success: boolean, imported: number, error?: string}>}
     */
    importFiles: function (paths, binPath) {
      return call("importFilesToBin", { paths: paths, binPath: binPath });
    },

    /**
     * Create a bin (folder) in the project.
     * @param {string} name - Bin name
     * @param {string} [parentPath] - Parent bin path
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    createBin: function (name, parentPath) {
      return call("createBin", { name: name, parentPath: parentPath || "" });
    },

    /**
     * Get the current project file path.
     * @returns {Promise<string>}
     */
    getProjectPath: function () {
      return call("getProjectPath");
    },

    /**
     * Get root bin name.
     * @returns {Promise<string>}
     */
    getRootBinName: function () {
      return call("getRootBinName");
    },

    /**
     * Remove a file from a Premiere bin (Mirror Deletions).
     * @param {string} filePath - Absolute file path
     * @param {string} binPath - Target bin path
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    removeFile: function (filePath, binPath) {
      return call("removeFileFromBin", { filePath: filePath, binPath: binPath });
    },

    /**
     * Filter out files already imported in the project (dedupe by mediaPath).
     * @param {string[]} paths - Absolute file paths to check
     * @returns {Promise<{newPaths: string[]}>}
     */
    dedupeFiles: function (paths) {
      return call("dedupeFiles", { paths: paths });
    },

    /**
     * Flatten a bin: move all sub-bin files into root bin, remove empty sub-bins.
     * Timeline references preserved (moveBin, not re-import).
     * @param {string} binPath - Target bin path
     * @returns {Promise<{success: boolean, moved: number, error?: string}>}
     */
    flattenBin: function (binPath) {
      return call("flattenBin", { binPath: binPath });
    },

    /**
     * Unflatten a bin: move files back into sub-bins based on disk path.
     * Timeline references preserved (moveBin, not re-import).
     * @param {string} binPath - Target bin path
     * @param {string} watchFolderPath - Absolute path to watch folder on disk
     * @returns {Promise<{success: boolean, moved: number, error?: string}>}
     */
    unflattenBin: function (binPath, watchFolderPath) {
      return call("unflattenBin", { binPath: binPath, watchFolderPath: watchFolderPath });
    },

    /**
     * Health check.
     * @returns {Promise<string>} "ok" if connected
     */
    ping: function () {
      return call("ping");
    },

    /**
     * Environment self-check. Returns parsed diagnose() result.
     * Use at panel startup to detect broken ExtendScript state.
     * @returns {Promise<{jsonOk, appOk, projectOk, rootItemOk, binApiOk, importApiOk, ok}>}
     */
    diagnose: function () {
      return call("diagnose").then(function (raw) {
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
