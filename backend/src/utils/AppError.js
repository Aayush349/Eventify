/**
 * Custom operational error class
 * Distinguishes our predictable app errors from unexpected system errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag: this is a known, handled error

    // Capture stack trace (excludes this constructor from stack)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
