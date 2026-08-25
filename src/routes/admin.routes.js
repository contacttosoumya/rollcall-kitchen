/**
 * src/routes/admin.routes.js
 * All /admin/* routes. Every route except /admin/login is protected by
 * requireAdmin (mounted once below, not per-route) — a single guard at the
 * top of this router, rather than repeating middleware on 40+ routes.
 */
const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAdmin } = require("../middleware/adminSession");
const { writeLimiter } = require("../middleware/rateLimiter");

const adminAuthController = require("../controllers/adminAuth.controller");
const adminDashboardController = require("../controllers/adminDashboard.controller");
const adminResourceController = require("../controllers/adminResource.controller");
const dishesAdminController = require("../controllers/dishesAdmin.controller");
const locationsAdminController = require("../controllers/locationsAdmin.controller");
const settingsAdminController = require("../controllers/settingsAdmin.controller");
const submissionsAdminController = require("../controllers/submissionsAdmin.controller");

const router = express.Router();

// --- Auth (not gated by requireAdmin) --------------------------------
router.get("/login", adminAuthController.loginPage);
router.post("/login", writeLimiter, asyncHandler(adminAuthController.login));
router.post("/logout", adminAuthController.logout);

// --- Everything below requires a valid admin session -------------------
router.use(requireAdmin);
router.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.adminUser = req.adminUser;
  next();
});

router.get("/", asyncHandler(adminDashboardController.dashboard));

// Dishes (dedicated controller — category dropdown, tags, veg/spice)
router.get("/dishes", asyncHandler(dishesAdminController.list));
router.get("/dishes/new", asyncHandler(dishesAdminController.newForm));
router.post("/dishes", asyncHandler(dishesAdminController.create));
router.get("/dishes/:id/edit", asyncHandler(dishesAdminController.editForm));
router.post("/dishes/:id", asyncHandler(dishesAdminController.update));
router.post("/dishes/:id/delete", asyncHandler(dishesAdminController.remove));

// Locations (dedicated controller — structured hours/features)
router.get("/locations", asyncHandler(locationsAdminController.list));
router.get("/locations/new", asyncHandler(locationsAdminController.newForm));
router.post("/locations", asyncHandler(locationsAdminController.create));
router.get("/locations/:id/edit", asyncHandler(locationsAdminController.editForm));
router.post("/locations/:id", asyncHandler(locationsAdminController.update));
router.post("/locations/:id/delete", asyncHandler(locationsAdminController.remove));

// Site settings (content_blocks)
router.get("/settings", asyncHandler(settingsAdminController.list));
router.get("/settings/brand", asyncHandler(settingsAdminController.editBrandForm));
router.post("/settings/brand", asyncHandler(settingsAdminController.updateBrand));
router.get("/settings/banner", asyncHandler(settingsAdminController.editBannerForm));
router.post("/settings/banner", asyncHandler(settingsAdminController.updateBanner));
router.get("/settings/:key/raw", asyncHandler(settingsAdminController.editRawForm));
router.post("/settings/:key/raw", asyncHandler(settingsAdminController.updateRaw));

// Submissions (view + status workflow, no create/delete)
router.get("/submissions/contact", asyncHandler(submissionsAdminController.contactMessages));
router.post("/submissions/contact/:id/status", asyncHandler(submissionsAdminController.updateContactStatus));
router.get("/submissions/catering", asyncHandler(submissionsAdminController.cateringRequests));
router.post("/submissions/catering/:id/status", asyncHandler(submissionsAdminController.updateCateringStatus));
router.get("/submissions/reservations", asyncHandler(submissionsAdminController.reservations));
router.post("/submissions/reservations/:id/status", asyncHandler(submissionsAdminController.updateReservationStatus));
router.get("/submissions/members", asyncHandler(submissionsAdminController.rewardsMembers));
router.get("/submissions/members/:id", asyncHandler(submissionsAdminController.memberLedger));
router.post("/submissions/members/:id/adjust", asyncHandler(submissionsAdminController.adjustMemberPoints));
router.get("/submissions/pos-orders", asyncHandler(submissionsAdminController.posOrders));

// Generic CRUD resources (categories, testimonials, gallery, faqs,
// timeline, values, reward steps/tiers/catalog, catering packages) — one
// route set drives all of them via resourceConfigs.js.
router.get("/:resource", asyncHandler(adminResourceController.list));
router.get("/:resource/new", adminResourceController.newForm);
router.post("/:resource", asyncHandler(adminResourceController.create));
router.get("/:resource/:id/edit", asyncHandler(adminResourceController.editForm));
router.post("/:resource/:id", asyncHandler(adminResourceController.update));
router.post("/:resource/:id/delete", asyncHandler(adminResourceController.remove));

module.exports = router;
