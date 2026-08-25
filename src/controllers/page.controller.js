/**
 * src/controllers/page.controller.js
 * Renders every server-rendered marketing/ordering page. Each handler's job
 * is to gather exactly the data its view needs from the service layer and
 * render — no SQL, no business rules here.
 */
const menuService = require("../services/menu.service");
const locationService = require("../services/location.service");
const contentService = require("../services/content.service");
const submissionService = require("../services/submission.service");
const rewardsProgramService = require("../services/rewardsProgram.service");
const { buildStaticMapUrl } = require("../utils/staticMap");

async function home(req, res) {
  const [categories, featured, locations, testimonials, gallery, contentBlocks] = await Promise.all([
    menuService.getCategories(),
    menuService.getBestsellers(6),
    locationService.getAllLocations(),
    contentService.getTestimonials(),
    contentService.getGalleryItems(),
    contentService.getContentBlocks(),
  ]);

  const heroDishSlug = contentBlocks.hero_home?.featured_dish_slug;
  const heroDish = heroDishSlug ? await menuService.getFeaturedDish(heroDishSlug) : null;

  const spotlight = locations[0];
  const spotlightMapUrl = spotlight
    ? buildStaticMapUrl({ query: spotlight.mapQuery, width: 640, height: 480, zoom: 15 })
    : null;

  res.render("index", {
    title: `${contentBlocks.brand?.name || "RollCall Kitchen"} — ${contentBlocks.brand?.tagline || ""}`,
    categories,
    featured,
    locations,
    testimonials,
    gallery,
    heroDish,
    spotlightMapUrl,
    content: contentBlocks,
  });
}

async function menu(req, res) {
  const [grouped, categories, contentBlocks] = await Promise.all([
    menuService.getMenuGroupedByCategory(),
    menuService.getCategories(),
    contentService.getContentBlocks(),
  ]);

  res.render("menu", {
    title: `Menu — ${contentBlocks.brand?.name || "RollCall Kitchen"}`,
    categories,
    groupedMenu: grouped,
    content: contentBlocks,
  });
}

async function locations(req, res) {
  const [locationList, contentBlocks] = await Promise.all([
    locationService.getAllLocations(),
    contentService.getContentBlocks(),
  ]);

  const locationsWithMaps = locationList.map((loc) => ({
    ...loc,
    mapUrl: buildStaticMapUrl({ query: loc.mapQuery, width: 640, height: 480, zoom: 15 }),
  }));

  res.render("locations", {
    title: `Locations — ${contentBlocks.brand?.name || "RollCall Kitchen"}`,
    locations: locationsWithMaps,
    content: contentBlocks,
  });
}

async function about(req, res) {
  const [timeline, values, contentBlocks] = await Promise.all([
    contentService.getTimelineEvents(),
    contentService.getValueProps(),
    contentService.getContentBlocks(),
  ]);

  res.render("about", {
    title: `Our Story — ${contentBlocks.brand?.name || "RollCall Kitchen"}`,
    timeline,
    values,
    content: contentBlocks,
  });
}

async function rewards(req, res) {
  const [steps, tiers, catalog, contentBlocks] = await Promise.all([
    contentService.getRewardSteps(),
    contentService.getRewardTiers(),
    rewardsProgramService.getCatalog(),
    contentService.getContentBlocks(),
  ]);

  // If the customer has a valid magic-link session (req.rewardsEmail is set
  // by the rewardsSession middleware), fetch their real balance server-side
  // so the page can render "welcome back" state directly, no client fetch
  // needed.
  let member = null;
  if (req.rewardsEmail) {
    const balance = await submissionService.getRewardsBalance(req.rewardsEmail);
    if (balance) {
      member = { email: req.rewardsEmail, points: balance.points, phone: balance.phone };
    }
  }

  res.render("rewards", {
    title: `Rewards — ${contentBlocks.brand?.name || "RollCall Kitchen"}`,
    steps,
    tiers,
    catalog,
    content: contentBlocks,
    member,
    loginStatus: req.query.login || null,
  });
}

async function cateringPage(req, res) {
  const [packages, contentBlocks] = await Promise.all([
    contentService.getCateringPackages(),
    contentService.getContentBlocks(),
  ]);

  res.render("catering", {
    title: `Catering & Events — ${contentBlocks.brand?.name || "RollCall Kitchen"}`,
    packages,
    content: contentBlocks,
    submitted: false,
  });
}

async function contactPage(req, res) {
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
    submitted: false,
  });
}

module.exports = { home, menu, locations, about, rewards, cateringPage, contactPage };