/**
 * src/controllers/dishesAdmin.controller.js
 * Dishes need a dedicated controller rather than the generic resource
 * engine: the category is a foreign key needing a dropdown (not a plain
 * text field), tags are a fixed checkbox set (bestseller/new/chefs-pick),
 * and price is entered in dollars but stored in cents.
 */
const db = require("../config/database");
const menuService = require("../services/menu.service");
const { AppError } = require("../middleware/errorHandler");

const TAG_OPTIONS = ["bestseller", "new", "chefs-pick"];

async function list(req, res) {
  const { rows } = await db.query(
    `SELECT d.id, d.name, d.slug, d.price_cents, d.is_veg, d.spice_level, d.is_available, d.sort_order,
            c.label AS category_label
     FROM rollcallkitchen.dishes d
     JOIN rollcallkitchen.categories c ON c.id = d.category_id
     ORDER BY c.sort_order ASC, d.sort_order ASC`
  );
  res.render("admin/dishes-list", { title: "Menu Dishes", dishes: rows });
}

async function getCategories() {
  const { rows } = await db.query(
    `SELECT id, label FROM rollcallkitchen.categories WHERE is_active = TRUE ORDER BY sort_order ASC`
  );
  return rows;
}

async function newForm(req, res) {
  const categories = await getCategories();
  res.render("admin/dish-form", {
    title: "New Dish",
    dish: { is_veg: true, spice_level: 0, is_available: true, tags: [] },
    categories,
    tagOptions: TAG_OPTIONS,
    isNew: true,
  });
}

function parseDishBody(body) {
  return {
    category_id: parseInt(body.category_id, 10),
    slug: (body.slug || "").trim(),
    name: (body.name || "").trim(),
    description: (body.description || "").trim(),
    price_cents: Math.round(parseFloat(body.price || "0") * 100),
    is_veg: body.is_veg === "on",
    spice_level: parseInt(body.spice_level, 10) || 0,
    tags: TAG_OPTIONS.filter((t) => body[`tag_${t}`] === "on"),
    icon: (body.icon || "").trim() || null,
    is_available: body.is_available === "on",
    sort_order: parseInt(body.sort_order, 10) || 0,
  };
}

async function create(req, res) {
  const data = parseDishBody(req.body);
  await db.query(
    `INSERT INTO rollcallkitchen.dishes
       (category_id, slug, name, description, price_cents, is_veg, spice_level, tags, icon, is_available, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [data.category_id, data.slug, data.name, data.description, data.price_cents, data.is_veg,
     data.spice_level, data.tags, data.icon, data.is_available, data.sort_order]
  );
  menuService.invalidateCache();
  res.redirect("/admin/dishes");
}

async function editForm(req, res) {
  const { rows } = await db.query(`SELECT * FROM rollcallkitchen.dishes WHERE id = $1`, [req.params.id]);
  const dish = rows[0];
  if (!dish) throw new AppError("Dish not found.", 404);
  dish.price = (dish.price_cents / 100).toFixed(2);

  const categories = await getCategories();
  res.render("admin/dish-form", { title: `Edit — ${dish.name}`, dish, categories, tagOptions: TAG_OPTIONS, isNew: false });
}

async function update(req, res) {
  const data = parseDishBody(req.body);
  await db.query(
    `UPDATE rollcallkitchen.dishes SET
       category_id=$1, slug=$2, name=$3, description=$4, price_cents=$5, is_veg=$6,
       spice_level=$7, tags=$8, icon=$9, is_available=$10, sort_order=$11
     WHERE id=$12`,
    [data.category_id, data.slug, data.name, data.description, data.price_cents, data.is_veg,
     data.spice_level, data.tags, data.icon, data.is_available, data.sort_order, req.params.id]
  );
  menuService.invalidateCache();
  res.redirect("/admin/dishes");
}

async function remove(req, res) {
  await db.query(`DELETE FROM rollcallkitchen.dishes WHERE id = $1`, [req.params.id]);
  menuService.invalidateCache();
  res.redirect("/admin/dishes");
}

module.exports = { list, newForm, create, editForm, update, remove };
