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
     * Health check.
     * @returns {Promise<string>} "ok" if connected
     */
    ping: function () {
      return call("ping");
    },
  };
})();
