/**
 * src/config/database.js
 *
 * Centralized PostgreSQL connection pool. Everything data-related goes
 * through this module — nothing else in the app should `require('pg')`
 * directly. This keeps pooling, timeouts, and crash-safety in one place.
 *
 * Why a pool instead of one client:
 *  - Under real traffic many requests hit the DB concurrently. A pool reuses
 *    a fixed number of live connections instead of opening one per request,
 *    which is both faster and keeps Postgres from being overwhelmed by
 *    connection churn during traffic spikes.
 *
 * Crash-safety notes:
 *  - A well-known way Node+pg apps crash in production is an *idle* pooled
 *    client emitting an 'error' event (e.g. the network blipped) with no
 *    listener attached — Node treats that as an uncaught exception and kills
 *    the process. We attach a pool-level 'error' listener below specifically
 *    to prevent that class of crash.
 *  - Statement/connection timeouts stop a single slow query from holding a
 *    connection (and therefore capacity) forever under load.
 */
const { Pool } = require("pg");
const env = require("./env");
const logger = require("./logger");

// When DATABASE_URL already specifies sslmode in the connection string
// itself (e.g. Neon, Railway, most managed Postgres providers), we must
// NOT also pass an explicit `ssl` option — pg gives the explicit option
// priority over whatever the connection string says, so an unset PGSSL
// (which defaults to false) would silently force a plaintext connection
// even though the URL says `sslmode=require`, producing a confusing
// connection timeout instead of a clear SSL error. Only override SSL
// behavior when PGSSL is explicitly set.
const pgsslExplicitlySet = process.env.PGSSL !== undefined;

const poolConfig = env.DATABASE_URL
  ? {
      connectionString: env.DATABASE_URL,
      ...(pgsslExplicitlySet ? { ssl: env.PGSSL ? { rejectUnauthorized: false } : false } : {}),
    }
  : {
      host: env.PGHOST,
      port: env.PGPORT,
      database: env.PGDATABASE,
      user: env.PGUSER,
      password: env.PGPASSWORD,
      ssl: env.PGSSL ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: env.DB_POOL_MAX,
  min: env.DB_POOL_MIN,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_CONN_TIMEOUT_MS,
  statement_timeout: env.DB_STATEMENT_TIMEOUT_MS,
  query_timeout: env.DB_STATEMENT_TIMEOUT_MS,
  application_name: "rollcall-kitchen",
  // Every new physical connection starts with this schema first on its
  // search_path (falling back to public), so the rest of the codebase can
  // write plain `dishes`, `categories`, etc. without schema-qualifying every
  // query — set PGSCHEMA in .env if the schema name ever changes.
  options: `-c search_path=${env.PGSCHEMA},public`,
});

// Prevent idle-client network errors from crashing the whole process.
pool.on("error", (err) => {
  logger.error("Unexpected error on idle PostgreSQL client", { error: err.message });
});

pool.on("connect", () => {
  logger.debug("New PostgreSQL client connected to pool");
});

/**
 * Run a parameterized query. Always prefer this (or a repository method)
 * over building SQL strings by hand — parameters keep every query safe
 * from SQL injection regardless of what a user typed into a form.
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 200) {
      logger.warn("Slow query", { text, duration, rows: result.rowCount });
    }
    return result;
  } catch (err) {
    logger.error("Query failed", { text, error: err.message });
    throw err;
  }
}

/**
 * Run a set of queries inside a single transaction. `work` receives a
 * client bound to that transaction — use client.query(...) inside it.
 * Automatically rolls back on any error and always releases the client.
 */
async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Lightweight connectivity check used by the health endpoint and startup. */
async function ping() {
  await pool.query("SELECT 1");
}

async function close() {
  await pool.end();
}

module.exports = { pool, query, withTransaction, ping, close };
