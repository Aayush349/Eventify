const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const hashToken = require('./hashToken');

/**
 * Generate a signed JWT access token
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

/**
 * Generate a refresh token, hash and persist it in DB
 * Returns the plain (unhashed) token to set in cookie
 */
const generateRefreshToken = async (userId, userAgent = 'unknown', ip = 'unknown') => {
  // Generate a cryptographically secure random token
  const plainToken = crypto.randomBytes(64).toString('hex');
  const hashedToken = hashToken(plainToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Remove existing refresh tokens for this user (single-session per user)
  // Comment out below to allow multi-device login
  await RefreshToken.deleteMany({ userId });

  await RefreshToken.create({
    userId,
    token: hashedToken,
    userAgent,
    ip,
    expiresAt,
  });

  return plainToken;
};

/**
 * Set access + refresh tokens as HTTP-only cookies
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/', // Send cookie on all routes (needed for cross-domain deployments)
  });
};

/**
 * Clear auth cookies on logout
 */
const clearTokenCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOpts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };
  res.clearCookie('accessToken', cookieOpts);
  res.clearCookie('refreshToken', { ...cookieOpts, path: '/' });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
};
