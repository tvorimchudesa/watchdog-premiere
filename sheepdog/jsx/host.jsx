/*
 * SheepDog - ExtendScript host for Premiere Pro
 * ES3 syntax only (ExtendScript = ECMAScript 3)
 * Premiere's ExtendScript has NO native JSON - polyfill below.
 */

if (typeof JSON === "undefined") {
  JSON = {
    parse: function (s) { return eval("(" + s + ")"); },
    stringify: function (o) {
      if (o === null) return "null";
      if (typeof o === "undefined") return "null";
      if (typeof o === "string") {
        return '"' + o.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t") + '"';
      }
      if (typeof o === "number" || typeof o === "boolean") return String(o);
      var parts = [];
      var i;
      if (o instanceof Array || (typeof o.length === "number" && typeof o.splice === "function")) {
        for (i = 0; i < o.length; i++) parts.push(JSON.stringify(o[i]));
        return "[" + parts.join(",") + "]";
      }
      for (var k in o) {
        if (o.hasOwnProperty(k)) parts.push('"' + k + '":' + JSON.stringify(o[k]));
      }
      return "{" + parts.join(",") + "}";
    }
  };
}

/**
 * Import files into a target bin.
 * @param {string} jsonArgs - JSON: { paths: string[], binPath: string }
 * @returns {string} JSON: { success: boolean, imported: number, error?: string }
 */
function importFilesToBin(jsonArgs) {
  try {
    var args = JSON.parse(jsonArgs);
    var paths = args.paths;
    var binPath = args.binPath;

    if (!paths || paths.length === 0) {
      return JSON.stringify({ success: false, imported: 0, error: "No paths provided" });
    }

    // Find or create target bin
    var targetBin = findOrCreateBin(binPath);
    if (!targetBin) {
      return JSON.stringify({ success: false, imported: 0, error: "Cannot find/create bin: " + binPath });
    }

    // Import files
    var importSuccess = app.project.importFiles(
      paths,          // array of file paths
      false,          // suppressUI
      targetBin,      // target bin
      false           // importAsNumberedStills
    );

    return JSON.stringify({
      success: importSuccess,
      imported: importSuccess ? paths.length : 0,
    });
  } catch (e) {
    return JSON.stringify({ success: false, imported: 0, error: String(e) });
  }
}

/**
 * Find a bin by path (slash-separated) or create it.
 * Example: "Footage/Day1" → root > Footage > Day1
 * @param {string} binPath - slash-separated bin path
 * @returns {Object|null} ProjectItem (bin)
 */
function findOrCreateBin(binPath) {
  if (!binPath || binPath === "" || binPath === "/") {
    return app.project.rootItem;
  }

  var parts = binPath.split("/");
  var current = app.project.rootItem;

  for (var i = 0; i < parts.length; i++) {
    var name = parts[i];
    if (!name) continue;

    var found = null;
    for (var j = 0; j < current.children.numItems; j++) {
      var child = current.children[j];
      if (child.name === name && child.type === ProjectItemType.BIN) {
        found = child;
        break;
      }
    }

    if (!found) {
      // Create the bin
      current.createBin(name);
      // Find it again (createBin doesn't return the new bin)
      for (var k = 0; k < current.children.numItems; k++) {
        var newChild = current.children[k];
        if (newChild.name === name && newChild.type === ProjectItemType.BIN) {
          found = newChild;
          break;
        }
      }
    }

    if (!found) return null;
    current = found;
  }

  return current;
}

/**
 * Create a bin at the given path.
 * @param {string} jsonArgs - JSON: { name: string, parentPath: string }
 * @returns {string} JSON: { success: boolean, error?: string }
 */
function createBin(jsonArgs) {
  try {
    var args = JSON.parse(jsonArgs);
    var bin = findOrCreateBin(
      args.parentPath ? args.parentPath + "/" + args.name : args.name
    );
    return JSON.stringify({ success: bin !== null });
  } catch (e) {
    return JSON.stringify({ success: false, error: String(e) });
  }
}

/**
 * Get the current project file path.
 * @returns {string} project path or empty string
 */
function getProjectPath() {
  try {
    if (app.project && app.project.path) {
      return app.project.path;
    }
    return "";
  } catch (e) {
    return "";
  }
}

/**
 * Get the root bin name (project name).
 * @returns {string} root bin name
 */
function getRootBinName() {
  try {
    return app.project.rootItem.name;
  } catch (e) {
    return "";
  }
}

/**
 * Remove a project item by matching its file path.
 * Searches within a target bin for a media item whose treePath matches.
 * @param {string} jsonArgs - JSON: { filePath: string, binPath: string }
 * @returns {string} JSON: { success: boolean, error?: string }
 */
function removeFileFromBin(jsonArgs) {
  try {
    var args = JSON.parse(jsonArgs);
    var filePath = args.filePath;
    var binPath = args.binPath;

    var targetBin = findOrCreateBin(binPath);
    if (!targetBin) {
      return JSON.stringify({ success: false, error: "Bin not found: " + binPath });
    }

    // Normalize path separators for comparison
    var normalizedPath = filePath.replace(/\\/g, "/").toLowerCase();

    for (var i = targetBin.children.numItems - 1; i >= 0; i--) {
      var child = targetBin.children[i];
      if (child.type !== ProjectItemType.BIN) {
        // Get the media path
        var mediaPath = child.getMediaPath ? child.getMediaPath() : "";
        if (mediaPath) {
          mediaPath = mediaPath.replace(/\\/g, "/").toLowerCase();
          if (mediaPath === normalizedPath) {
            child.remove();
            return JSON.stringify({ success: true });
          }
        }
      }
    }

    return JSON.stringify({ success: false, error: "File not found in bin" });
  } catch (e) {
    return JSON.stringify({ success: false, error: String(e) });
  }
}

/**
 * Health check — verify ExtendScript is reachable.
 * @returns {string} "ok"
 */
function ping() {
  return "ok";
}
