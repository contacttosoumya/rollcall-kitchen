/**
 * src/services/submission.service.js
 * Business logic for everything a customer submits. Validation of shape
 * happens in the validators layer before controllers ever call these —
 * this layer focuses on what happens with a *valid* submission (persist it,
 * resolve a location, shape a friendly response).
 */
const db = require("../config/database");
const submissionRepo = require("../repositories/submission.repository");
const ledgerRepo = require("../repositories/rewardsLedger.repository");
const locationService = require("./location.service");
const emailService = require("./email.service");
const logger = require("../config/logger");

const WELCOME_BONUS_POINTS = 100;

async function submitContactMessage(data) {
  const saved = await submissionRepo.insertContactMessage(data);
  logger.info("New contact message received", { id: saved.id, email: data.email });
  return saved;
}

async function submitCateringRequest(data) {
  const saved = await submissionRepo.insertCateringRequest(data);
  logger.info("New catering request received", { id: saved.id, email: data.email });
  return saved;
}

async function submitReservation({ name, phone, partySize, locationName, date, time, notes }) {
  let locationId = null;
  if (locationName) {
    const locations = await locationService.getAllLocations();
    const match = locations.find(
      (l) => l.name.toLowerCase() === String(locationName).toLowerCase()
    );
    locationId = match ? match.id : null;
  }

  const saved = await submissionRepo.insertReservation({
    name,
    phone,
    partySize,
    locationId,
    date,
    time,
    notes,
  });

  logger.info("New reservation request received", { id: saved.id });

  const firstName = name.trim().split(/\s+/)[0];
  return {
    id: saved.id,
    message: `Thanks ${firstName}! Table for ${partySize || 2} requested on ${date} at ${time}. We'll confirm by phone shortly.`,
  };
}

/**
 * Signs up (or reactivates) a rewards member. The account row and the
 * welcome-bonus ledger entry are written in a single transaction, so a new
 * member's very first points — like every points change after it — has a
 * real audit trail rather than just a number that appeared from nowhere.
 */
async function subscribeToNewsletter(email) {
  const saved = await db.withTransaction(async (client) => {
    const subscriber = await submissionRepo.upsertNewsletterSubscriber(email, client);

    if (subscriber.is_new) {
      const newBalance = await ledgerRepo.recordLedgerEntry(client, {
        subscriberId: subscriber.id,
        direction: "earn",
        points: WELCOME_BONUS_POINTS,
        reason: "Welcome bonus",
        source: "signup",
      });
      subscriber.points = newBalance;
    }

    return subscriber;
  });

  logger.info("Newsletter signup", { id: saved.id, email, points: saved.points, isNew: saved.is_new });

  // Only send the welcome email to genuinely new members — re-submitting
  // the join form with an email that's already enrolled shouldn't re-fire
  // a "welcome, here's 100 points" email every time.
  if (saved.is_new) {
    // Fire-and-forget: the signup itself is already complete once the DB
    // write succeeds above. We don't make the customer wait on a
    // third-party API before confirming their signup — a slow or down
    // email provider should never turn into a slow or failed signup.
    // sendWelcomeEmail already catches its own errors internally; this
    // .catch is a second, defense-in-depth safety net in case anything
    // upstream of it throws.
    emailService.sendWelcomeEmail(email).catch((err) => {
      logger.error("Unexpected error sending welcome email", { email, error: err.message });
    });
  }

  return saved;
}

/**
 * Looks up a customer's current RollCall Rewards points balance by email.
 * Returns null if that email hasn't joined yet (distinct from 0 points).
 */
async function getRewardsBalance(email) {
  const subscriber = await submissionRepo.findSubscriberByEmail(email);
  if (!subscriber) return null;
  return { points: subscriber.points, memberSince: subscriber.subscribed_at, phone: subscriber.phone };
}

module.exports = {
  submitContactMessage,
  submitCateringRequest,
  submitReservation,
  subscribeToNewsletter,
  getRewardsBalance,
};