/**
 * src/repositories/rewardsLedger.repository.js
 * The append-only audit trail behind every points change. The cached
 * balance on newsletter_subscribers.points is what gets read on every page
 * load (fast, no aggregation needed); this table is the source of truth
 * for *why* that number is what it is, and both are always updated
 * together in the same DB transaction — see recordLedgerEntry below.
 */
const db = require("../config/database");

/**
 * Records a ledger entry and atomically applies it to the cached balance.
 * Must be called with a transaction-scoped `client` (from
 * db.withTransaction) whenever it's combined with other writes — e.g.
 * creating a redemption code alongside deducting points — so the two can
 * never end up out of sync. Returns the new balance.
 */
async function recordLedgerEntry(client, { subscriberId, direction, points, reason, source = "system", metadata = {} }) {
  await client.query(
    `INSERT INTO points_ledger (subscriber_id, direction, points, reason, source, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [subscriberId, direction, points, reason, source, JSON.stringify(metadata)]
  );

  const delta = direction === "earn" ? points : -points;
  const { rows } = await client.query(
    `UPDATE newsletter_subscribers SET points = points + $1 WHERE id = $2 RETURNING points`,
    [delta, subscriberId]
  );
  return rows[0].points;
}

/** Recent ledger history for a subscriber — earn/redeem activity feed. */
async function getLedgerForSubscriber(subscriberId, limit = 20) {
  const { rows } = await db.query(
    `SELECT direction, points, reason, source, created_at
     FROM points_ledger
     WHERE subscriber_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [subscriberId, limit]
  );
  return rows;
}

module.exports = { recordLedgerEntry, getLedgerForSubscriber };