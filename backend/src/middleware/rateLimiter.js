const rateLimit = require('express-rate-limit');

/**
 * Auth routes rate limiter
 * 10 requests per 15 minutes per IP
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    statusCode: 429,
  },
  skip: (req) => process.env.NODE_ENV === 'development', // Skip in dev for easy testing
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    statusCode: 429,
  },
});

module.exports = { authRateLimiter, apiRateLimiter };
