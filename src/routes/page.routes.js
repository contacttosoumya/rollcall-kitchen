const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const { writeLimiter } = require("../middleware/rateLimiter");
const { contactValidators, cateringValidators } = require("../validators/submission.validators");
const pageController = require("../controllers/page.controller");
const formController = require("../controllers/form.controller");
const rewardsAuthController = require("../controllers/rewardsAuth.controller");
const locationService = require("../services/location.service");
const contentService = require("../services/content.service");

const router = express.Router();

router.get("/", asyncHandler(pageController.home));
router.get("/menu", asyncHandler(pageController.menu));
router.get("/locations", asyncHandler(pageController.locations));
router.get("/about", asyncHandler(pageController.about));
router.get("/rewards", asyncHandler(pageController.rewards));
router.get("/rewards/verify", asyncHandler(rewardsAuthController.verifyLoginLink));
router.post("/rewards/logout", rewardsAuthController.logout);

router.get("/catering", asyncHandler(pageController.cateringPage));
router.post(
  "/catering",
  writeLimiter,
  cateringValidators,
  validate("catering", async () => {
    const content = await contentService.getContentBlocks();
    return {
      title: `Catering & Events — ${content.brand?.name || "RollCall Kitchen"}`,
      packages: await contentService.getCateringPackages(),
      content,
    };
  }),
  asyncHandler(formController.submitCatering)
);

router.get("/contact", asyncHandler(pageController.contactPage));
router.post(
  "/contact",
  writeLimiter,
  contactValidators,
  validate("contact", async () => {
    const content = await contentService.getContentBlocks();
    return {
      title: `Contact — ${content.brand?.name || "RollCall Kitchen"}`,
      locations: await locationService.getAllLocations(),
      faqs: await contentService.getFaqs(),
      content,
    };
  }),
  asyncHandler(formController.submitContact)
);

module.exports = router;