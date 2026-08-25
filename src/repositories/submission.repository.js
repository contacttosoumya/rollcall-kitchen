/**
 * src/repositories/submission.repository.js
 * Write-side data access for everything a customer submits: contact
 * messages, catering requests, table reservations, newsletter/rewards
 * signups. Kept separate from the read-heavy content repositories since
 * these are append-mostly, low-cache, and validated before they ever reach
 * here.
 *
 * Functions that participate in multi-step transactions (like awarding a
 * welcome bonus atomically with account creation) accept an optional
 * `runner` — either the shared `db` module or a transaction-scoped
 * `client` from db.withTransaction(). Both expose the same `.query(text,
 * params)` interface, so callers can pass either without these functions
 * needing to know which.
 */
const db = require("../config/database");

async function insertContactMessage({ name, email, subject, message }) {
  const { rows } = await db.query(
    `INSERT INTO contact_messages (name, email, subject, message)
     VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
    [name, email, subject, message]
  );
  return rows[0];
}

async function insertCateringRequest({ name, email, phone, eventDate, guestCount, details }) {
  const { rows } = await db.query(
    `INSERT INTO catering_requests (name, email, phone, event_date, guest_count, details)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
    [name, email, phone, eventDate || null, guestCount || null, details || ""]
  );
  return rows[0];
}

async function insertReservation({ name, phone, partySize, locationId, date, time, notes }) {
  const { rows } = await db.query(
    `INSERT INTO reservations (name, phone, party_size, location_id, reservation_date, reservation_time, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at`,
    [name, phone, partySize || 2, locationId || null, date, time, notes || ""]
  );
  return rows[0];
}

/**
 * Upsert-style subscribe: a brand-new email is inserted with a 0 balance
 * (the welcome bonus is awarded separately, through the points ledger, so
 * every points change — including the very first one — has an audit
 * trail). An email that already exists just gets reactivated; its
 * existing points balance is left untouched, so resubscribing can't be
 * used to farm free welcome bonuses.
 */
async function upsertNewsletterSubscriber(email, runner = db) {
  const { rows } = await runner.query(
    `INSERT INTO newsletter_subscribers (email, points) VALUES ($1, 0)
     ON CONFLICT (email) DO UPDATE SET is_active = TRUE
     RETURNING id, email, phone, subscribed_at, points, (xmax = 0) AS is_new`,
    [email]
  );
  return rows[0];
}

/** Looks up a subscriber's current points balance by email. Null if not found. */
async function findSubscriberByEmail(email) {
  const { rows } = await db.query(
    `SELECT id, email, phone, points, subscribed_at, is_active
     FROM newsletter_subscribers
     WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

/** Looks up a subscriber's current points balance by phone. Null if not found. */
async function findSubscriberByPhone(phone) {
  const { rows } = await db.query(
    `SELECT id, email, phone, points, subscribed_at, is_active
     FROM newsletter_subscribers
     WHERE phone = $1`,
    [phone]
  );
  return rows[0] || null;
}

/**
 * Unified lookup: accepts either an email or a phone number and finds the
 * same account either way — this is what lets "the same customer" be
 * recognized whether they signed up with an email, gave a phone number to
 * a future POS/order integration, or both. Only matches active accounts.
 */
async function findSubscriberByIdentifier(identifier) {
  if (!identifier) return null;
  const { rows } = await db.query(
    `SELECT id, email, phone, points, subscribed_at, is_active
     FROM newsletter_subscribers
     WHERE (email = $1 OR phone = $1) AND is_active = TRUE`,
    [identifier]
  );
  return rows[0] || null;
}

/**
 * Links a phone number to an existing account so a future order placed by
 * phone (or through a POS/delivery integration that only captures a phone
 * number) can be matched to the same rewards balance as their email.
 * Throws if that phone is already linked to a different account (the
 * column's UNIQUE constraint enforces this at the DB level too).
 */
async function updateSubscriberPhone(subscriberId, phone) {
  const { rows } = await db.query(
    `UPDATE newsletter_subscribers SET phone = $1 WHERE id = $2 RETURNING id, email, phone`,
    [phone, subscriberId]
  );
  return rows[0] || null;
}

module.exports = {
  insertContactMessage,
  insertCateringRequest,
  insertReservation,
  upsertNewsletterSubscriber,
  findSubscriberByEmail,
  findSubscriberByPhone,
  findSubscriberByIdentifier,
  updateSubscriberPhone,
};