/**
 * src/middleware/security.js
 * Helmet configuration tuned for a server-rendered EJS site that also
 * loads Google Fonts and embeds Google Maps iframes — a default/strict CSP
 * would silently break both, so the relevant directives are opened up
 * intentionally rather than disabling CSP entirely.
 */
const helmet = require("helmet");

module.exports = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["'self'", "https://maps.google.com", "https://www.google.com"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
});
