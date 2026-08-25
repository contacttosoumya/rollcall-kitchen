/**
 * src/repositories/adminUsers.repository.js
 * Data access for staff/admin accounts.
 */
const db = require("../config/database");

async function findByEmail(email) {
  const { rows } = await db.query(
    `SELECT id, email, password_hash, name, is_active FROM admin_users WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT id, email, name, is_active FROM admin_users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ email, passwordHash, name }) {
  const { rows } = await db.query(
    `INSERT INTO admin_users (email, password_hash, name) VALUES ($1, $2, $3)
     RETURNING id, email, name`,
    [email, passwordHash, name || ""]
  );
  return rows[0];
}

async function updateLastLogin(id) {
  await db.query(`UPDATE admin_users SET last_login_at = now() WHERE id = $1`, [id]);
}

async function findAll() {
  const { rows } = await db.query(
    `SELECT id, email, name, is_active, last_login_at, created_at FROM admin_users ORDER BY created_at ASC`
  );
  return rows;
}

module.exports = { findByEmail, findById, create, updateLastLogin, findAll };
