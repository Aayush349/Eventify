const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const { setTokenCookies } = require('../utils/generateTokens');

// ─── Register ─────────────────────────────────────────────────────────────────
const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || 'unknown';

  const { user, accessToken, refreshToken } = await authService.registerUser(
    name, email, password, role, userAgent, ip
  );

  setTokenCookies(res, accessToken, refreshToken);
  sendSuccess(res, 201, 'Account created successfully', { user });
});

// ─── Login ────────────────────────────────────────────────────────────────────
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || 'unknown';

  const { user, accessToken, refreshToken } = await authService.loginUser(
    email, password, userAgent, ip
  );

  setTokenCookies(res, accessToken, refreshToken);
  sendSuccess(res, 200, 'Login successful', { user });
});

// ─── Google OAuth Callback ────────────────────────────────────────────────────
const googleCallback = catchAsync(async (req, res) => {
  // req.user is set by Passport.js after successful OAuth
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || 'unknown';

  const { user, accessToken, refreshToken } = await authService.googleOAuth(
    req.user, userAgent, ip
  );

  setTokenCookies(res, accessToken, refreshToken);

  // Redirect to frontend with success (local vs global)
  const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  const clientUrl = isLocal ? 'http://localhost:5173' : (process.env.CLIENT_URL || 'https://ticket-booking-frontend-1ola.onrender.com');
  res.redirect(`${clientUrl}/auth/google/success`);
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshToken = catchAsync(async (req, res) => {
  const plainRefreshToken = req.cookies?.refreshToken;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || 'unknown';

  const { user, accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(plainRefreshToken, userAgent, ip);

  setTokenCookies(res, accessToken, newRefreshToken);
  sendSuccess(res, 200, 'Token refreshed successfully', { user });
});

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = catchAsync(async (req, res) => {
  const plainRefreshToken = req.cookies?.refreshToken;
  await authService.logout(plainRefreshToken, res);
  sendSuccess(res, 200, 'Logged out successfully');
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);

  // Return reset token + user info so frontend can send via EmailJS
  // In production, only return message (token sent via email server-side)
  sendSuccess(res, 200, result.message, {
    resetToken: result.resetToken,
    userName: result.userName,
    userEmail: result.userEmail,
  });
});

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const result = await authService.resetPassword(token, password);
  sendSuccess(res, 200, result.message);
});

// ─── Change Password ──────────────────────────────────────────────────────────
const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
  sendSuccess(res, 200, result.message);
});

// ─── Get Current User ─────────────────────────────────────────────────────────
const getMe = catchAsync(async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  sendSuccess(res, 200, 'User fetched successfully', { user: user.toSafeObject() });
});

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfile = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  sendSuccess(res, 200, 'Profile updated successfully', { user });
});

module.exports = {
  register,
  login,
  googleCallback,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
};
