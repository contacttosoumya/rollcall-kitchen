/**
 * src/admin/resourceConfigs.js
 *
 * Declarative config for every "simple" admin-managed table — one that's
 * just a flat list of rows with typed fields. A single generic
 * repository/controller/view set (see adminResource.*) reads this config
 * to render the list table, the add/edit form, and handle validation,
 * instead of hand-writing near-identical CRUD code 10+ times.
 *
 * Field types understood by the generic form renderer (views/admin/_form-field.ejs):
 *   text, textarea, number, boolean, select, tags (comma-separated -> text[])
 *
 * Anything with genuinely special editing needs (dishes: category dropdown
 * sourced from another table + tags; locations: structured hours/features)
 * gets its own dedicated controller instead of living here — see
 * dishes.admin.controller.js and locations.admin.controller.js.
 */

const categories = {
  key: "categories",
  table: "categories",
  schema: "rollcallkitchen",
  label: "Menu Categories",
  icon: "📂",
  orderBy: "sort_order ASC",
  listColumns: ["icon", "label", "slug", "sort_order", "is_active"],
  fields: [
    { name: "slug", type: "text", required: true, help: "Used in URLs, e.g. menu#chaat — lowercase, no spaces." },
    { name: "label", type: "text", required: true },
    { name: "icon", type: "text", help: "A single emoji, e.g. 🥟" },
    { name: "blurb", type: "text" },
    { name: "sort_order", type: "number", default: 0 },
    { name: "is_active", type: "boolean", default: true },
  ],
};

const testimonials = {
  key: "testimonials",
  table: "testimonials",
  schema: "rollcallkitchen",
  label: "Testimonials",
  icon: "💬",
  orderBy: "sort_order ASC",
  listColumns: ["author_name", "author_detail", "rating", "sort_order", "is_active"],
  fields: [
    { name: "author_name", type: "text", required: true },
    { name: "author_detail", type: "text", help: "e.g. \"South End\" or \"Catering client\"" },
    { name: "quote", type: "textarea", required: true },
    { name: "rating", type: "number", default: 5, min: 1, max: 5 },
    { name: "sort_order", type: "number", default: 0 },
    { name: "is_active", type: "boolean", default: true },
  ],
};

const galleryItems = {
  key: "gallery_items",
  table: "gallery_items",
  schema: "rollcallkitchen",
  label: "Gallery Items",
  icon: "🖼️",
  orderBy: "sort_order ASC",
  listColumns: ["icon", "swatch", "caption", "sort_order", "is_active"],
  fields: [
    { name: "icon", type: "text", required: true, help: "A single emoji" },
    {
      name: "swatch",
      type: "select",
      options: ["sw-marigold", "sw-chili", "sw-curry", "sw-maroon"],
      default: "sw-marigold",
    },
    { name: "caption", type: "text" },
    { name: "sort_order", type: "number", default: 0 },
    { name: "is_active", type: "boolean", default: true },
  ],
};

const faqs = {
  key: "faqs",
  table: "faqs",
  schema: "rollcallkitchen",
  label: "FAQs",
  icon: "❓",
  orderBy: "sort_order ASC",
  listColumns: ["question", "sort_order", "is_active"],
  fields: [
    { name: "question", type: "text", required: true },
    { name: "answer", type: "textarea", required: true },
    { name: "sort_order", type: "number", default: 0 },
    { name: "is_active", type: "boolean", default: true },
  ],
};

const timelineEvents = {
  key: "timeline_events",
  table: "timeline_events",
  schema: "rollcallkitchen",
  label: "About Page — Timeline",
  icon: "🕰️",
  orderBy: "sort_order ASC",
  listColumns: ["year_label", "title", "sort_order", "is_active"],
  fields: [
    { name: "year_label", type: "text", required: true, help: "e.g. \"2011 — The Cart\"" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "sort_order", type: "number", default: 0 },
    { name: "is_active", type: "boolean", default: true },
  ],
};

const valueProps = {
  key: "value_props",
  table: "value_props",
  schema: "rollcallkitchen",
  label: "About Page — Values",
  icon: "✅",
  orderBy: "sort_order ASC",
  listColumns: ["icon", "title", "sort_order", "is_active"],
  fields: [
    { name: "icon", type: "text", required: true, help: "A single emoji" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "sort_order", type: "number", default: 0 },
    { name: "is_active", type: "boolean", default: true },
  ],
};

const rewardSteps = {
  key: "reward_steps",
  table: "reward_steps",
  schema: "rollcallkitchen",
  label: "Rewards — How It Works Steps",
  icon: "🔢",
  orderBy: "sort_order ASC",
  listColumns: ["step_number", "title", "sort_order", "is_active"],
  fields: [
    { name: "step_number", type: "text", required: true, help: "e.g. \"01\"" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "sort_order", type: "number", default: 0 },
    { name: "is_active", type: "boolean", default: true },
  ],
};

const rewardTiers = {
  key: "reward_tiers",
  table: "reward_tiers",
  schema: "rollcallkitchen",
  label: "Rewards — Membership Tiers",
  icon: "🏅",
  orderBy: "sort_order ASC",
  listColumns: ["badge", "points_range", "is_featured", "sort_order", "is_active"],
  fields: [
    { name: "badge", type: "text", required: true, help: "e.g. \"🥉 Street Cart\"" },
    { name: "points_range", type: "text", required: true, help: "e.g. \"0 – 499 points\"" },
    { name: "perks", type: "tags", help: "One perk per line." },
    { name: "is_featured", type: "boolean", default: false, help: "Highlights this tier visually." },
    { name: "sort_order", type: "number", default: 0 },
    { name: "is_active", type: "boolean", default: true },
  ],
};

const rewardCatalog = {
  key: "reward_catalog",
  table: "reward_catalog",
  schema: "rollcallkitchen",
  label: "Rewards — Redemption Catalog",
  icon: "🎁",
  orderBy: "sort_order ASC",
  listColumns: ["name", "points_cost", "reward_value", "is_active"],
  fields: [
    { name: "name", type: "text", required: true, help: "Must be unique — used as the stable key when re-seeding." },
    { name: "description", type: "text" },
    { name: "points_cost", type: "number", required: true, min: 1 },
    { name: "reward_type", type: "select", options: ["discount", "free_item"], default: "discount" },
    { name: "reward_value", type: "text", help: "e.g. \"$5\" or \"Samosa Chaat\"" },
    { name: "sort_order", type: "number", default: 0 },
    { name: "is_active", type: "boolean", default: true },
  ],
};

const cateringPackages = {
  key: "catering_packages",
  table: "catering_packages",
  schema: "rollcallkitchen",
  label: "Catering Packages",
  icon: "🍽️",
  orderBy: "sort_order ASC",
  listColumns: ["name", "price_label", "is_featured", "sort_order", "is_active"],
  fields: [
    { name: "name", type: "text", required: true },
    { name: "price_label", type: "text", required: true, help: "e.g. \"from $14 / person\"" },
    { name: "features", type: "tags", help: "One feature per line." },
    { name: "tag", type: "text", help: "e.g. \"Most Popular\" — leave blank for none." },
    { name: "is_featured", type: "boolean", default: false },
    { name: "sort_order", type: "number", default: 0 },
    { name: "is_active", type: "boolean", default: true },
  ],
};

// Ordered for the admin nav — grouped logically.
const allResources = [
  categories,
  cateringPackages,
  testimonials,
  galleryItems,
  faqs,
  timelineEvents,
  valueProps,
  rewardSteps,
  rewardTiers,
  rewardCatalog,
];

const resourcesByKey = Object.fromEntries(allResources.map((r) => [r.key, r]));

module.exports = { allResources, resourcesByKey };
