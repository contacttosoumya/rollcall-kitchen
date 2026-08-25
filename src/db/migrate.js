/**
 * src/db/migrate.js
 *
 * Tiny, dependency-free migration runner. Applies every .sql file in
 * ./migrations in filename order, tracking what's already been applied in a
 * `schema_migrations` table so it's safe to run repeatedly (e.g. on every
 * deploy) — already-applied files are skipped.
 *
 * Usage: node src/db/migrate.js
 */
const fs = require("fs");
const path = require("path");
const { pool, close } = require("../config/database");
const env = require("../config/env");
const logger = require("../config/logger");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function ensureMigrationsTable(client) {
  // Create the target schema first so this tracking table — and every
  // migration after it — lands in the same schema rather than falling back
  // to "public" because the schema didn't exist yet on a fresh database.
  await client.query(`CREATE SCHEMA IF NOT EXISTS ${env.PGSCHEMA};`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    VARCHAR(255) PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedMigrations(client) {
  const { rows } = await client.query("SELECT filename FROM schema_migrations");
  return new Set(rows.map((r) => r.filename));
}

async function run() {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let appliedCount = 0;
    for (const file of files) {
      if (applied.has(file)) {
        logger.debug(`Skipping already-applied migration: ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      logger.info(`Applying migration: ${file}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
        await client.query("COMMIT");
        appliedCount++;
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration failed (${file}): ${err.message}`);
      }
    }

    logger.info(
      appliedCount > 0
        ? `Migrations complete — applied ${appliedCount} new migration(s).`
        : "Migrations complete — database already up to date."
    );
  } finally {
    client.release();
  }
}

if (require.main === module) {
  run()
    .then(() => close())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error("Migration run failed", { error: err.message });
      process.exit(1);
    });
}

module.exports = { run };