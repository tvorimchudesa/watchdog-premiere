/*
 * SheepDog — FolderManager module
 * Responsibility: CRUD for watch folders + JSON persistence (SRP)
 * SOT: {projectDir}/sheepdog-folders.json
 */

var FolderManager = (function () {
  "use strict";

  var fs = require("fs");
  var path = require("path");

  var CONFIG_FILENAME = "sheepdog-folders.json";
  var CONFIG_VERSION = 1;

  var folders = [];
  var configPath = null;

  /**
   * Initialize with project directory.
   * @param {string} projectDir - Directory where .prproj lives
   */
  function init(projectDir) {
    configPath = path.join(projectDir, CONFIG_FILENAME);
    load();
    if (typeof Logger !== "undefined") {
      Logger.info("FolderManager", "init, loaded " + folders.length + " folder(s)");
    }
  }

  /**
   * Load config from disk. Creates default if missing.
   */
  function load() {
    if (!configPath) return;

    try {
      if (fs.existsSync(configPath)) {
        var raw = fs.readFileSync(configPath, "utf8");
        var data = JSON.parse(raw);
        if (data.version === CONFIG_VERSION && Array.isArray(data.folders)) {
          folders = data.folders;
          return;
        }
      }
    } catch (e) {
      console.error("[FolderManager] Failed to load config:", e.message);
      if (typeof Logger !== "undefined") {
        Logger.error("FolderManager", "load failed: " + e.message);
      }
    }

    // Default: empty
    folders = [];
    save();
  }

  /**
   * Save config to disk. Writes backup first (Defense in Depth).
   */
  function save() {
    if (!configPath) return;

    var data = JSON.stringify(
      { version: CONFIG_VERSION, folders: folders },
      null,
      2
    );

    try {
      // Backup existing file before overwriting
      if (fs.existsSync(configPath)) {
        fs.writeFileSync(configPath + ".bak", fs.readFileSync(configPath));
      }
      fs.writeFileSync(configPath, data, "utf8");
    } catch (e) {
      console.error("[FolderManager] Failed to save config:", e.message);
      if (typeof Logger !== "undefined") {
        Logger.error("FolderManager", "save failed: " + e.message);
      }
    }
  }

  /**
   * Generate short unique ID.
   */
  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  }

  // --- Public API ---

  return {
    init: init,
    load: load,
    save: save,

    /**
     * Get all folders.
     * @returns {Array} folder configs
     */
    getAll: function () {
      return folders.slice(); // defensive copy
    },

    /**
     * Get enabled folders only.
     * @returns {Array}
     */
    getEnabled: function () {
      return folders.filter(function (f) { return f.enabled; });
    },

    /**
     * Add a watch folder.
     * @param {string} folderPath - Absolute path
     * @param {string} [targetBin] - Premiere bin path (defaults to folder name)
     * @param {Object} [opts] - { subfolders: boolean }
     * @returns {Object} the new folder config
     */
    add: function (folderPath, targetBin, opts) {
      opts = opts || {};
      var name = path.basename(folderPath);

      var folder = {
        id: genId(),
        path: folderPath,
        targetBin: targetBin || name,
        subfolders: opts.subfolders !== undefined ? opts.subfolders : true,
        flatten: opts.flatten || false,
        enabled: true,
      };

      folders.push(folder);
      save();
      if (typeof Logger !== "undefined") {
        Logger.info("FolderManager", "add id=" + folder.id +
          " path=" + folder.path + " bin=" + folder.targetBin);
      }
      return folder;
    },

    /**
     * Remove a folder by ID.
     * @param {string} id
     */
    remove: function (id) {
      var before = folders.length;
      var removed = null;
      for (var i = 0; i < folders.length; i++) {
        if (folders[i].id === id) { removed = folders[i]; break; }
      }
      folders = folders.filter(function (f) { return f.id !== id; });
      save();
      if (typeof Logger !== "undefined") {
        var label = removed ? (removed.path + " (bin=" + removed.targetBin + ")") : id;
        Logger.info("FolderManager", "remove " + label +
          " (" + before + "→" + folders.length + ")");
      }
    },

    /**
     * Update a folder config.
     * @param {string} id
     * @param {Object} changes - fields to merge
     * @returns {Object|null} updated folder or null
     */
    update: function (id, changes) {
      for (var i = 0; i < folders.length; i++) {
        if (folders[i].id === id) {
          Object.keys(changes).forEach(function (key) {
            if (key !== "id") folders[i][key] = changes[key];
          });
          save();
          if (typeof Logger !== "undefined") {
            var keys = Object.keys(changes).filter(function (k) { return k !== "id"; });
            Logger.info("FolderManager", "update id=" + id +
              " fields=[" + keys.join(",") + "] path=" + folders[i].path);
          }
          return folders[i];
        }
      }
      return null;
    },

    /**
     * Find folder by ID.
     * @param {string} id
     * @returns {Object|null}
     */
    getById: function (id) {
      for (var i = 0; i < folders.length; i++) {
        if (folders[i].id === id) return folders[i];
      }
      return null;
    },
  };
})();
