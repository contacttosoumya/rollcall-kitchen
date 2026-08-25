/**
 * src/controllers/rewardsProgram.controller.js
 * Customer-facing redemption and account-linking endpoints. Both require
 * an active magic-link session (req.rewardsEmail) — there's no separate
 * password check because the signed cookie already proves who's asking.
 */
const rewardsProgramService = require("../services/rewardsProgram.service");
const submissionRepo = require("../repositories/submission.repository");
const { AppError } = require("../middleware/errorHandler");

function requireSession(req) {
  if (!req.rewardsEmail) {
    throw new AppError("Please sign in to your RollCall Rewards account first.", 401);
  }
}

/** POST /api/rewards/redeem — { catalogItemId } */
async function redeem(req, res) {
  requireSession(req);
  const catalogItemId = parseInt(req.body.catalogItemId, 10);
  if (!Number.isFinite(catalogItemId)) {
    throw new AppError("Please choose a valid reward.", 400);
  }

  const result = await rewardsProgramService.redeemReward(req.rewardsEmail, catalogItemId);
  res.status(201).json({
    ok: true,
    ...result,
    message: `Redeemed! Show code ${result.code} in-store — it's valid for 24 hours.`,
  });
}

/**
 * POST /api/rewards/link-phone — { phone }
 * Lets a signed-in member add a phone number to their account, so a
 * future phone order or POS/delivery-platform match can find the same
 * account their email already points to.
 */
async function linkPhone(req, res) {
  requireSession(req);
  const { phone } = req.body;

  const subscriber = await submissionRepo.findSubscriberByEmail(req.rewardsEmail);
  if (!subscriber) throw new AppError("We couldn't find your rewards account.", 404);

  const existing = await submissionRepo.findSubscriberByPhone(phone);
  if (existing && existing.id !== subscriber.id) {
    throw new AppError("That phone number is already linked to a different rewards account.", 409);
  }

  await submissionRepo.updateSubscriberPhone(subscriber.id, phone);
  res.json({ ok: true, message: "Phone number linked to your account." });
}

module.exports = { redeem, linkPhone };