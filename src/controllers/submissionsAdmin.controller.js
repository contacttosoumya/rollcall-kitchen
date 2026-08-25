/**
 * src/controllers/submissionsAdmin.controller.js
 * Read/status-update access to everything customers have submitted:
 * contact messages, catering requests, reservations, and the RollCall
 * Rewards member list. These are never "created" from the admin panel
 * (they're customer-generated) — admin can view them and move them
 * through a status workflow (new → read/quoted/confirmed → resolved).
 */
const db = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

async function contactMessages(req, res) {
  const { rows } = await db.query(
    `SELECT * FROM rollcallkitchen.contact_messages ORDER BY created_at DESC LIMIT 200`
  );
  res.render("admin/submissions-contact", { title: "Contact Messages", messages: rows });
}

async function updateContactStatus(req, res) {
  const { status } = req.body;
  await db.query(`UPDATE rollcallkitchen.contact_messages SET status = $1 WHERE id = $2`, [status, req.params.id]);
  res.redirect("/admin/submissions/contact");
}

async function cateringRequests(req, res) {
  const { rows } = await db.query(
    `SELECT * FROM rollcallkitchen.catering_requests ORDER BY created_at DESC LIMIT 200`
  );
  res.render("admin/submissions-catering", { title: "Catering Requests", requests: rows });
}

async function updateCateringStatus(req, res) {
  const { status } = req.body;
  await db.query(`UPDATE rollcallkitchen.catering_requests SET status = $1 WHERE id = $2`, [status, req.params.id]);
  res.redirect("/admin/submissions/catering");
}

async function reservations(req, res) {
  const { rows } = await db.query(
    `SELECT r.*, l.name AS location_name
     FROM rollcallkitchen.reservations r
     LEFT JOIN rollcallkitchen.locations l ON l.id = r.location_id
     ORDER BY r.reservation_date DESC, r.reservation_time DESC LIMIT 200`
  );
  res.render("admin/submissions-reservations", { title: "Reservations", reservations: rows });
}

async function updateReservationStatus(req, res) {
  const { status } = req.body;
  await db.query(`UPDATE rollcallkitchen.reservations SET status = $1 WHERE id = $2`, [status, req.params.id]);
  res.redirect("/admin/submissions/reservations");
}

async function rewardsMembers(req, res) {
  const { rows } = await db.query(
    `SELECT id, email, phone, points, is_active, subscribed_at FROM rollcallkitchen.newsletter_subscribers ORDER BY subscribed_at DESC LIMIT 300`
  );
  res.render("admin/submissions-members", { title: "RollCall Rewards Members", members: rows });
}

async function memberLedger(req, res) {
  const memberRows = await db.query(`SELECT * FROM rollcallkitchen.newsletter_subscribers WHERE id = $1`, [req.params.id]);
  const member = memberRows.rows[0];
  if (!member) throw new AppError("Member not found.", 404);

  const ledgerRows = await db.query(
    `SELECT direction, points, reason, source, created_at FROM rollcallkitchen.points_ledger WHERE subscriber_id = $1 ORDER BY created_at DESC`,
    [req.params.id]
  );
  const redemptionRows = await db.query(
    `SELECT rc.code, rc.points_spent, rc.status, rc.expires_at, rc.created_at, cat.name AS reward_name
     FROM rollcallkitchen.redemption_codes rc
     JOIN rollcallkitchen.reward_catalog cat ON cat.id = rc.reward_catalog_id
     WHERE rc.subscriber_id = $1 ORDER BY rc.created_at DESC`,
    [req.params.id]
  );

  res.render("admin/submissions-member-detail", {
    title: `Member — ${member.email}`,
    member,
    ledger: ledgerRows.rows,
    redemptions: redemptionRows.rows,
  });
}

/**
 * Manual points adjustment — the escape hatch for correcting a mistake or
 * granting a goodwill credit, routed through the same ledger as every
 * other points change so it stays auditable.
 */
async function adjustMemberPoints(req, res) {
  const { direction, points, reason } = req.body;
  const pointsInt = parseInt(points, 10);
  if (!["earn", "redeem"].includes(direction) || !Number.isFinite(pointsInt) || pointsInt <= 0) {
    throw new AppError("Invalid adjustment.", 400);
  }

  await db.withTransaction(async (client) => {
    await client.query(
      `INSERT INTO points_ledger (subscriber_id, direction, points, reason, source) VALUES ($1,$2,$3,$4,'manual')`,
      [req.params.id, direction, pointsInt, reason || "Manual adjustment by admin"]
    );
    const delta = direction === "earn" ? pointsInt : -pointsInt;
    await client.query(`UPDATE newsletter_subscribers SET points = GREATEST(points + $1, 0) WHERE id = $2`, [delta, req.params.id]);
  });

  res.redirect(`/admin/submissions/members/${req.params.id}`);
}

async function posOrders(req, res) {
  const { rows } = await db.query(
    `SELECT po.*, nl.email AS matched_email
     FROM rollcallkitchen.pos_orders po
     LEFT JOIN rollcallkitchen.newsletter_subscribers nl ON nl.id = po.subscriber_id
     ORDER BY po.created_at DESC LIMIT 200`
  );
  res.render("admin/submissions-pos-orders", { title: "Off-Site Orders (POS Log)", orders: rows });
}

module.exports = {
  contactMessages,
  updateContactStatus,
  cateringRequests,
  updateCateringStatus,
  reservations,
  updateReservationStatus,
  rewardsMembers,
  memberLedger,
  adjustMemberPoints,
  posOrders,
};
