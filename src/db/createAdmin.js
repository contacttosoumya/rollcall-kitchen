/**
 * src/db/createAdmin.js
 * One-off CLI script to create (or update the password of) an admin
 * account. Deliberately not part of seed.js — admin credentials shouldn't
 * live in source-controlled seed data, and re-running seed.js shouldn't
 * ever touch passwords.
 *
 * Usage:
 *   node src/db/createAdmin.js you@example.com "a-strong-password" "Your Name"
 */
const { close } = require("../config/database");
const adminUsersRepo = require("../repositories/adminUsers.repository");
const { hashPassword } = require("../services/adminAuth.service");
const logger = require("../config/logger");

async function run() {
  const [, , email, password, name] = process.argv;

  if (!email || !password) {
    console.error("Usage: node src/db/createAdmin.js <email> <password> [name]");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const existing = await adminUsersRepo.findByEmail(email);
  if (existing) {
    console.error(`An admin account already exists for ${email}. Use the panel to manage it, or delete the row manually to recreate it.`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const admin = await adminUsersRepo.create({ email, passwordHash, name: name || "" });
  logger.info("Admin account created", { id: admin.id, email: admin.email });
  console.log(`✅ Admin account created for ${admin.email}. You can now log in at /admin/login`);
}

run()
  .then(() => close())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to create admin account:", err.message);
    process.exit(1);
  });
