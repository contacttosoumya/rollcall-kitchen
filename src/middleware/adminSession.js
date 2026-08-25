/**
 * src/middleware/adminSession.js
 * Session handling for the admin panel — a signed cookie holding the admin
 * user's ID, completely separate from the RollCall Rewards customer
 * session (rewardsSession.js). Different cookie name, different trust
 * boundary: this one gates write access to every piece of site content.
 */
const env = require("../config/env");
const adminUsersRepo = require("../repositories/adminUsers.repository");

const COOKIE_NAME = "rc_admin_session";
const COOKIE_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours — shorter-lived than the customer session on purpose

function setAdminSessionCookie(res, adminId) {
  res.cookie(COOKIE_NAME, String(adminId), {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    signed: true,
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

function clearAdminSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

/** Attaches req.adminUser (or undefined) based on the signed cookie. */
async function adminSession(req, res, next) {
  const id = req.signedCookies?.[COOKIE_NAME];
  if (!id) {
    req.adminUser = undefined;
    return next();
  }
  try {
    const user = await adminUsersRepo.findById(parseInt(id, 10));
    req.adminUser = user && user.is_active ? user : undefined;
  } catch {
    req.adminUser = undefined;
  }
  next();
}

/** Route guard: redirects to the login page if no valid admin session. */
function requireAdmin(req, res, next) {
  if (!req.adminUser) {
    return res.redirect("/admin/login");
  }
  next();
}

module.exports = { adminSession, requireAdmin, setAdminSessionCookie, clearAdminSessionCookie, COOKIE_NAME };
