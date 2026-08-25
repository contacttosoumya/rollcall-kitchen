/**
 * src/services/rewardsProgram.service.js
 * The redemption half of RollCall Rewards: browse the (database-driven)
 * catalog, spend points for a short-lived code, staff honor it in person.
 */
const crypto = require("crypto");
const db = require("../config/database");
const catalogRepo = require("../repositories/rewardsCatalog.repository");
const ledgerRepo = require("../repositories/rewardsLedger.repository");
const redemptionRepo = require("../repositories/redemption.repository");
const { AppError } = require("../middleware/errorHandler");

const REDEMPTION_CODE_TTL_HOURS = 24;

function generateRedemptionCode() {
  return "RC-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

async function getCatalog() {
  return catalogRepo.findActiveCatalog();
}

/**
 * Redeems a reward for the account matching `identifier` (their email or
 * phone — whichever they're signed in with). Deducts points and issues a
 * code atomically: row-locks the subscriber for the duration of the
 * transaction so two rapid redemption attempts (e.g. a doubled click,
 * or two tabs) can never both succeed against the same balance.
 */
async function redeemReward(identifier, catalogItemId) {
  return db.withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT id, points FROM newsletter_subscribers
       WHERE (email = $1 OR phone = $1) AND is_active = TRUE
       FOR UPDATE`,
      [identifier]
    );
    const subscriber = rows[0];
    if (!subscriber) throw new AppError("We couldn't find your rewards account.", 404);

    const item = await catalogRepo.findCatalogItemById(catalogItemId);
    if (!item) throw new AppError("That reward isn't available right now.", 404);

    if (subscriber.points < item.pointsCost) {
      throw new AppError(
        `You need ${item.pointsCost} points for this reward — you currently have ${subscriber.points}.`,
        400
      );
    }

    const newBalance = await ledgerRepo.recordLedgerEntry(client, {
      subscriberId: subscriber.id,
      direction: "redeem",
      points: item.pointsCost,
      reason: `Redeemed: ${item.name}`,
      source: "redemption",
    });

    const code = generateRedemptionCode();
    const expiresAt = new Date(Date.now() + REDEMPTION_CODE_TTL_HOURS * 60 * 60 * 1000);
    const created = await redemptionRepo.createRedemptionCode(client, {
      subscriberId: subscriber.id,
      catalogItemId: item.id,
      code,
      pointsSpent: item.pointsCost,
      expiresAt,
    });

    return {
      code: created.code,
      expiresAt: created.expires_at,
      rewardName: item.name,
      rewardValue: item.rewardValue,
      pointsSpent: item.pointsCost,
      remainingPoints: newBalance,
    };
  });
}

module.exports = { getCatalog, redeemReward };