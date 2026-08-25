/**
 * src/validators/submission.validators.js
 * express-validator chains for every write endpoint. Every field a customer
 * submits is validated and sanitized here before it ever reaches a service
 * or touches the database — this is the app's main defense against bad
 * data, spam, and injection attempts, on top of parameterized queries.
 */
const { body } = require("express-validator");

const contactValidators = [
  body("name").trim().notEmpty().withMessage("Please enter your name.").isLength({ max: 150 }),
  body("email").trim().isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
  body("subject").optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body("message").trim().notEmpty().withMessage("Please enter a message.").isLength({ max: 4000 }),
];

const cateringValidators = [
  body("name").trim().notEmpty().withMessage("Please enter your name.").isLength({ max: 150 }),
  body("email").trim().isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Please enter a phone number.").isLength({ max: 30 }),
  body("eventDate").optional({ checkFalsy: true }).isISO8601().withMessage("Please enter a valid date."),
  body("guestCount")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 5000 })
    .withMessage("Guest count should be a number.")
    .toInt(),
  body("details").optional({ checkFalsy: true }).trim().isLength({ max: 4000 }),
];

const reservationValidators = [
  body("name").trim().notEmpty().withMessage("Please enter your name.").isLength({ max: 150 }),
  body("phone").trim().notEmpty().withMessage("Please enter a phone number.").isLength({ max: 30 }),
  body("partySize")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 100 })
    .withMessage("Party size should be a number between 1 and 100.")
    .toInt(),
  body("location").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body("date").trim().isISO8601().withMessage("Please choose a valid date."),
  body("time").trim().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage("Please choose a valid time."),
  body("notes").optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
];

const newsletterValidators = [
  body("email").trim().isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
];

// Strips everything but digits, and drops a leading US country-code "1" —
// so "(704) 555-1234", "704-555-1234", and "+1 704 555 1234" all normalize
// to the same stored value and reliably match the same account.
function normalizeUsPhone(value) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

const redeemValidators = [
  body("catalogItemId")
    .notEmpty().withMessage("Please choose a reward.")
    .isInt({ min: 1 }).withMessage("Invalid reward selected.")
    .toInt(),
];

const linkPhoneValidators = [
  body("phone")
    .trim()
    .notEmpty().withMessage("Please enter a phone number.")
    .customSanitizer(normalizeUsPhone)
    .isLength({ min: 10, max: 10 }).withMessage("Please enter a valid 10-digit US phone number."),
];

const posOrderValidators = [
  body("source").trim().notEmpty().withMessage("Please specify an order source."),
  body("customerEmail").optional({ checkFalsy: true }).trim().isEmail().withMessage("Invalid email.").normalizeEmail(),
  body("customerPhone")
    .optional({ checkFalsy: true })
    .trim()
    .customSanitizer(normalizeUsPhone)
    .isLength({ min: 10, max: 10 }).withMessage("Invalid phone number."),
  body("amountCents").isInt({ min: 1 }).withMessage("amountCents must be a positive integer.").toInt(),
  body("externalOrderId").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
];

module.exports = {
  contactValidators,
  cateringValidators,
  reservationValidators,
  newsletterValidators,
  redeemValidators,
  linkPhoneValidators,
  posOrderValidators,
};