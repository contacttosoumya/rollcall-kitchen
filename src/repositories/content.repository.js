/**
 * src/repositories/content.repository.js
 * Data access for every "site copy" table plus the flexible content_blocks
 * key-value store. Grouped in one file since each query is small and they're
 * always read together by content.service.js.
 */
const db = require("../config/database");

async function findTestimonials() {
  const { rows } = await db.query(
    `SELECT author_name, author_detail, quote, rating
     FROM testimonials WHERE is_active = TRUE ORDER BY sort_order ASC`
  );
  return rows.map((r) => ({
    authorName: r.author_name,
    authorDetail: r.author_detail,
    quote: r.quote,
    rating: r.rating,
  }));
}

async function findGalleryItems() {
  const { rows } = await db.query(
    `SELECT icon, swatch, caption FROM gallery_items WHERE is_active = TRUE ORDER BY sort_order ASC`
  );
  return rows.map((r) => ({ icon: r.icon, swatch: r.swatch, caption: r.caption }));
}

async function findFaqs() {
  const { rows } = await db.query(
    `SELECT question, answer FROM faqs WHERE is_active = TRUE ORDER BY sort_order ASC`
  );
  return rows;
}

async function findTimelineEvents() {
  const { rows } = await db.query(
    `SELECT year_label, title, description FROM timeline_events WHERE is_active = TRUE ORDER BY sort_order ASC`
  );
  return rows.map((r) => ({ yearLabel: r.year_label, title: r.title, description: r.description }));
}

async function findValueProps() {
  const { rows } = await db.query(
    `SELECT icon, title, description FROM value_props WHERE is_active = TRUE ORDER BY sort_order ASC`
  );
  return rows;
}

async function findRewardSteps() {
  const { rows } = await db.query(
    `SELECT step_number, title, description FROM reward_steps WHERE is_active = TRUE ORDER BY sort_order ASC`
  );
  return rows.map((r) => ({ stepNumber: r.step_number, title: r.title, description: r.description }));
}

async function findRewardTiers() {
  const { rows } = await db.query(
    `SELECT badge, points_range, perks, is_featured FROM reward_tiers WHERE is_active = TRUE ORDER BY sort_order ASC`
  );
  return rows.map((r) => ({
    badge: r.badge,
    pointsRange: r.points_range,
    perks: r.perks || [],
    isFeatured: r.is_featured,
  }));
}

async function findCateringPackages() {
  const { rows } = await db.query(
    `SELECT name, price_label, features, tag, is_featured FROM catering_packages WHERE is_active = TRUE ORDER BY sort_order ASC`
  );
  return rows.map((r) => ({
    name: r.name,
    priceLabel: r.price_label,
    features: r.features || [],
    tag: r.tag,
    isFeatured: r.is_featured,
  }));
}

/** Fetch every content_blocks row as a single { key: value, ... } map. */
async function findAllContentBlocks() {
  const { rows } = await db.query(`SELECT key, value FROM content_blocks`);
  const map = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

async function findContentBlock(key) {
  const { rows } = await db.query(`SELECT value FROM content_blocks WHERE key = $1`, [key]);
  return rows[0] ? rows[0].value : null;
}

module.exports = {
  findTestimonials,
  findGalleryItems,
  findFaqs,
  findTimelineEvents,
  findValueProps,
  findRewardSteps,
  findRewardTiers,
  findCateringPackages,
  findAllContentBlocks,
  findContentBlock,
};
