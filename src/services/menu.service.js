/**
 * src/services/menu.service.js
 * Business logic for menu browsing. Read-heavy and changes rarely, so
 * results are cached briefly (see cache.service.js) to keep the database
 * comfortable under high concurrent traffic.
 */
const categoryRepo = require("../repositories/category.repository");
const dishRepo = require("../repositories/dish.repository");
const cache = require("./cache.service");

const CACHE_PREFIX = "menu:";

async function getCategories() {
  return cache.wrap(`${CACHE_PREFIX}categories`, () => categoryRepo.findAllActive());
}

async function getFullMenu() {
  return cache.wrap(`${CACHE_PREFIX}all`, () => dishRepo.findAll());
}

async function getMenuByCategory(categorySlug) {
  return cache.wrap(`${CACHE_PREFIX}category:${categorySlug}`, () =>
    dishRepo.findByCategory(categorySlug)
  );
}

async function getBestsellers(limit = 6) {
  return cache.wrap(`${CACHE_PREFIX}bestsellers:${limit}`, () =>
    dishRepo.findByTag("bestseller", limit)
  );
}

async function getFeaturedDish(slug) {
  if (!slug) return null;
  return cache.wrap(`${CACHE_PREFIX}dish:${slug}`, () => dishRepo.findBySlug(slug));
}

/** Search is intentionally not cached — free-text queries have low hit rates. */
async function searchMenu(term) {
  const trimmed = (term || "").trim();
  if (!trimmed) return getFullMenu();
  return dishRepo.search(trimmed);
}

/** Grouped view used to render the full menu page in one pass. */
async function getMenuGroupedByCategory() {
  const [categories, dishes] = await Promise.all([getCategories(), getFullMenu()]);
  return categories.map((category) => ({
    ...category,
    dishes: dishes.filter((d) => d.category === category.slug),
  }));
}

/** Call after any admin edit to menu data so stale cache entries don't linger. */
function invalidateCache() {
  return cache.delByPrefix(CACHE_PREFIX);
}

module.exports = {
  getCategories,
  getFullMenu,
  getMenuByCategory,
  getBestsellers,
  getFeaturedDish,
  searchMenu,
  getMenuGroupedByCategory,
  invalidateCache,
};
