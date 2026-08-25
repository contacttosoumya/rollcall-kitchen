/**
 * src/services/rewardsAuth.service.js
 * Magic-link sign-in for RollCall Rewards. No passwords — a customer
 * requests a link, we email a single-use token, clicking it proves they
 * own that inbox, and we set a signed session cookie from there.
 */
const crypto = require("crypto");
const rewardsAuthRepo = require("../repositories/rewardsAuth.repository");
const submissionRepo = require("../repositories/submission.repository");
const emailService = require("./email.service");
const env = require("../config/env");
const logger = require("../config/logger");

const TOKEN_TTL_MINUTES = 15;

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Requests a magic sign-in link for an email. Always resolves the same way
 * regardless of whether that email is actually a member — this is
 * deliberate: responding differently for "member" vs "not a member" would
 * let someone enumerate which emails are enrolled in the rewards program
 * just by trying them. The email itself is only ever sent if the account
 * genuinely exists.
 */
async function requestLoginLink(email) {
  const subscriber = await submissionRepo.findSubscriberByEmail(email);

  if (subscriber && subscriber.is_active) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);
    await rewardsAuthRepo.createLoginToken(email, token, expiresAt);

    const loginUrl = `${env.SITE_URL}/rewards/verify?token=${token}`;
    emailService.sendLoginLinkEmail(email, loginUrl).catch((err) => {
      logger.error("Unexpected error sending login link email", { email, error: err.message });
    });
  } else {
    // Nothing to email — but we still return success below so the
    // response is indistinguishable from the "member" branch.
    logger.debug("Login link requested for a non-member or inactive email", { email });
  }

  return { ok: true };
}

/**
 * Verifies a magic-link token. Returns the associated email on success
 * (and marks the token used, so it can't be replayed), or null if the
 * token is missing, expired, or already used.
 */
async function verifyLoginToken(token) {
  if (!token) return null;

  const row = await rewardsAuthRepo.findValidToken(token);
  if (!row) return null;

  await rewardsAuthRepo.markTokenUsed(row.id);
  return row.email;
}

module.exports = { requestLoginLink, verifyLoginToken };