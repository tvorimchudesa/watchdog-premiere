/*
 * SheepDog — SettingsManager module
 * Responsibility: Global settings persistence (SRP)
 * SOT: {projectDir}/sheepdog-settings.json
 */

var SettingsManager = (function () {
  "use strict";

  var fs = require("fs");
  var path = require("path");

  var CONFIG_FILENAME = "sheepdog-settings.json";
  var CONFIG_VERSION = 1;

  var settings = {};
  var configPath = null;

  var DEFAULTS = {
    allowedExtensions: [
      ".mp4", ".mov", ".mxf", ".avi", ".mkv", ".wmv", ".m4v",
      ".wav", ".mp3", ".aif", ".aiff", ".m4a", ".flac",
      ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".gif",
      ".psd", ".ai", ".exr", ".dpx", ".tga",
    ],
    autoSync: false,
    mirrorDeletions: false,
    importSubfolders: true,
    debugMode: false,
    bridgeTimeoutMs: 30000,
  };

  /**
   * Initialize with project directory.
   * @param {string} projectDir
   */
  function init(projectDir) {
    configPath = path.join(projectDir, CONFIG_FILENAME);
    load();
  }

  /**
   * Load settings from disk. Merges with defaults for missing keys.
   */
  function load() {
    if (!configPath) return;

    var loaded = {};
    try {
      if (fs.existsSync(configPath)) {
        var raw = fs.readFileSync(configPath, "utf8");
        var data = JSON.parse(raw);
        if (data.version === CONFIG_VERSION) {
          loaded = data.settings || {};
        }
      }
    } catch (e) {
      console.error("[SettingsManager] Failed to load:", e.message);
    }

    // Merge: loaded values override defaults
    settings = {};
    Object.keys(DEFAULTS).forEach(function (key) {
      settings[key] = loaded.hasOwnProperty(key) ? loaded[key] : DEFAULTS[key];
    });
  }

  /**
   * Save settings to disk.
   */
  function save() {
    if (!configPath) return;

    var data = JSON.stringify(
      { version: CONFIG_VERSION, settings: settings },
      null,
      2
    );

    try {
      fs.writeFileSync(configPath, data, "utf8");
    } catch (e) {
      console.error("[SettingsManager] Failed to save:", e.message);
    }
  }

  // --- Public API ---

  return {
    init: init,
    load: load,
    save: save,

    /**
     * Get a setting value.
     * @param {string} key
     * @returns {*}
     */
    get: function (key) {
      return settings.hasOwnProperty(key) ? settings[key] : DEFAULTS[key];
    },

    /**
     * Set a setting value and persist.
     * @param {string} key
     * @param {*} value
     */
    set: function (key, value) {
      settings[key] = value;
      save();
    },

    /**
     * Get all settings.
     * @returns {Object}
     */
    getAll: function () {
      return JSON.parse(JSON.stringify(settings)); // defensive copy
    },

    /**
     * Reset to defaults.
     */
    reset: function () {
      settings = JSON.parse(JSON.stringify(DEFAULTS));
      save();
    },

    DEFAULTS: DEFAULTS,
  };
})();
