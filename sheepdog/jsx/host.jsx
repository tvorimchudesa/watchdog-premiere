/*
 * SheepDog - ExtendScript host for Premiere Pro
 * ES3 syntax only (ExtendScript = ECMAScript 3).
 * Premiere's ExtendScript has NO native JSON object - polyfill below.
 * Without it every Bridge call fails with opaque "EvalScript error."
 */

if (typeof JSON === "undefined") {
  JSON = {
    parse: function (s) { return eval("(" + s + ")"); },
    stringify: function (o) {
      if (o === null || typeof o === "undefined") return "null";
      if (typeof o === "string") {
        return '"' + o.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t") + '"';
      }
      if (typeof o === "number" || typeof o === "boolean") return String(o);
      var parts = [], i;
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

// Failsafe error formatter - uses only primitives, survives even if JSON is broken.
// Catch blocks MUST use this instead of JSON.stringify, otherwise a broken JSON
// would make catch-block itself throw -> unhandled -> opaque "EvalScript error."
function errResult(fn, e) {
  var msg = "";
  try { msg = String(e); } catch (ignore) { msg = "unknown error"; }
  var line = "";
  try { if (e && e.line) line = "@L" + e.line; } catch (ignore2) {}
  return '{"success":false,"error":"' + fn + ': ' + msg.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + ' ' + line + '"}';
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

    // Dedupe: skip files already imported (match by media path across whole project)
    var existing = {};
    collectMediaPaths(app.project.rootItem, existing);

    var newPaths = [];
    for (var i = 0; i < paths.length; i++) {
      var normalized = paths[i].replace(/\\/g, "/").toLowerCase();
      if (!existing[normalized]) newPaths.push(paths[i]);
    }

    if (newPaths.length === 0) {
      return JSON.stringify({ success: true, imported: 0, skipped: paths.length });
    }

    // Find or create target bin
    var targetBin = findOrCreateBin(binPath);
    if (!targetBin) {
      return JSON.stringify({ success: false, imported: 0, error: "Cannot find/create bin: " + binPath });
    }

    // Import only new files
    var importSuccess = app.project.importFiles(newPaths, false, targetBin, false);

    return JSON.stringify({
      success: importSuccess,
      imported: importSuccess ? newPaths.length : 0,
      skipped: paths.length - newPaths.length,
    });
  } catch (e) {
    return errResult("importFilesToBin", e);
  }
}

/**
 * Recursively collect all media paths in the project.
 * Used by dedupe to avoid re-importing files that already exist anywhere.
 * @param {Object} item - ProjectItem (bin)
 * @param {Object} result - hash map (normalized lowercase forward-slash path -> true)
 */
function collectMediaPaths(item, result) {
  if (!item || !item.children) return;
  for (var i = 0; i < item.children.numItems; i++) {
    var child = item.children[i];
    if (child.type === ProjectItemType.BIN) {
      collectMediaPaths(child, result);
    } else {
      var mediaPath = child.getMediaPath ? child.getMediaPath() : "";
      if (mediaPath) {
        result[mediaPath.replace(/\\/g, "/").toLowerCase()] = true;
      }
    }
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
    return errResult("createBin", e);
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
    return errResult("removeFileFromBin", e);
  }
}

/**
 * Check which files are NOT yet in the project (dedupe preview, no import).
 * Mostly used for UI hinting; importFilesToBin already dedupes internally.
 * @param {string} jsonArgs - JSON: { paths: string[] }
 * @returns {string} JSON: { newPaths: string[] }
 */
function dedupeFiles(jsonArgs) {
  try {
    var args = JSON.parse(jsonArgs);
    var paths = args.paths || [];
    var existing = {};
    collectMediaPaths(app.project.rootItem, existing);
    var newPaths = [];
    for (var i = 0; i < paths.length; i++) {
      var normalized = paths[i].replace(/\\/g, "/").toLowerCase();
      if (!existing[normalized]) newPaths.push(paths[i]);
    }
    return JSON.stringify({ newPaths: newPaths });
  } catch (e) {
    return errResult("dedupeFiles", e);
  }
}

/**
 * Flatten a bin: move all files from sub-bins into target bin, then delete empty sub-bins.
 * Uses moveBin() to preserve timeline references (vs re-import which breaks them).
 * @param {string} jsonArgs - JSON: { binPath: string }
 * @returns {string} JSON: { success: boolean, moved: number, error?: string }
 */
function flattenBin(jsonArgs) {
  try {
    var args = JSON.parse(jsonArgs);
    var targetBin = findOrCreateBin(args.binPath);
    if (!targetBin) {
      return JSON.stringify({ success: false, moved: 0, error: "Bin not found: " + args.binPath });
    }

    // Collect all non-bin items from sub-bins depth-first, with their source bin.
    var items = [];
    function collectItems(bin) {
      for (var i = bin.children.numItems - 1; i >= 0; i--) {
        var child = bin.children[i];
        if (child.type === ProjectItemType.BIN) {
          collectItems(child);
        } else {
          items.push(child);
        }
      }
    }

    // Only collect from sub-bins, not from targetBin itself.
    var subBins = [];
    for (var i = targetBin.children.numItems - 1; i >= 0; i--) {
      var child = targetBin.children[i];
      if (child.type === ProjectItemType.BIN) {
        subBins.push(child);
        collectItems(child);
      }
    }

    // Move all items into targetBin (preserves timeline refs).
    var moved = 0;
    for (var j = 0; j < items.length; j++) {
      items[j].moveBin(targetBin);
      moved++;
    }

    // Delete now-empty sub-bins. deleteBin is the correct Premiere API for bin removal.
    for (var k = 0; k < subBins.length; k++) {
      try { subBins[k].deleteBin(); } catch (ignore) {}
    }

    return JSON.stringify({ success: true, moved: moved });
  } catch (e) {
    return errResult("flattenBin", e);
  }
}

/**
 * Unflatten a bin: move files from target bin back into sub-bins that mirror disk layout.
 * Uses moveBin() to preserve timeline references.
 * @param {string} jsonArgs - JSON: { binPath: string, watchFolderPath: string }
 * @returns {string} JSON: { success: boolean, moved: number, error?: string }
 */
function unflattenBin(jsonArgs) {
  try {
    var args = JSON.parse(jsonArgs);
    var targetBin = findOrCreateBin(args.binPath);
    if (!targetBin) {
      return JSON.stringify({ success: false, moved: 0, error: "Bin not found: " + args.binPath });
    }

    var watchFolder = args.watchFolderPath.replace(/\\/g, "/").toLowerCase();
    if (watchFolder.charAt(watchFolder.length - 1) !== "/") watchFolder += "/";

    var moved = 0;

    // Snapshot direct children first - moving during iteration shifts indices.
    var flatItems = [];
    for (var i = 0; i < targetBin.children.numItems; i++) {
      var child = targetBin.children[i];
      if (child.type !== ProjectItemType.BIN) flatItems.push(child);
    }

    for (var j = 0; j < flatItems.length; j++) {
      var item = flatItems[j];
      var mediaPath = item.getMediaPath ? item.getMediaPath() : "";
      if (!mediaPath) continue;

      var normalized = mediaPath.replace(/\\/g, "/").toLowerCase();
      if (normalized.indexOf(watchFolder) !== 0) continue;

      var relativePath = normalized.substring(watchFolder.length);
      var parts = relativePath.split("/");
      if (parts.length <= 1) continue; // file sits directly in watch folder root

      var subBinParts = parts.slice(0, parts.length - 1);
      var subBinPath = args.binPath + "/" + subBinParts.join("/");

      var subBin = findOrCreateBin(subBinPath);
      if (subBin) {
        item.moveBin(subBin);
        moved++;
      }
    }

    return JSON.stringify({ success: true, moved: moved });
  } catch (e) {
    return errResult("unflattenBin", e);
  }
}

/**
 * Health check - verify ExtendScript is reachable.
 * @returns {string} "ok"
 */
function ping() {
  return "ok";
}

/**
 * Environment self-check. Runs at panel startup to detect broken
 * ExtendScript state (missing JSON, no project open, missing APIs).
 * Returns plain-string "key=value;..." format so it works even if
 * JSON polyfill itself broke.
 * @returns {string} "jsonOk=1;appOk=1;projectOk=1;binApiOk=1" or failures
 */
function diagnose() {
  var result = "";
  try {
    result += "jsonOk=" + (typeof JSON !== "undefined" && JSON.stringify && JSON.parse ? "1" : "0") + ";";
    result += "appOk=" + (typeof app !== "undefined" ? "1" : "0") + ";";
    result += "projectOk=" + (typeof app !== "undefined" && app.project ? "1" : "0") + ";";
    result += "rootItemOk=" + (typeof app !== "undefined" && app.project && app.project.rootItem ? "1" : "0") + ";";
    result += "binApiOk=" + (typeof ProjectItemType !== "undefined" ? "1" : "0") + ";";
    result += "importApiOk=" + (typeof app !== "undefined" && app.project && typeof app.project.importFiles === "function" ? "1" : "0") + ";";
  } catch (e) {
    result += "diagnoseError=" + String(e) + ";";
  }
  return result;
}
