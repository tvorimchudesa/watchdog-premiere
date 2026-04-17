/*
 * SheepDog — Logger module
 * Opt-in event trace to sheepdog-debug.log next to project.
 * OFF by default (SettingsManager key "debugMode").
 * Append-only with rotation at 10 MB. Keeps 3 archive files.
 */

var Logger = (function () {
  "use strict";

  var fs = typeof require !== "undefined" ? require("fs") : null;
  var path = typeof require !== "undefined" ? require("path") : null;

  var LOG_FILENAME = "sheepdog-debug.log";
  var MAX_BYTES = 10 * 1024 * 1024;
  var MAX_ARCHIVES = 3;

  var logPath = null;
  var logDir = null;
  var enabled = false;

  function ts() {
    return new Date().toISOString();
  }

  function rotate() {
    if (!fs || !logPath) return;
    try {
      for (var i = MAX_ARCHIVES; i >= 1; i--) {
        var src = logPath + "." + (i - 1);
        var dst = logPath + "." + i;
        if (i === 1) src = logPath;
        if (fs.existsSync(src)) {
          if (fs.existsSync(dst)) fs.unlinkSync(dst);
          fs.renameSync(src, dst);
        }
      }
    } catch (e) {
      // Rotation failure must not break logging; drop and continue.
    }
  }

  function maybeRotate() {
    if (!fs || !logPath) return;
    try {
      if (!fs.existsSync(logPath)) return;
      var stat = fs.statSync(logPath);
      if (stat.size >= MAX_BYTES) rotate();
    } catch (e) {
      // ignore
    }
  }

  function write(level, component, message) {
    if (!enabled || !fs || !logPath) return;
    try {
      maybeRotate();
      var line = "[" + ts() + "] [" + level + "] [" + component + "] " + message + "\n";
      fs.appendFileSync(logPath, line, "utf8");
    } catch (e) {
      // Never throw from logger.
    }
  }

  // --- Public API ---

  return {
    /**
     * Initialize with project directory. Creates log path.
     * Call again with null to disable.
     * @param {string|null} projectDir
     */
    init: function (projectDir) {
      if (!path || !projectDir) {
        logPath = null;
        logDir = null;
        return;
      }
      logDir = projectDir;
      logPath = path.join(projectDir, LOG_FILENAME);
    },

    setEnabled: function (on) {
      enabled = !!on;
    },

    isEnabled: function () {
      return enabled;
    },

    /**
     * Get the log folder path (for "Open log folder" action).
     * @returns {string|null}
     */
    getFolder: function () {
      return logDir;
    },

    getPath: function () {
      return logPath;
    },

    info: function (component, message) {
      write("INFO", component, message);
    },

    warn: function (component, message) {
      write("WARN", component, message);
    },

    error: function (component, message) {
      write("ERROR", component, message);
    },
  };
})();
