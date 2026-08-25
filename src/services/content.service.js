/**
 * src/services/content.service.js
 * Aggregates every "site copy" table (testimonials, gallery, FAQs, timeline,
 * value props, rewards content, catering packages, and the flexible
 * content_blocks store) behind a cached, easy-to-consume API. This is what
 * replaces hardcoded template text — controllers pull from here and pass
 * straight to views.
 */
const contentRepo = require("../repositories/content.repository");
const cache = require("./cache.service");

const CACHE_PREFIX = "content:";
// Site copy changes far less often than the menu, so it can sit in cache longer.
const LONG_TTL = 600;

async function getTestimonials() {
  return cache.wrap(`${CACHE_PREFIX}testimonials`, () => contentRepo.findTestimonials(), LONG_TTL);
}

async function getGalleryItems() {
  return cache.wrap(`${CACHE_PREFIX}gallery`, () => contentRepo.findGalleryItems(), LONG_TTL);
}

async function getFaqs() {
  return cache.wrap(`${CACHE_PREFIX}faqs`, () => contentRepo.findFaqs(), LONG_TTL);
}

async function getTimelineEvents() {
  return cache.wrap(`${CACHE_PREFIX}timeline`, () => contentRepo.findTimelineEvents(), LONG_TTL);
}

async function getValueProps() {
  return cache.wrap(`${CACHE_PREFIX}values`, () => contentRepo.findValueProps(), LONG_TTL);
}

async function getRewardSteps() {
  return cache.wrap(`${CACHE_PREFIX}reward-steps`, () => contentRepo.findRewardSteps(), LONG_TTL);
}

async function getRewardTiers() {
  return cache.wrap(`${CACHE_PREFIX}reward-tiers`, () => contentRepo.findRewardTiers(), LONG_TTL);
}

async function getCateringPackages() {
  return cache.wrap(`${CACHE_PREFIX}catering-packages`, () => contentRepo.findCateringPackages(), LONG_TTL);
}

/** All flexible content_blocks rows as one map, e.g. { brand, marquee_items, hero_home, ... } */
async function getContentBlocks() {
  return cache.wrap(`${CACHE_PREFIX}blocks`, () => contentRepo.findAllContentBlocks(), LONG_TTL);
}

async function getContentBlock(key, fallback = null) {
  const blocks = await getContentBlocks();
  return blocks[key] ?? fallback;
}

function invalidateCache() {
  return cache.delByPrefix(CACHE_PREFIX);
}

module.exports = {
  getTestimonials,
  getGalleryItems,
  getFaqs,
  getTimelineEvents,
  getValueProps,
  getRewardSteps,
  getRewardTiers,
  getCateringPackages,
  getContentBlocks,
  getContentBlock,
  invalidateCache,
};
