/**
 * src/app.js
 * Builds and configures the Express app (middleware pipeline + routes) but
 * does NOT start listening — that's server.js's job. Separating "build the
 * app" from "run the app" makes the app importable/testable without opening
 * a real port, and keeps process lifecycle concerns out of this file.
 */
const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const logger = require("./config/logger");
const security = require("./middleware/security");
const { generalLimiter } = require("./middleware/rateLimiter");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { rewardsSession } = require("./middleware/rewardsSession");
const { adminSession } = require("./middleware/adminSession");
const contentService = require("./services/content.service");
const locationService = require("./services/location.service");

const pageRoutes = require("./routes/page.routes");
const apiRoutes = require("./routes/api.routes");
const adminRoutes = require("./routes/admin.routes");

// Computed once when the process starts, so it changes on every deploy
// (Railway restarts the process on each deploy) without changing on every
// individual request. Appended as a query string to CSS/JS links (see
// partials/head.ejs) so a long browser/CDN cache lifetime on those files
// (see the static middleware below) can never serve a stale version after
// a deploy — the URL itself changes, so there's nothing stale to serve.
const ASSET_VERSION = Date.now();

function createApp() {
  const app = express();

  // Behind a load balancer / reverse proxy (nginx, ALB, etc.) in production,
  // so req.ip and rate limiting reflect the real client, not the proxy.
  if (env.TRUST_PROXY) app.set("trust proxy", 1);

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));

  app.use(security);
  app.use(compression()); // gzip responses — meaningfully reduces bandwidth under load
  app.use(morgan(env.isProd ? "combined" : "dev", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));

  app.use(express.urlencoded({ extended: true, limit: "100kb" }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser(env.SESSION_SECRET));
  app.use(rewardsSession);
  app.use(adminSession);

  // Static assets, cached aggressively in production since filenames don't
  // change on every deploy here — swap in cache-busted filenames if that changes.
  app.use(
    express.static(path.join(__dirname, "..", "public"), {
      maxAge: env.isProd ? "7d" : 0,
      etag: true,
    })
  );

  app.use(generalLimiter);

  app.use((req, res, next) => {
    res.locals.assetVersion = ASSET_VERSION;
    next();
  });

  // A safe, hardcoded fallback for res.locals.site, set for every single
  // request — including /admin/* ones — before any route can fail. The
  // shared error.ejs/404.ejs templates render the customer-facing
  // header/footer (which reference site.*) regardless of which route
  // family triggered them, but the full DB-backed site lookup below is
  // deliberately skipped for /admin/* routes for performance. Without
  // this early fallback, an admin-panel error had nothing to fall back
  // to and crashed a second time trying to render the error page itself.
  const FALLBACK_SITE = {
    name: "RollCall Kitchen",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    instagram: "#",
    facebook: "#",
    whatsapp: "#",
    doordash: "#",
    ubereats: "#",
    orderUrl: "/menu#build-your-tiffin",
  };
  app.use((req, res, next) => {
    res.locals.site = FALLBACK_SITE;
    next();
  });

  // Admin panel mounted before the customer-facing site-locals middleware
  // below — admin views don't use `site`/customer `currentPath` (they set
  // their own locals in admin.routes.js), so there's no reason to spend a
  // content_blocks lookup on every admin request.
  app.use("/admin", adminRoutes);

  // Every customer-facing view gets `site` (brand/contact info) and
  // `currentPath` (for nav highlighting) without every controller having
  // to fetch and pass them. res.locals.site already holds the safe
  // fallback set earlier for every route — this middleware just tries to
  // upgrade it to real data for customer-facing pages specifically; if
  // that lookup fails, the earlier fallback is simply left in place.
  app.use(async (req, res, next) => {
    res.locals.currentPath = req.path;
    try {
      const [brand, locations] = await Promise.all([
        contentService.getContentBlock("brand", {}),
        locationService.getAllLocations(),
      ]);
      // Phone and address are the actual restaurant's contact details, not
      // separate marketing copy — so the site-wide header/footer figures
      // pull from the primary (first) location record, the same source
      // the Locations page itself uses. Editing a location in the admin
      // panel now correctly cascades everywhere, instead of only updating
      // the Locations page while the header/footer silently kept a stale
      // duplicate. brand.phone/brand.address remain as a fallback only
      // for the (unlikely) case where no location exists yet.
      const primaryLocation = locations[0];
      res.locals.site = {
        name: brand.name || "RollCall Kitchen",
        tagline: brand.tagline || "",
        phone: (primaryLocation && primaryLocation.phone) || brand.phone || "",
        email: brand.email || "",
        address: (primaryLocation && primaryLocation.address) || brand.address || "",
        instagram: brand.instagram || "#",
        facebook: brand.facebook || "#",
        whatsapp: brand.whatsapp || "#",
        doordash: brand.doordash || "#",
        ubereats: brand.ubereats || "#",
        orderUrl: "/menu#build-your-tiffin",
      };
      next();
    } catch (err) {
      // res.locals.site already holds the early fallback (set above,
      // before this route was even matched) — so the error page
      // triggered by next(err) can still render normally instead of
      // crashing a second time on top of the original failure.
      next(err);
    }
  });

  app.use("/", pageRoutes);
  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;