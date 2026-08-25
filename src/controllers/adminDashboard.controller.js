/**
 * src/controllers/adminDashboard.controller.js
 * The admin panel's home page — quick counts across the site so there's
 * an at-a-glance view before drilling into any specific section.
 */
const db = require("../config/database");

async function dashboard(req, res) {
  const queries = {
    dishes: `SELECT count(*)::int AS n FROM rollcallkitchen.dishes WHERE is_available = TRUE`,
    locations: `SELECT count(*)::int AS n FROM rollcallkitchen.locations WHERE is_active = TRUE`,
    members: `SELECT count(*)::int AS n FROM rollcallkitchen.newsletter_subscribers WHERE is_active = TRUE`,
    newContactMessages: `SELECT count(*)::int AS n FROM rollcallkitchen.contact_messages WHERE status = 'new'`,
    newCateringRequests: `SELECT count(*)::int AS n FROM rollcallkitchen.catering_requests WHERE status = 'new'`,
    pendingReservations: `SELECT count(*)::int AS n FROM rollcallkitchen.reservations WHERE status = 'pending'`,
    activeRedemptions: `SELECT count(*)::int AS n FROM rollcallkitchen.redemption_codes WHERE status = 'active' AND expires_at > now()`,
  };

  const results = {};
  for (const [key, sql] of Object.entries(queries)) {
    const { rows } = await db.query(sql);
    results[key] = rows[0].n;
  }

  res.render("admin/dashboard", { title: "Dashboard", stats: results });
}

module.exports = { dashboard };
