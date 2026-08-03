/**
 * Higher-order function that wraps async route handlers.
 * Eliminates the need for try/catch blocks in every controller.
 *
 * Usage:
 *   router.get('/path', catchAsync(async (req, res, next) => { ... }));
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
