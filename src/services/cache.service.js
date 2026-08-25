/**
 * src/services/cache.service.js
 *
 * Thin wrapper around an in-memory TTL cache. Menu, categories, locations,
 * and other read-heavy/write-light content are cached briefly so a spike in
 * traffic (a busy lunch rush, a link going viral) hits the cache instead of
 * hammering Postgres on every request.
 *
 * At larger scale, running more than one app instance: swap this module's
 * internals for a Redis client (e.g. `ioredis`) behind the exact same
 * get/set/del/wrap interface — nothing else in the codebase needs to change,
 * because every service calls cache.wrap(...) rather than touching a store
 * directly.
 */
const NodeCache = require("node-cache");
const env = require("../config/env");
const logger = require("../config/logger");

const store = new NodeCache({
  stdTTL: env.CACHE_TTL_SECONDS,
  checkperiod: env.CACHE_CHECK_PERIOD_SECONDS,
  useClones: false,
});

function get(key) {
  return store.get(key);
}

function set(key, value, ttlSeconds) {
  return store.set(key, value, ttlSeconds ?? env.CACHE_TTL_SECONDS);
}

function del(keyOrKeys) {
  return store.del(keyOrKeys);
}

/** Clear every key sharing a prefix, e.g. del all `menu:*` entries after an edit. */
function delByPrefix(prefix) {
  const keys = store.keys().filter((k) => k.startsWith(prefix));
  if (keys.length) store.del(keys);
  return keys.length;
}

function flushAll() {
  store.flushAll();
}

/**
 * Fetch-through helper: return the cached value if present, otherwise run
 * `loader`, cache its result, and return it. This is the method almost all
 * services should use instead of calling get/set directly.
 */
async function wrap(key, loader, ttlSeconds) {
  const cached = get(key);
  if (cached !== undefined) return cached;
  try {
    const fresh = await loader();
    set(key, fresh, ttlSeconds);
    return fresh;
  } catch (err) {
    logger.error("Cache loader failed", { key, error: err.message });
    throw err;
  }
}

module.exports = { get, set, del, delByPrefix, flushAll, wrap };
