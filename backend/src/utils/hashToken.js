const crypto = require('crypto');

/**
 * Hash a token using SHA-256
 * Used to safely store refresh tokens and reset tokens in DB
 * @param {string} token - Plain token
 * @returns {string} - Hex hash
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = hashToken;
