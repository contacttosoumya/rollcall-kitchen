/**
 * src/utils/staticMap.js
 * Builds a Google Static Maps API URL: a real map image (actual streets,
 * actual geography) with every business/point-of-interest label and icon
 * turned off — including our own competitors — so nothing on the map can
 * ever advertise another business on our site. Only our own marker shows.
 *
 * Returns null if GOOGLE_MAPS_API_KEY isn't configured, so callers can
 * fall back to a placeholder rather than rendering a broken image.
 */
const env = require("../config/env");

function buildStaticMapUrl({ query, width = 640, height = 400, zoom = 15 }) {
  if (!env.GOOGLE_MAPS_API_KEY || !query) return null;

  const params = new URLSearchParams({
    center: query,
    zoom: String(zoom),
    size: `${width}x${height}`,
    scale: "2", // retina-sharp output
    maptype: "roadmap",
    key: env.GOOGLE_MAPS_API_KEY,
  });

  // Belt-and-suspenders: turn off the whole POI category (covers every
  // subtype — businesses, attractions, government buildings, etc.) and
  // then explicitly the business subtype too, so a future Maps API change
  // to the category hierarchy can't quietly bring competitor labels back.
  params.append("style", "feature:poi|visibility:off");
  params.append("style", "feature:poi.business|visibility:off");
  params.append("style", "feature:transit|element:labels|visibility:off");

  params.append("markers", `color:0xE4432B|${query}`);

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

module.exports = { buildStaticMapUrl };