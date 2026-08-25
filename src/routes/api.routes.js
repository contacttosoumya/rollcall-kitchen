const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const { writeLimiter } = require("../middleware/rateLimiter");
const {
  reservationValidators,
  newsletterValidators,
  redeemValidators,
  linkPhoneValidators,
  posOrderValidators,
} = require("../validators/submission.validators");
const apiController = require("../controllers/api.controller");
const rewardsAuthController = require("../controllers/rewardsAuth.controller");
const rewardsProgramController = require("../controllers/rewardsProgram.controller");
const posController = require("../controllers/pos.controller");

const router = express.Router();

router.get("/health", asyncHandler(apiController.health));
router.get("/menu", asyncHandler(apiController.getMenuJson));
router.get("/menu/search", asyncHandler(apiController.searchMenuJson));

router.post(
  "/reservations",
  writeLimiter,
  reservationValidators,
  validate(null),
  asyncHandler(apiController.createReservation)
);

router.post(
  "/newsletter",
  writeLimiter,
  newsletterValidators,
  validate(null),
  asyncHandler(apiController.subscribeNewsletter)
);

// Requests a RollCall Rewards magic sign-in link. Reuses newsletterValidators
// — same shape (just an email field).
router.post(
  "/rewards/login-link",
  writeLimiter,
  newsletterValidators,
  validate(null),
  asyncHandler(rewardsAuthController.requestLoginLink)
);

// Redeems a catalog reward for a signed-in member — deducts points,
// returns a short-lived code for staff to honor in person.
router.post(
  "/rewards/redeem",
  writeLimiter,
  redeemValidators,
  validate(null),
  asyncHandler(rewardsProgramController.redeem)
);

// Links a phone number to a signed-in member's account, so a future
// phone/POS order can be matched to the same rewards balance as their email.
router.post(
  "/rewards/link-phone",
  writeLimiter,
  linkPhoneValidators,
  validate(null),
  asyncHandler(rewardsProgramController.linkPhone)
);

// Staff/system-facing: records an off-site order and awards points. Not a
// customer endpoint — see pos.controller.js's requirePosKey for the
// shared-secret gate this sits behind.
router.post(
  "/pos/orders",
  posController.requirePosKey,
  writeLimiter,
  posOrderValidators,
  validate(null),
  asyncHandler(posController.recordOrder)
);

module.exports = router;