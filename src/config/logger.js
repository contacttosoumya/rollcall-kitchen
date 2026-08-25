/**
 * src/config/logger.js
 * Minimal structured logger. Plain, readable lines in development;
 * single-line JSON in production so it's easy to ship to a log aggregator
 * (CloudWatch, Datadog, ELK, etc.) without adding a heavy dependency.
 */
const env = require("./env");

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[env.LOG_LEVEL] ?? LEVELS.info;

function write(level, message, meta) {
  if (LEVELS[level] > currentLevel) return;
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta ? { meta } : {}),
  };

  const line = env.isProd
    ? JSON.stringify(entry)
    : `[${entry.time}] ${level.toUpperCase().padEnd(5)} ${message}${meta ? " " + JSON.stringify(meta) : ""}`;

  if (level === "error") process.stderr.write(line + "\n");
  else process.stdout.write(line + "\n");
}

module.exports = {
  error: (message, meta) => write("error", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  info: (message, meta) => write("info", message, meta),
  debug: (message, meta) => write("debug", message, meta),
};
