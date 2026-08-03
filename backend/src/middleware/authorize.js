const AppError = require('../utils/AppError');

/**
 * Role-based authorization middleware
 * Usage: authorize('admin', 'organizer')
 * Must come AFTER authenticate middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

module.exports = authorize;
