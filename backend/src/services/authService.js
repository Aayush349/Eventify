const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AppError = require('../utils/AppError');
const hashToken = require('../utils/hashToken');
const {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} = require('../utils/generateTokens');

/**
 * Register a new user with email/password
 * No OTP — user is logged in immediately after register
 */
const registerUser = async (name, email, password, role = 'customer', userAgent, ip) => {
  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists', 400);
  }

  const validRoles = ['customer', 'organizer', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'customer';

  const user = await User.create({ name, email, password, role: userRole });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = await generateRefreshToken(user._id, userAgent, ip);

  return { user: user.toSafeObject(), accessToken, refreshToken };
};

/**
 * Login with email and password
 */
const loginUser = async (email, password, userAgent, ip) => {
  // Explicitly select password (it's excluded by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.password) {
    throw new AppError(
      'This account uses Google Sign-In. Please log in with Google.',
      400
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been suspended. Contact support.', 403);
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = await generateRefreshToken(user._id, userAgent, ip);

  return { user: user.toSafeObject(), accessToken, refreshToken };
};

/**
 * Handle Google OAuth — find or create user
 */
const googleOAuth = async (profile, userAgent, ip) => {
  const email = profile.emails?.[0]?.value;
  const googleId = profile.id;
  const name = profile.displayName;
  const avatar = profile.photos?.[0]?.value;

  if (!email) {
    throw new AppError('Could not retrieve email from Google account', 400);
  }

  // Check if user exists by googleId or email
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    // Update googleId + avatar if missing
    if (!user.googleId) user.googleId = googleId;
    if (!user.avatar && avatar) user.avatar = avatar;
    await user.save();
  } else {
    // Create new user (no password — Google-only account)
    user = await User.create({ name, email, googleId, avatar });
  }

  if (!user.isActive) {
    throw new AppError('Your account has been suspended. Contact support.', 403);
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = await generateRefreshToken(user._id, userAgent, ip);

  return { user: user.toSafeObject(), accessToken, refreshToken };
};

/**
 * Rotate refresh token — issue new access + refresh token pair
 */
const refreshAccessToken = async (plainRefreshToken, userAgent, ip) => {
  if (!plainRefreshToken) {
    throw new AppError('Refresh token not found. Please log in again.', 401);
  }

  const hashedToken = hashToken(plainRefreshToken);
  const storedToken = await RefreshToken.findOne({ token: hashedToken }).populate('userId');

  if (!storedToken) {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  if (storedToken.expiresAt < new Date()) {
    await storedToken.deleteOne();
    throw new AppError('Refresh token expired. Please log in again.', 401);
  }

  const user = storedToken.userId;

  if (!user || !user.isActive) {
    throw new AppError('User not found or suspended.', 401);
  }

  // Delete old refresh token (rotation)
  await storedToken.deleteOne();

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = await generateRefreshToken(user._id, userAgent, ip);

  return { user: user.toSafeObject(), accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Generate a password reset token and return it
 * The caller (frontend) is responsible for sending the email via EmailJS
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) {
    return { message: 'If this email exists, a reset link has been sent.' };
  }

  // Generate a secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = hashToken(resetToken);

  user.passwordResetToken = hashedResetToken;
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  return {
    message: 'If this email exists, a reset link has been sent.',
    resetToken, // Plain token — frontend uses this to build the reset link for EmailJS
    userName: user.name,
    userEmail: user.email,
  };
};

/**
 * Reset password using the token from the email link
 */
const resetPassword = async (plainToken, newPassword) => {
  const hashedToken = hashToken(plainToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Password reset link is invalid or has expired.', 400);
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpiry = null;
  await user.save();

  // Invalidate all refresh tokens for this user
  await RefreshToken.deleteMany({ userId: user._id });

  return { message: 'Password reset successful. Please log in with your new password.' };
};

/**
 * Change password (authenticated user)
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  if (!user.password) {
    throw new AppError('Cannot change password on a Google-linked account.', 400);
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new AppError('Current password is incorrect', 400);

  user.password = newPassword;
  await user.save();

  // Invalidate all refresh tokens (force re-login)
  await RefreshToken.deleteMany({ userId });

  return { message: 'Password changed successfully. Please log in again.' };
};

/**
 * Logout — delete refresh token from DB and clear cookies
 */
const logout = async (plainRefreshToken, res) => {
  if (plainRefreshToken) {
    const hashedToken = hashToken(plainRefreshToken);
    await RefreshToken.findOneAndDelete({ token: hashedToken });
  }
  clearTokenCookies(res);
};

/**
 * Update user profile fields
 */
const updateProfile = async (userId, updates) => {
  const allowed = ['name', 'avatar'];
  const filtered = Object.keys(updates)
    .filter((key) => allowed.includes(key))
    .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});

  const user = await User.findByIdAndUpdate(userId, filtered, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new AppError('User not found', 404);
  return user.toSafeObject();
};

module.exports = {
  registerUser,
  loginUser,
  googleOAuth,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  updateProfile,
};
