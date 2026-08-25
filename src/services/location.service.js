const locationRepo = require("../repositories/location.repository");
const cache = require("./cache.service");

const CACHE_PREFIX = "locations:";

async function getAllLocations() {
  return cache.wrap(`${CACHE_PREFIX}all`, () => locationRepo.findAllActive());
}

async function getLocationBySlug(slug) {
  return cache.wrap(`${CACHE_PREFIX}slug:${slug}`, () => locationRepo.findBySlug(slug));
}

async function getLocationById(id) {
  if (!id) return null;
  return locationRepo.findById(id);
}

function invalidateCache() {
  return cache.delByPrefix(CACHE_PREFIX);
}

module.exports = { getAllLocations, getLocationBySlug, getLocationById, invalidateCache };
