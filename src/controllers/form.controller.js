/**
 * src/controllers/form.controller.js
 * Handles the two traditional (non-fetch) HTML form POSTs: Contact and
 * Catering. Both re-render their page with a success state on success, or
 * (via the validate middleware, upstream) with errors on failure.
 */
const submissionService = require("../services/submission.service");
const locationService = require("../services/location.service");
const contentService = require("../services/content.service");

async function submitContact(req, res) {
  const { name, email, subject, message } = req.body;
  await submissionService.submitContactMessage({ name, email, subject, message });

  const [locationList, faqs, contentBlocks] = await Promise.all([
    locationService.getAllLocations(),
    contentService.getFaqs(),
    contentService.getContentBlocks(),
  ]);

  res.render("contact", {
    title: `Contact — ${contentBlocks.brand?.name || "RollCall Kitchen"}`,
    locations: locationList,
    faqs,
    content: contentBlocks,
    submitted: true,
  });
}

async function submitCatering(req, res) {
  const { name, email, phone, eventDate, guestCount, details } = req.body;
  await submissionService.submitCateringRequest({ name, email, phone, eventDate, guestCount, details });

  const [packages, contentBlocks] = await Promise.all([
    contentService.getCateringPackages(),
    contentService.getContentBlocks(),
  ]);

  res.render("catering", {
    title: `Catering & Events — ${contentBlocks.brand?.name || "RollCall Kitchen"}`,
    packages,
    content: contentBlocks,
    submitted: true,
  });
}

module.exports = { submitContact, submitCatering };
