/**
 * src/middleware/validate.js
 * Runs after an express-validator chain. If validation failed, responds
 * consistently (re-rendering the form with an error for HTML submissions,
 * JSON for API/fetch submissions) instead of letting bad input reach a
 * controller or service.
 */
const { validationResult } = require("express-validator");

function validate(viewName, extraLocalsFn) {
  return async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const messages = errors.array().map((e) => e.msg);
    const isApiRequest =
      req.originalUrl.startsWith("/api/") || req.xhr || req.headers.accept?.includes("application/json");

    if (isApiRequest) {
      return res.status(400).json({ ok: false, message: messages[0], errors: messages });
    }

    if (viewName) {
      try {
        const extraLocals = typeof extraLocalsFn === "function" ? await extraLocalsFn(req) : {};
        return res.status(400).render(viewName, {
          submitted: false,
          formErrors: messages,
          formValues: req.body,
          ...extraLocals,
        });
      } catch (err) {
        return next(err);
      }
    }

    return res.status(400).send(messages[0]);
  };
}

module.exports = validate;
