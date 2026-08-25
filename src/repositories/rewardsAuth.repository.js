/**
 * src/repositories/rewardsAuth.repository.js
 * Raw data access for magic-link sign-in tokens. Kept separate from
 * submission.repository.js since these rows are transient (used once,
 * expire in minutes) rather than durable customer records.
 */
const db = require("../config/database");

async function createLoginToken(email, token, expiresAt) {
  const { rows } = await db.query(
    `INSERT INTO rewards_login_tokens (email, token, expires_at)
     VALUES ($1, $2, $3) RETURNING id, token, expires_at`,
    [email, token, expiresAt]
  );
  return rows[0];
}

/** Returns the token row only if it's unexpired and unused; null otherwise. */
async function findValidToken(token) {
  const { rows } = await db.query(
    `SELECT id, email, expires_at, used_at
     FROM rewards_login_tokens
     WHERE token = $1 AND used_at IS NULL AND expires_at > now()`,
    [token]
  );
  return rows[0] || null;
}

async function markTokenUsed(tokenId) {
  await db.query(`UPDATE rewards_login_tokens SET used_at = now() WHERE id = $1`, [tokenId]);
}

module.exports = { createLoginToken, findValidToken, markTokenUsed };