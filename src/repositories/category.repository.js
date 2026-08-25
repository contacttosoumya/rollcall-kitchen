/**
 * src/repositories/category.repository.js
 * Raw data access for `categories`. Repositories only know SQL — no
 * business logic, no caching, no HTTP. Services compose these.
 */
const db = require("../config/database");

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    icon: row.icon,
    blurb: row.blurb,
  };
}

async function findAllActive() {
  const { rows } = await db.query(
    `SELECT id, slug, label, icon, blurb
     FROM categories
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, label ASC`
  );
  return rows.map(mapRow);
}

async function findBySlug(slug) {
  const { rows } = await db.query(
    `SELECT id, slug, label, icon, blurb FROM categories WHERE slug = $1 AND is_active = TRUE`,
    [slug]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

module.exports = { findAllActive, findBySlug };
