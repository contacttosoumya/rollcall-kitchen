/**
 * src/middleware/asyncHandler.js
 *
 * Wraps an async route/controller function so a rejected promise (a failed
 * DB query, a bug, anything) is forwarded to Express's error handler via
 * next(err) instead of becoming an unhandled rejection. Without this,
 * a single failing async route can crash the entire process for every
 * customer currently being served, not just the one whose request failed.
 *
 * Usage: router.get('/menu', asyncHandler(menuController.showMenu));
 */
module.exports = function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
