/**
 * src/controllers/api.controller.js
 * JSON API endpoints consumed by client-side JS (reservation widget,
 * newsletter form) and by monitoring/load-balancer health checks.
 */
const submissionService = require("../services/submission.service");
const menuService = require("../services/menu.service");
const db = require("../config/database");

async function createReservation(req, res) {
  const { name, phone, partySize, location, date, time, notes } = req.body;
  const result = await submissionService.submitReservation({
    name,
    phone,
    partySize,
    locationName: location,
    date,
    time,
    notes,
  });
  res.status(201).json({ ok: true, message: result.message, id: result.id });
}

async function subscribeNewsletter(req, res) {
  const { email } = req.body;
  const saved = await submissionService.subscribeToNewsletter(email);
  const message = saved.is_new
    ? `You're on the list! We've credited ${saved.points} welcome points to your account.`
    : `Welcome back! You're already a member with ${saved.points} points.`;
  res.status(201).json({ ok: true, points: saved.points, message });
}

async function getMenuJson(req, res) {
  const [categories, dishes] = await Promise.all([
    menuService.getCategories(),
    menuService.getFullMenu(),
  ]);
  res.json({ categories, dishes });
}

async function searchMenuJson(req, res) {
  const results = await menuService.searchMenu(req.query.q);
  res.json({ results });
}

/**
 * Liveness/readiness probe for load balancers, container orchestrators, or
 * uptime monitors. Checks a real DB round-trip so a broken database
 * connection is reflected as unhealthy rather than reporting green while
 * every real request would fail.
 */
async function health(req, res) {
  try {
    await db.ping();
    res.json({ ok: true, status: "healthy", uptimeSeconds: Math.round(process.uptime()) });
  } catch (err) {
    res.status(503).json({ ok: false, status: "unhealthy", error: err.message });
  }
}

module.exports = { createReservation, subscribeNewsletter, getMenuJson, searchMenuJson, health };