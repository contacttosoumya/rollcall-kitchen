/**
 * src/middleware/errorHandler.js
 * Single place every error in the app funnels through. Renders a friendly
 * page for browser requests, JSON for API/XHR requests, and always logs
 * with enough context to debug — but never leaks stack traces or raw DB
 * error text to the customer.
 */
const env = require("../config/env");
const logger = require("../config/logger");

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

function notFoundHandler(req, res, next) {
  res.status(404);
  if (req.accepts("html")) {
    return res.render("404", { title: `Page not found` });
  }
  return res.json({ ok: false, message: "Not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: err.message,
    ...(env.isDev ? { stack: err.stack } : {}),
  });

  const isApiRequest =
    req.originalUrl.startsWith("/api/") || req.xhr || req.headers.accept?.includes("application/json");

  const publicMessage =
    statusCode < 500 ? err.message : "Something went wrong on our end. Please try again shortly.";

  if (isApiRequest) {
    return res.status(statusCode).json({
      ok: false,
      message: publicMessage,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  res.status(statusCode);
  try {
    return res.render("error", {
      title: statusCode === 404 ? "Page not found" : "Something went wrong",
      statusCode,
      message: publicMessage,
    });
  } catch {
    // If even the error view fails to render, fall back to plain text
    // rather than letting Express crash trying to render a broken template.
    return res.type("text/plain").send(publicMessage);
  }
}

module.exports = { AppError, notFoundHandler, errorHandler };
