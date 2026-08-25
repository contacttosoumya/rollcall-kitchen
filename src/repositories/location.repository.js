const db = require("../config/database");

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    address: row.address,
    phone: row.phone,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    mapQuery: row.map_query,
    hours: row.hours || [],
    features: row.features || [],
  };
}

async function findAllActive() {
  const { rows } = await db.query(
    `SELECT * FROM locations WHERE is_active = TRUE ORDER BY sort_order ASC, name ASC`
  );
  return rows.map(mapRow);
}

async function findBySlug(slug) {
  const { rows } = await db.query(
    `SELECT * FROM locations WHERE slug = $1 AND is_active = TRUE`,
    [slug]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

async function findById(id) {
  const { rows } = await db.query(`SELECT * FROM locations WHERE id = $1`, [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

module.exports = { findAllActive, findBySlug, findById };
