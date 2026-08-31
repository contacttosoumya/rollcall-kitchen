/**
 * src/controllers/settingsAdmin.controller.js
 * Admin management for content_blocks — the flexible key→JSON store behind
 * brand info, hero copy, marquee items, trust-bar stats, per-page hero
 * text, and the coming-soon banner.
 *
 * The two most frequently edited keys (brand, coming_soon_banner) get a
 * proper structured form. Everything else — including any new key added
 * later without an admin update — is always editable through the generic
 * raw-JSON editor, so nothing in content_blocks is ever inaccessible from
 * the admin panel even if it doesn't have a dedicated form yet.
 */
const db = require("../config/database");
const contentService = require("../services/content.service");
const { AppError } = require("../middleware/errorHandler");

const STRUCTURED_KEYS = ["brand", "coming_soon_banner"];

async function list(req, res) {
  const { rows } = await db.query(`SELECT key, value, updated_at FROM rollcallkitchen.content_blocks ORDER BY key ASC`);
  res.render("admin/settings-list", { title: "Site Settings", blocks: rows, structuredKeys: STRUCTURED_KEYS });
}

async function editBrandForm(req, res) {
  const value = await contentService.getContentBlock("brand", {});
  res.render("admin/settings-brand", { title: "Brand Settings", brand: value, error: null });
}

async function updateBrand(req, res) {
  const { name, tagline, email, instagram, facebook, whatsapp, doordash, ubereats } = req.body;
  // phone/address are intentionally NOT edited here — see the note in the
  // brand settings view. They live on the location record (Business →
  // Locations) since that's the single source of truth the header,
  // footer, and every page pull from.
  const existing = await contentService.getContentBlock("brand", {});
  const value = { ...existing, name, tagline, email, instagram, facebook, whatsapp, doordash, ubereats };
  await db.query(
    `INSERT INTO rollcallkitchen.content_blocks (key, value) VALUES ('brand', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [JSON.stringify(value)]
  );
  contentService.invalidateCache();
  res.redirect("/admin/settings");
}

async function editBannerForm(req, res) {
  const value = await contentService.getContentBlock("coming_soon_banner", {});
  res.render("admin/settings-banner", { title: "Coming Soon Banner", banner: value });
}

async function updateBanner(req, res) {
  const { enabled, message, ctaText, ctaUrl } = req.body;
  const value = { enabled: enabled === "on", message, ctaText: ctaText || "", ctaUrl: ctaUrl || "" };
  await db.query(
    `INSERT INTO rollcallkitchen.content_blocks (key, value) VALUES ('coming_soon_banner', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [JSON.stringify(value)]
  );
  contentService.invalidateCache();
  res.redirect("/admin/settings");
}

/** Generic raw-JSON editor — the fallback that always works, for any key. */
async function editRawForm(req, res) {
  const { rows } = await db.query(`SELECT key, value FROM rollcallkitchen.content_blocks WHERE key = $1`, [req.params.key]);
  if (!rows[0]) throw new AppError("Setting not found.", 404);
  res.render("admin/settings-raw", {
    title: `Edit — ${req.params.key}`,
    key: rows[0].key,
    valueJson: JSON.stringify(rows[0].value, null, 2),
    error: null,
  });
}

async function updateRaw(req, res) {
  const { key } = req.params;
  let parsed;
  try {
    parsed = JSON.parse(req.body.valueJson);
  } catch (err) {
    return res.status(400).render("admin/settings-raw", {
      title: `Edit — ${key}`,
      key,
      valueJson: req.body.valueJson,
      error: `That's not valid JSON: ${err.message}`,
    });
  }

  await db.query(`UPDATE rollcallkitchen.content_blocks SET value = $1 WHERE key = $2`, [JSON.stringify(parsed), key]);
  contentService.invalidateCache();
  res.redirect("/admin/settings");
}

module.exports = { list, editBrandForm, updateBrand, editBannerForm, updateBanner, editRawForm, updateRaw };