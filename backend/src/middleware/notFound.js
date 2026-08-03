const AppError = require('../utils/AppError');

/**
 * 404 Not Found handler — catches all unmatched routes
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = notFound;
