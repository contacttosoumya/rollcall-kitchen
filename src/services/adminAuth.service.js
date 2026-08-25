/**
 * src/services/adminAuth.service.js
 * Password-based login for the admin panel. Deliberately simple (email +
 * password, bcrypt-hashed, signed session cookie) — this is an internal
 * staff tool, not a customer-facing feature, so it doesn't need the
 * magic-link/passwordless approach used for RollCall Rewards.
 */
const bcrypt = require("bcryptjs");
const adminUsersRepo = require("../repositories/adminUsers.repository");

async function verifyLogin(email, password) {
  const user = await adminUsersRepo.findByEmail(email);
  if (!user || !user.is_active) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  await adminUsersRepo.updateLastLogin(user.id);
  return { id: user.id, email: user.email, name: user.name };
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

module.exports = { verifyLogin, hashPassword };
