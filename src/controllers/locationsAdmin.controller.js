/**
 * src/controllers/locationsAdmin.controller.js
 * Locations need dedicated handling for two structured fields:
 *   - hours: JSONB array of {days, time} — edited as paired text inputs
 *     rather than raw JSON, so no one has to hand-write valid JSON to
 *     update store hours.
 *   - features: text[] — edited the same "one per line" way as other
 *     tag-like fields elsewhere in the admin.
 */
const db = require("../config/database");
const locationService = require("../services/location.service");
const { AppError } = require("../middleware/errorHandler");

async function list(req, res) {
  const { rows } = await db.query(
    `SELECT id, name, slug, address, phone, is_active, sort_order FROM rollcallkitchen.locations ORDER BY sort_order ASC`
  );
  res.render("admin/locations-list", { title: "Locations", locations: rows });
}

function newForm(req, res) {
  res.render("admin/location-form", {
    title: "New Location",
    location: { hours: [{ days: "", time: "" }], features: [], is_active: true },
    isNew: true,
  });
}

function parseLocationBody(body) {
  const daysArr = [].concat(body.hours_days || []);
  const timeArr = [].concat(body.hours_time || []);
  const hours = daysArr
    .map((days, i) => ({ days: (days || "").trim(), time: (timeArr[i] || "").trim() }))
    .filter((h) => h.days && h.time);

  const features = (body.features || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    slug: (body.slug || "").trim(),
    name: (body.name || "").trim(),
    address: (body.address || "").trim(),
    phone: (body.phone || "").trim(),
    map_query: (body.map_query || body.address || "").trim(),
    hours: JSON.stringify(hours),
    features,
    is_active: body.is_active === "on",
    sort_order: parseInt(body.sort_order, 10) || 0,
  };
}

async function create(req, res) {
  const d = parseLocationBody(req.body);
  await db.query(
    `INSERT INTO rollcallkitchen.locations (slug, name, address, phone, map_query, hours, features, is_active, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [d.slug, d.name, d.address, d.phone, d.map_query, d.hours, d.features, d.is_active, d.sort_order]
  );
  locationService.invalidateCache();
  res.redirect("/admin/locations");
}

async function editForm(req, res) {
  const { rows } = await db.query(`SELECT * FROM rollcallkitchen.locations WHERE id = $1`, [req.params.id]);
  const location = rows[0];
  if (!location) throw new AppError("Location not found.", 404);
  if (!location.hours || !location.hours.length) location.hours = [{ days: "", time: "" }];
  res.render("admin/location-form", { title: `Edit — ${location.name}`, location, isNew: false });
}

async function update(req, res) {
  const d = parseLocationBody(req.body);
  await db.query(
    `UPDATE rollcallkitchen.locations SET
       slug=$1, name=$2, address=$3, phone=$4, map_query=$5, hours=$6, features=$7, is_active=$8, sort_order=$9
     WHERE id=$10`,
    [d.slug, d.name, d.address, d.phone, d.map_query, d.hours, d.features, d.is_active, d.sort_order, req.params.id]
  );
  locationService.invalidateCache();
  res.redirect("/admin/locations");
}

async function remove(req, res) {
  await db.query(`DELETE FROM rollcallkitchen.locations WHERE id = $1`, [req.params.id]);
  locationService.invalidateCache();
  res.redirect("/admin/locations");
}

module.exports = { list, newForm, create, editForm, update, remove };
