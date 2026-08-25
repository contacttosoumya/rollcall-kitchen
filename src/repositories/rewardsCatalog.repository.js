/**
 * src/repositories/rewardsCatalog.repository.js
 * Data access for what a member can redeem their points for. Fully
 * database-driven — see src/db/seed.js to edit prices/rewards, no code
 * changes needed.
 */
const db = require("../config/database");

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    pointsCost: row.points_cost,
    rewardType: row.reward_type,
    rewardValue: row.reward_value,
  };
}

async function findActiveCatalog() {
  const { rows } = await db.query(
    `SELECT id, name, description, points_cost, reward_type, reward_value
     FROM reward_catalog
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, points_cost ASC`
  );
  return rows.map(mapRow);
}

async function findCatalogItemById(id) {
  const { rows } = await db.query(
    `SELECT id, name, description, points_cost, reward_type, reward_value
     FROM reward_catalog
     WHERE id = $1 AND is_active = TRUE`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

module.exports = { findActiveCatalog, findCatalogItemById };