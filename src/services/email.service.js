/**
 * src/services/email.service.js
 * Thin wrapper around the Resend API for transactional email.
 *
 * Fail-soft by design: a broken, slow, or unreachable email provider must
 * never break the request that triggered it. A newsletter/rewards signup
 * is already complete the moment it's saved to the database — the welcome
 * email is a nice-to-have on top of that, not a precondition for success.
 * Every function here catches its own errors, logs them, and returns a
 * boolean rather than throwing — callers can fire-and-forget safely.
 */
const { Resend } = require("resend");
const env = require("../config/env");
const logger = require("../config/logger");
const { renderWelcomeEmail } = require("../emails/welcomeEmail");
const { renderLoginLinkEmail } = require("../emails/loginLinkEmail");

const SEND_TIMEOUT_MS = 8000;

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

if (!resend) {
  logger.warn("RESEND_API_KEY not set — transactional emails will be skipped, not sent.");
}

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Sends the RollCall Rewards welcome email. Returns true on confirmed send,
 * false on any failure (missing config, provider error, timeout) — never
 * throws, so it's always safe to call without try/catch at the call site.
 */
async function sendWelcomeEmail(toEmail) {
  if (!resend) {
    logger.warn("Skipped welcome email — no email provider configured", { toEmail });
    return false;
  }

  try {
    const { data, error } = await withTimeout(
      resend.emails.send({
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: toEmail,
        subject: "Welcome to RollCall Rewards — your 100 points are waiting \u{1F389}",
        html: renderWelcomeEmail({ email: toEmail }),
      }),
      SEND_TIMEOUT_MS,
      "Welcome email send"
    );

    if (error) {
      logger.error("Resend rejected the welcome email", { toEmail, error });
      return false;
    }

    logger.info("Welcome email sent", { toEmail, resendId: data?.id });
    return true;
  } catch (err) {
    logger.error("Failed to send welcome email", { toEmail, error: err.message });
    return false;
  }
}

/**
 * Sends the RollCall Rewards magic-link sign-in email. Same fail-soft
 * contract as sendWelcomeEmail — never throws, returns a boolean.
 */
async function sendLoginLinkEmail(toEmail, loginUrl) {
  if (!resend) {
    logger.warn("Skipped login link email — no email provider configured", { toEmail });
    return false;
  }

  try {
    const { data, error } = await withTimeout(
      resend.emails.send({
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: toEmail,
        subject: "Sign in to RollCall Rewards",
        html: renderLoginLinkEmail({ loginUrl }),
      }),
      SEND_TIMEOUT_MS,
      "Login link email send"
    );

    if (error) {
      logger.error("Resend rejected the login link email", { toEmail, error });
      return false;
    }

    logger.info("Login link email sent", { toEmail, resendId: data?.id });
    return true;
  } catch (err) {
    logger.error("Failed to send login link email", { toEmail, error: err.message });
    return false;
  }
}

module.exports = { sendWelcomeEmail, sendLoginLinkEmail };