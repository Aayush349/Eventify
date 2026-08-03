const AppError = require('../utils/AppError');

/**
 * Handle Mongoose CastError (e.g. invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate field error (code 11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: "${value}" for field "${field}". Please use a different value.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose ValidationError
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle invalid JWT
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

/**
 * Handle expired JWT
 */
const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

/**
 * Send detailed error in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    error: err,
  });
};

/**
 * Send clean error in production
 */
const sendErrorProd = (err, res) => {
  // Operational (known) errors: send safe message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  } else {
    // Programming or unknown errors: don't leak details
    console.error('💥 UNHANDLED ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      statusCode: 500,
    });
  }
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message };

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
