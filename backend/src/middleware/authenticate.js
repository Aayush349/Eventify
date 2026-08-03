const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * authenticate middleware
 * Reads access token from HTTP-only cookie, verifies it, attaches req.user
 */
const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this route.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
};

module.exports = authenticate;
