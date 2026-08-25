/**
 * src/repositories/dish.repository.js
 * Raw data access for `dishes`, joined with category slug/icon for
 * convenience so callers rarely need a second query.
 */
const db = require("../config/database");

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Number(row.price_cents) / 100,
    veg: row.is_veg,
    spice: row.spice_level,
    tags: row.tags || [],
    icon: row.icon,
    category: row.category_slug,
    categoryLabel: row.category_label,
    categoryIcon: row.category_icon,
  };
}

const BASE_SELECT = `
  SELECT
    d.id, d.slug, d.name, d.description, d.price_cents, d.is_veg, d.spice_level,
    d.tags, d.icon,
    c.slug AS category_slug, c.label AS category_label, c.icon AS category_icon
  FROM dishes d
  JOIN categories c ON c.id = d.category_id
  WHERE d.is_available = TRUE AND c.is_active = TRUE
`;

async function findAll() {
  const { rows } = await db.query(`${BASE_SELECT} ORDER BY c.sort_order ASC, d.sort_order ASC`);
  return rows.map(mapRow);
}

async function findByCategory(categorySlug) {
  const { rows } = await db.query(
    `${BASE_SELECT} AND c.slug = $1 ORDER BY d.sort_order ASC`,
    [categorySlug]
  );
  return rows.map(mapRow);
}

async function findByTag(tag, limit = 6) {
  const { rows } = await db.query(
    `${BASE_SELECT} AND $1 = ANY(d.tags) ORDER BY d.sort_order ASC LIMIT $2`,
    [tag, limit]
  );
  return rows.map(mapRow);
}

async function findBySlug(slug) {
  const { rows } = await db.query(`${BASE_SELECT} AND d.slug = $1`, [slug]);
  return rows[0] ? mapRow(rows[0]) : null;
}

/**
 * Server-side search across name + description using Postgres full-text
 * search — scales far better than a client-side substring scan once the
 * menu grows, and moves the filtering cost onto an indexed query.
 */
async function search(term, limit = 50) {
  const { rows } = await db.query(
    `${BASE_SELECT}
       AND to_tsvector('english', d.name || ' ' || d.description) @@ plainto_tsquery('english', $1)
     ORDER BY d.sort_order ASC
     LIMIT $2`,
    [term, limit]
  );
  return rows.map(mapRow);
}

async function count() {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM dishes WHERE is_available = TRUE`
  );
  return rows[0].count;
}

module.exports = { findAll, findByCategory, findByTag, findBySlug, search, count };
