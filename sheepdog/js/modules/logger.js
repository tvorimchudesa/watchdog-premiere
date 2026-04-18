/*
 * SheepDog — Logger module
 *
 * Two responsibilities:
 *   1. Opt-in file trace to sheepdog-debug.log (append, rotated at 10 MB,
 *      3 archives). Enabled via SettingsManager "debugMode". OFF by default.
 *   2. Always-on ring buffer (last N entries in memory, default 1000).
 *      Dumped to sheepdog-logs/{reason}-{timestamp}.log on trigger events
 *      (panel close, crash, timeout, cancel, manual). §23 Dev Observability.
 *
 * Ring buffer is cheap and runs even when debugMode=false — it's the
 * post-mortem trap for soft-lock BUG-001 and any future hang.
 */

var Logger = (function () {
  "use strict";

  var fs = typeof require !== "undefined" ? require("fs") : null;
  var path = typeof require !== "undefined" ? require("path") : null;

  var LOG_FILENAME = "sheepdog-debug.log";
  var MAX_BYTES = 10 * 1024 * 1024;
  var MAX_ARCHIVES = 3;

  var DUMPS_DIRNAME = "sheepdog-logs";
  var DUMPS_KEEP = 10;
  var BUFFER_MAX = 1000;

  var logPath = null;
  var logDir = null;
  var dumpsDir = null;
  var enabled = false;

  var ringBuffer = [];

  function ts() {
    return new Date().toISOString();
  }

  function tsFileSafe() {
    return ts().replace(/:/g, "-").replace(/\..+/, "");
  }

  function pushBuffer(line) {
    ringBuffer.push(line);
    if (ringBuffer.length > BUFFER_MAX) {
      ringBuffer.splice(0, ringBuffer.length - BUFFER_MAX);
    }
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
    var line = "[" + ts() + "] [" + level + "] [" + component + "] " + message;
    pushBuffer(line);
    if (!enabled || !fs || !logPath) return;
    try {
      maybeRotate();
      fs.appendFileSync(logPath, line + "\n", "utf8");
    } catch (e) {
      // Never throw from logger.
    }
  }

  function rotateDumps() {
    if (!fs || !dumpsDir) return;
    try {
      if (!fs.existsSync(dumpsDir)) return;
      var files = fs.readdirSync(dumpsDir)
        .filter(function (name) { return /\.log$/.test(name); })
        .map(function (name) {
          var full = path.join(dumpsDir, name);
          var stat;
          try { stat = fs.statSync(full); } catch (e) { return null; }
          return { name: name, full: full, mtime: stat.mtimeMs || 0 };
        })
        .filter(function (x) { return x !== null; });
      files.sort(function (a, b) { return b.mtime - a.mtime; });
      for (var i = DUMPS_KEEP; i < files.length; i++) {
        try { fs.unlinkSync(files[i].full); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // Rotation failure must not break dump.
    }
  }

  function ensureDumpsDir() {
    if (!fs || !dumpsDir) return false;
    try {
      if (!fs.existsSync(dumpsDir)) {
        fs.mkdirSync(dumpsDir, { recursive: true });
      }
      return true;
    } catch (e) {
      return false;
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
        dumpsDir = null;
        return;
      }
      logDir = projectDir;
      logPath = path.join(projectDir, LOG_FILENAME);
      dumpsDir = path.join(projectDir, DUMPS_DIRNAME);
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

    /**
     * Read-only snapshot of the ring buffer.
     * @returns {string[]}
     */
    getBuffer: function () {
      return ringBuffer.slice();
    },

    clearBuffer: function () {
      ringBuffer.length = 0;
    },

    /**
     * Write ring buffer to sheepdog-logs/{reason}-{timestamp}.log.
     * Works regardless of `enabled` — this is the post-mortem trap.
     * Returns the written file path, or null on failure.
     * @param {string} reason  "session" | "crash" | "timeout" | "cancel" | "manual"
     * @param {string} [extra] Optional header line (e.g. error message)
     * @returns {string|null}
     */
    dump: function (reason, extra) {
      if (!fs || !dumpsDir) return null;
      if (!ensureDumpsDir()) return null;

      var safeReason = /^[a-z]+$/.test(reason) ? reason : "manual";
      var filename = safeReason + "-" + tsFileSafe() + ".log";
      var full = path.join(dumpsDir, filename);

      try {
        var header = [
          "# SheepDog dump",
          "# reason: " + safeReason,
          "# time:   " + ts(),
          "# buffer: " + ringBuffer.length + " entries (max " + BUFFER_MAX + ")",
        ];
        if (extra) header.push("# extra:  " + String(extra).replace(/\n/g, " "));
        header.push("");

        var body = header.concat(ringBuffer).join("\n") + "\n";
        fs.writeFileSync(full, body, "utf8");
        rotateDumps();
        return full;
      } catch (e) {
        return null;
      }
    },

    getDumpsDir: function () {
      return dumpsDir;
    },
  };
})();
