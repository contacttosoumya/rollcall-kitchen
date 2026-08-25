/**
 * src/controllers/pos.controller.js
 * Staff/system-facing: records an off-site order and awards points. Not a
 * customer endpoint — protected by a shared secret (POS_INTEGRATION_KEY)
 * checked in the route middleware below, since there's no staff login
 * system on this site (see requirePosKey).
 */
const posIntegrationService = require("../services/posIntegration.service");
const env = require("../config/env");
const { AppError } = require("../middleware/errorHandler");

const VALID_SOURCES = ["doordash", "ubereats", "phone", "pos", "manual"];

/**
 * Route middleware, not a controller action: rejects the request before
 * it reaches recordOrder unless the caller presents the configured key.
 * If no key is configured at all, the endpoint is closed entirely — an
 * unset POS_INTEGRATION_KEY never means "no check required."
 */
function requirePosKey(req, res, next) {
  const provided = req.headers["x-pos-key"];
  if (!env.POS_INTEGRATION_KEY || provided !== env.POS_INTEGRATION_KEY) {
    return res.status(401).json({ ok: false, message: "Missing or invalid POS integration key." });
  }
  next();
}

/** POST /api/pos/orders — { externalOrderId?, source, customerEmail?, customerPhone?, amountCents } */
async function recordOrder(req, res) {
  const { externalOrderId, source, customerEmail, customerPhone, amountCents } = req.body;

  if (!VALID_SOURCES.includes(source)) {
    throw new AppError(`source must be one of: ${VALID_SOURCES.join(", ")}`, 400);
  }
  if (!customerEmail && !customerPhone) {
    throw new AppError("Provide customerEmail and/or customerPhone to match this order to a rewards account.", 400);
  }
  const cents = parseInt(amountCents, 10);
  if (!Number.isFinite(cents) || cents <= 0) {
    throw new AppError("amountCents must be a positive integer (order total in cents).", 400);
  }

  const result = await posIntegrationService.recordExternalOrder({
    externalOrderId,
    source,
    customerEmail,
    customerPhone,
    amountCents: cents,
  });

  res.status(201).json({
    ok: true,
    matched: result.matched,
    pointsAwarded: result.pointsAwarded,
    message: result.matched
      ? `Order recorded — ${result.pointsAwarded} points awarded.`
      : "Order recorded, but no rewards account matched that email/phone.",
  });
}

module.exports = { requirePosKey, recordOrder };