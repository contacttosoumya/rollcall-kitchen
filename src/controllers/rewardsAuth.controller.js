/**
 * src/controllers/rewardsAuth.controller.js
 * HTTP layer for RollCall Rewards magic-link sign-in.
 */
const rewardsAuthService = require("../services/rewardsAuth.service");
const { setSessionCookie, clearSessionCookie } = require("../middleware/rewardsSession");

/** POST /api/rewards/login-link — always responds the same way; see service for why. */
async function requestLoginLink(req, res) {
  const { email } = req.body;
  await rewardsAuthService.requestLoginLink(email);
  res.json({
    ok: true,
    message: "If that email is a RollCall Rewards member, a sign-in link is on its way.",
  });
}

/** GET /rewards/verify?token=... — the link a customer clicks from their email. */
async function verifyLoginLink(req, res) {
  const email = await rewardsAuthService.verifyLoginToken(req.query.token);

  if (!email) {
    return res.redirect("/rewards?login=expired");
  }

  setSessionCookie(res, email);
  res.redirect("/rewards?login=success");
}

/** POST /rewards/logout */
function logout(req, res) {
  clearSessionCookie(res);
  res.redirect("/rewards");
}

module.exports = { requestLoginLink, verifyLoginLink, logout };