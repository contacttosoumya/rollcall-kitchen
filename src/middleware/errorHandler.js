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
  // res.render() is asynchronous — it doesn't throw synchronously into this
  // try block on a template error, it reports failure via callback. A plain
  // try/catch here would never actually catch a broken/erroring view, so we
  // use the explicit callback form instead: if rendering "error" itself
  // fails for any reason, fall back to a minimal inline HTML page rather
  // than letting Express surface a raw stack trace to the visitor.
  res.render(
    "error",
    {
      title: statusCode === 404 ? "Page not found" : "Something went wrong",
      statusCode,
      message: publicMessage,
    },
    (renderErr, html) => {
      if (renderErr) {
        logger.error("Error page itself failed to render", { error: renderErr.message });
        return res
          .type("html")
          .send(
            `<!DOCTYPE html><html><head><title>${statusCode === 404 ? "Page not found" : "Something went wrong"}</title></head>` +
              `<body style="font-family:sans-serif;text-align:center;padding:80px 20px;">` +
              `<h1>${statusCode === 404 ? "Page not found" : "Something went wrong"}</h1>` +
              `<p>${publicMessage}</p><p><a href="/">Back home</a></p></body></html>`
          );
      }
      res.send(html);
    }
  );
}

module.exports = { AppError, notFoundHandler, errorHandler };