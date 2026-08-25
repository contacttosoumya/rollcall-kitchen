/**
 * src/config/env.js
 * Single source of truth for environment configuration.
 * Fails fast with a clear error if required variables are missing in production,
 * but falls back to sane local-dev defaults otherwise.
 */
require("dotenv").config();

function bool(value, fallback) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
}

function int(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

const NODE_ENV = process.env.NODE_ENV || "development";
const isProd = NODE_ENV === "production";

const env = {
  NODE_ENV,
  isProd,
  isDev: NODE_ENV === "development",
  isTest: NODE_ENV === "test",

  PORT: int(process.env.PORT, 3000),
  TRUST_PROXY: bool(process.env.TRUST_PROXY, isProd),

  // Database
  DATABASE_URL: process.env.DATABASE_URL, // if set, wins over discrete PG* vars
  PGHOST: process.env.PGHOST || "localhost",
  PGPORT: int(process.env.PGPORT, 15432),
  PGDATABASE: process.env.PGDATABASE || "rollcall_kitchen",
  PGUSER: process.env.PGUSER || "postgres",
  PGPASSWORD: process.env.PGPASSWORD || "postgres",
  PGSSL: bool(process.env.PGSSL, false),
  // Postgres schema the app's tables live in — set via search_path on every
  // connection (see config/database.js) rather than qualifying every query.
  PGSCHEMA: process.env.PGSCHEMA || "rollcallkitchen",

  // Pool sizing — tune for expected concurrency. See README for guidance.
  DB_POOL_MAX: int(process.env.DB_POOL_MAX, 20),
  DB_POOL_MIN: int(process.env.DB_POOL_MIN, 2),
  DB_IDLE_TIMEOUT_MS: int(process.env.DB_IDLE_TIMEOUT_MS, 30000),
  DB_CONN_TIMEOUT_MS: int(process.env.DB_CONN_TIMEOUT_MS, 5000),
  DB_STATEMENT_TIMEOUT_MS: int(process.env.DB_STATEMENT_TIMEOUT_MS, 10000),

  // Caching (in-memory by default; swap for Redis at scale — see services/cache.service.js)
  CACHE_TTL_SECONDS: int(process.env.CACHE_TTL_SECONDS, 120),
  CACHE_CHECK_PERIOD_SECONDS: int(process.env.CACHE_CHECK_PERIOD_SECONDS, 60),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: int(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  RATE_LIMIT_MAX_GENERAL: int(process.env.RATE_LIMIT_MAX_GENERAL, 600),
  RATE_LIMIT_MAX_WRITE: int(process.env.RATE_LIMIT_MAX_WRITE, 20),

  LOG_LEVEL: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),

  // Transactional email (Resend). If RESEND_API_KEY is unset, email sending
  // is skipped gracefully rather than erroring — see services/email.service.js.
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "hello@mail.rollcallkitchen.com",
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "RollCall Kitchen",
  // Absolute base URL used to build links inside emails (email clients
  // can't resolve relative paths) — point this at your real deployed site.
  SITE_URL: process.env.SITE_URL || "https://rollcallkitchen.com",

  // Signs the RollCall Rewards session cookie (magic-link sign-in). Change
  // this in production — the fallback here is fine for local dev only,
  // since anyone with it could forge a session cookie.
  SESSION_SECRET: process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me",

  // Optional. Powers a real (but POI-free) map image on the homepage and
  // Locations page via the Google Static Maps API. Without a key, those
  // sections fall back to a simple illustrated placeholder — nothing
  // breaks, it just looks less like a real map. Get a key at
  // https://console.cloud.google.com/google/maps-apis — enable the "Maps
  // Static API" — and restrict it to your domain via HTTP referrer
  // restrictions before going live.
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",

  // How many points a member earns per dollar spent, applied whenever an
  // order is recorded (manually today, automatically once a POS/delivery
  // integration exists) — see services/posIntegration.service.js.
  POINTS_PER_DOLLAR: int(process.env.POINTS_PER_DOLLAR, 10),

  // Shared secret for the staff/POS order-recording endpoint
  // (POST /api/pos/orders) until a real POS or delivery-platform webhook
  // replaces manual entry. Required in production — see the check below.
  POS_INTEGRATION_KEY: process.env.POS_INTEGRATION_KEY || "",
};

const REQUIRED_IN_PROD = [];
if (!env.DATABASE_URL) {
  REQUIRED_IN_PROD.push("PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD");
}

if (isProd) {
  const missing = REQUIRED_IN_PROD.filter((key) => !process.env[key]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error(`[config] Missing required production env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  if (env.SESSION_SECRET === "dev-only-insecure-secret-change-me") {
    // eslint-disable-next-line no-console
    console.error("[config] SESSION_SECRET is still the dev default — set a real secret before running in production.");
    process.exit(1);
  }
}

module.exports = env;