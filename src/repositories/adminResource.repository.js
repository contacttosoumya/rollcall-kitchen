/**
 * src/repositories/adminResource.repository.js
 * Generic CRUD data access driven by a resourceConfig (see
 * src/admin/resourceConfigs.js). Table/schema/column names used here only
 * ever come from that trusted, hardcoded config — never directly from a
 * request — so building SQL by interpolating them is safe; all actual
 * *values* are still passed as parameterized query params.
 */
const db = require("../config/database");

function qualifiedTable(config) {
  return `${config.schema}.${config.table}`;
}

async function list(config) {
  const { rows } = await db.query(
    `SELECT * FROM ${qualifiedTable(config)} ORDER BY ${config.orderBy}`
  );
  return rows;
}

async function get(config, id) {
  const { rows } = await db.query(
    `SELECT * FROM ${qualifiedTable(config)} WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create(config, data) {
  const fieldNames = config.fields.map((f) => f.name);
  const values = fieldNames.map((name) => data[name]);
  const placeholders = fieldNames.map((_, i) => `$${i + 1}`).join(", ");

  const { rows } = await db.query(
    `INSERT INTO ${qualifiedTable(config)} (${fieldNames.join(", ")})
     VALUES (${placeholders}) RETURNING id`,
    values
  );
  return rows[0];
}

async function update(config, id, data) {
  const fieldNames = config.fields.map((f) => f.name);
  const setClause = fieldNames.map((name, i) => `${name} = $${i + 1}`).join(", ");
  const values = fieldNames.map((name) => data[name]);

  await db.query(
    `UPDATE ${qualifiedTable(config)} SET ${setClause} WHERE id = $${fieldNames.length + 1}`,
    [...values, id]
  );
}

async function remove(config, id) {
  await db.query(`DELETE FROM ${qualifiedTable(config)} WHERE id = $1`, [id]);
}

module.exports = { list, get, create, update, remove };
