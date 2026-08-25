/**
 * src/repositories/redemption.repository.js
 * Data access for single-use redemption codes — the bridge between "a
 * customer spent their points online" and "staff can honor that in
 * person" without any new software on the staff side.
 */
const db = require("../config/database");

/** Must be called within the same transaction as the points deduction. */
async function createRedemptionCode(client, { subscriberId, catalogItemId, code, pointsSpent, expiresAt }) {
  const { rows } = await client.query(
    `INSERT INTO redemption_codes (subscriber_id, reward_catalog_id, code, points_spent, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, code, expires_at`,
    [subscriberId, catalogItemId, code, pointsSpent, expiresAt]
  );
  return rows[0];
}

/** Returns the code row (with reward details) only if it's active and unexpired. */
async function findValidCode(code) {
  const { rows } = await db.query(
    `SELECT rc.id, rc.subscriber_id, rc.points_spent, rc.expires_at,
            cat.name AS reward_name, cat.reward_value
     FROM redemption_codes rc
     JOIN reward_catalog cat ON cat.id = rc.reward_catalog_id
     WHERE rc.code = $1 AND rc.status = 'active' AND rc.expires_at > now()`,
    [code]
  );
  return rows[0] || null;
}

async function markCodeUsed(id) {
  await db.query(`UPDATE redemption_codes SET status = 'used', used_at = now() WHERE id = $1`, [id]);
}

module.exports = { createRedemptionCode, findValidCode, markCodeUsed };