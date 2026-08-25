/**
 * src/middleware/rateLimiter.js
 * Two limiter profiles:
 *  - generalLimiter: applied to the whole app, generous, mainly a backstop
 *    against runaway bots/scrapers hammering a single instance.
 *  - writeLimiter: applied only to POST endpoints that touch the database
 *    (contact, catering, reservations, newsletter) — much stricter, since
 *    these are the endpoints a spam bot or scripted abuse would target and
 *    each one costs a database write.
 * Both key on IP address and return a clear, friendly message rather than
 * a bare 429 with no explanation.
 */
const rateLimit = require("express-rate-limit");
const env = require("../config/env");

function jsonAwareHandler(message) {
  return (req, res) => {
    const isApiRequest =
      req.originalUrl.startsWith("/api/") || req.xhr || req.headers.accept?.includes("application/json");
    res.status(429);
    if (isApiRequest) return res.json({ ok: false, message });
    return res.type("text/plain").send(message);
  };
}

const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_GENERAL,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonAwareHandler("You're sending requests a little too quickly — please slow down and try again shortly."),
});

const writeLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_WRITE,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonAwareHandler("Too many submissions from this connection recently — please try again in a few minutes."),
});

module.exports = { generalLimiter, writeLimiter };
