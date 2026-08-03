import { axiosPublic, axiosPrivate, API_BASE_URL } from './axiosInstance';

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerAPI = (data) =>
  axiosPublic.post('/auth/register', data);

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginAPI = (data) =>
  axiosPublic.post('/auth/login', data);

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logoutAPI = () =>
  axiosPrivate.post('/auth/logout');

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshTokenAPI = () =>
  axiosPublic.post('/auth/refresh-token');

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getMeAPI = () =>
  axiosPrivate.get('/auth/me');

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPasswordAPI = (email) =>
  axiosPublic.post('/auth/forgot-password', { email });

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPasswordAPI = (token, data) =>
  axiosPublic.post(`/auth/reset-password/${token}`, data);

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePasswordAPI = (data) =>
  axiosPrivate.patch('/auth/change-password', data);

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfileAPI = (data) =>
  axiosPrivate.patch('/auth/update-profile', data);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
// Triggered by redirecting the browser (not an axios call)
export const initiateGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/auth/google`;
};
