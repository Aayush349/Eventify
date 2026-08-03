/**
 * Standardized API response helpers
 * Ensures consistent response structure across all endpoints
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Human-readable success message
 * @param {*} data - Response payload
 * @param {Object} [pagination] - Optional pagination metadata
 */
const sendSuccess = (res, statusCode = 200, message, data = null, pagination = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) response.data = data;
  if (pagination) response.pagination = pagination;

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable error message
 * @param {Array} [errors] - Optional array of validation errors
 */
const sendError = (res, statusCode = 500, message, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode,
  };

  if (errors) response.errors = errors;

  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
