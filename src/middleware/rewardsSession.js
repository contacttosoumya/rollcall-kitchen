/**
 * src/middleware/rewardsSession.js
 * Lightweight session handling for RollCall Rewards sign-in — a single
 * signed, httpOnly cookie holding the customer's email, nothing more.
 *
 * Why no server-side session table: the only thing this session gates is
 * viewing a points balance the customer already knows the value of (it's
 * their own loyalty points, not payment info or order history). A signed
 * cookie is tamper-proof (can't be edited to claim a different email) and
 * httpOnly (invisible to page JavaScript), which is proportionate for what
 * it protects. If sessions here ever need to guard something more
 * sensitive, or need server-side revocation ("log out everywhere"), swap
 * this for a real sessions table — the interface below wouldn't need to
 * change at the call sites.
 */
const env = require("../config/env");

const COOKIE_NAME = "rc_rewards_session";
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function setSessionCookie(res, email) {
  res.cookie(COOKIE_NAME, email, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    signed: true,
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

/** Attaches req.rewardsEmail (or undefined) based on the signed cookie. */
function rewardsSession(req, res, next) {
  const email = req.signedCookies?.[COOKIE_NAME];
  req.rewardsEmail = email || undefined;
  next();
}

module.exports = { rewardsSession, setSessionCookie, clearSessionCookie, COOKIE_NAME };