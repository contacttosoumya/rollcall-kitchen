/**
 * src/controllers/adminResource.controller.js
 * Generic list/new/create/edit/update/delete for any resource defined in
 * src/admin/resourceConfigs.js. The :resource URL param is always looked
 * up against the known config map — an unrecognized key 404s rather than
 * ever touching the database with an unvalidated table name.
 */
const { resourcesByKey, allResources } = require("../admin/resourceConfigs");
const adminResourceRepo = require("../repositories/adminResource.repository");
const menuService = require("../services/menu.service");
const contentService = require("../services/content.service");
const { AppError } = require("../middleware/errorHandler");

function getConfigOrThrow(req) {
  const config = resourcesByKey[req.params.resource];
  if (!config) throw new AppError("Unknown admin resource.", 404);
  return config;
}

/** Converts submitted form strings into properly typed values per field config. */
function coerceFormData(config, body) {
  const data = {};
  for (const field of config.fields) {
    const raw = body[field.name];
    switch (field.type) {
      case "number":
        data[field.name] = raw === "" || raw === undefined ? (field.default ?? 0) : Number(raw);
        break;
      case "boolean":
        data[field.name] = raw === "on" || raw === "true" || raw === true;
        break;
      case "tags":
        data[field.name] = (raw || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      default:
        data[field.name] = (raw ?? "").toString().trim();
    }
  }
  return data;
}

/** Prepares a fetched row for the edit form — array fields back to textarea text. */
function prepareRowForForm(config, row) {
  const prepared = { ...row };
  for (const field of config.fields) {
    if (field.type === "tags" && Array.isArray(prepared[field.name])) {
      prepared[field.name] = prepared[field.name].join("\n");
    }
  }
  return prepared;
}

async function list(req, res) {
  const config = getConfigOrThrow(req);
  const rows = await adminResourceRepo.list(config);
  res.render("admin/resource-list", { title: config.label, config, rows, allResources });
}

function newForm(req, res) {
  const config = getConfigOrThrow(req);
  res.render("admin/resource-form", { title: `New — ${config.label}`, config, row: {}, isNew: true, allResources, error: null });
}

async function create(req, res) {
  const config = getConfigOrThrow(req);
  const data = coerceFormData(config, req.body);
  await adminResourceRepo.create(config, data);
  await invalidateCachesFor(config.key);
  res.redirect(`/admin/${config.key}`);
}

async function editForm(req, res) {
  const config = getConfigOrThrow(req);
  const row = await adminResourceRepo.get(config, req.params.id);
  if (!row) throw new AppError("Not found.", 404);
  res.render("admin/resource-form", {
    title: `Edit — ${config.label}`,
    config,
    row: prepareRowForForm(config, row),
    isNew: false,
    allResources,
    error: null,
  });
}

async function update(req, res) {
  const config = getConfigOrThrow(req);
  const data = coerceFormData(config, req.body);
  await adminResourceRepo.update(config, req.params.id, data);
  await invalidateCachesFor(config.key);
  res.redirect(`/admin/${config.key}`);
}

async function remove(req, res) {
  const config = getConfigOrThrow(req);
  await adminResourceRepo.remove(config, req.params.id);
  await invalidateCachesFor(config.key);
  res.redirect(`/admin/${config.key}`);
}

/**
 * The public site caches menu/content data briefly (see cache.service.js)
 * to protect the database under load. Any admin write needs to bust the
 * relevant cache immediately, or the change won't visibly appear on the
 * live site for up to the cache's TTL.
 */
async function invalidateCachesFor(resourceKey) {
  if (resourceKey === "categories") {
    menuService.invalidateCache();
  }
  contentService.invalidateCache();
}

module.exports = { list, newForm, create, editForm, update, remove };
