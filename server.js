/**
 * server.js
 * Composition root: builds the Express app, verifies the database is
 * reachable (retrying instead of failing instantly — useful when the DB
 * container is still starting up, e.g. under docker-compose), starts
 * listening, and wires up graceful shutdown + crash safety nets.
 *
 * Run this directly (`node server.js` / `npm start`). For multi-core
 * production use, run it under PM2 in cluster mode — see ecosystem.config.js
 * — so a crashed worker is restarted in milliseconds without dropping the
 * whole site, and traffic is spread across all CPU cores.
 */
const env = require("./src/config/env");
const logger = require("./src/config/logger");
const db = require("./src/config/database");
const createApp = require("./src/app");

async function waitForDatabase({ retries = 10, delayMs = 2000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await db.ping();
      logger.info("Database connection established.");
      return;
    } catch (err) {
      logger.warn(`Database not reachable yet (attempt ${attempt}/${retries})`, { error: err.message });
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  await waitForDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🌯  RollCall Kitchen is sizzling on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Don't let one slow/stalled client tie up a connection forever under load.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  // ---- Graceful shutdown -------------------------------------------------
  // On SIGTERM/SIGINT (container stop, PM2 restart, Ctrl+C): stop accepting
  // new connections, let in-flight requests finish, then close the DB pool.
  // This is what prevents a deploy or restart from dropping active customer
  // requests (e.g. a reservation mid-submit).
  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`Received ${signal}, shutting down gracefully…`);

    const forceExitTimer = setTimeout(() => {
      logger.error("Graceful shutdown timed out — forcing exit.");
      process.exit(1);
    }, 15_000);

    server.close(async (err) => {
      if (err) logger.error("Error while closing HTTP server", { error: err.message });
      try {
        await db.close();
        logger.info("Database pool closed. Goodbye.");
      } catch (dbErr) {
        logger.error("Error closing database pool", { error: dbErr.message });
      } finally {
        clearTimeout(forceExitTimer);
        process.exit(0);
      }
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // ---- Crash safety nets --------------------------------------------------
  // These should rarely fire (the async wrapper + pool error listener catch
  // the common cases), but if something truly unexpected slips through, log
  // it with full context and shut down cleanly rather than leaving the
  // process in a corrupted, half-working state. A process manager (PM2,
  // Docker restart policy, Kubernetes) then restarts it immediately.
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", {
      error: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception — shutting down for a clean restart", {
      error: err.message,
      stack: err.stack,
    });
    shutdown("uncaughtException").finally(() => {
      setTimeout(() => process.exit(1), 16_000);
    });
  });

  return server;
}

if (require.main === module) {
  start().catch((err) => {
    logger.error("Failed to start server", { error: err.message });
    process.exit(1);
  });
}

module.exports = { start };
