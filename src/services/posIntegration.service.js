/**
 * src/services/posIntegration.service.js
 *
 * Records an off-site order (DoorDash, Uber Eats, a phone order taken by
 * staff, or a real in-house POS) and awards RollCall Rewards points if the
 * customer can be matched by email or phone.
 *
 * Why this exists before a real integration does: orders currently happen
 * entirely off-site, and none of those platforms notify a small
 * restaurant's website when an order comes in. Rather than wait for that
 * integration to award any points at all, this function is the stable
 * interface both paths use —
 *
 *  - TODAY: called manually, via the staff-facing endpoint in
 *    api.controller.js (protected by POS_INTEGRATION_KEY), e.g. after a
 *    phone order or at end of shift from a delivery platform's dashboard.
 *  - LATER: called the exact same way by a real webhook once one exists
 *    (a DoorDash/Uber Eats integration, or a POS system's API) — nothing
 *    about this function's signature needs to change when that happens.
 */
const db = require("../config/database");
const submissionRepo = require("../repositories/submission.repository");
const ledgerRepo = require("../repositories/rewardsLedger.repository");
const posOrdersRepo = require("../repositories/posOrders.repository");
const env = require("../config/env");
const logger = require("../config/logger");

async function recordExternalOrder({ externalOrderId, source, customerEmail, customerPhone, amountCents }) {
  const identifier = customerEmail || customerPhone;
  const subscriber = identifier ? await submissionRepo.findSubscriberByIdentifier(identifier) : null;

  const pointsAwarded = subscriber
    ? Math.floor((amountCents / 100) * env.POINTS_PER_DOLLAR)
    : 0;

  const order = await db.withTransaction(async (client) => {
    if (subscriber && pointsAwarded > 0) {
      await ledgerRepo.recordLedgerEntry(client, {
        subscriberId: subscriber.id,
        direction: "earn",
        points: pointsAwarded,
        reason: `Order via ${source}`,
        source,
      });
    }

    return posOrdersRepo.insertPosOrder(client, {
      externalOrderId,
      source,
      customerEmail,
      customerPhone,
      subscriberId: subscriber ? subscriber.id : null,
      amountCents,
      pointsAwarded,
    });
  });

  logger.info("Recorded external order", {
    source,
    matched: !!subscriber,
    pointsAwarded,
    orderId: order.id,
  });

  return { orderId: order.id, matched: !!subscriber, pointsAwarded };
}

module.exports = { recordExternalOrder };