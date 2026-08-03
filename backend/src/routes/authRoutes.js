const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const { authRateLimiter } = require('../middleware/rateLimiter');
const {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} = require('../validators/authValidator');

const router = express.Router();

// Apply rate limiter to all auth routes
router.use(authRateLimiter);

// ─── Public Routes ────────────────────────────────────────────────────────────

// Email / Password Auth
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Password Reset (EmailJS handles email sending from frontend)
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);

// ─── Google OAuth Routes ──────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    const clientUrl = isLocal ? 'http://localhost:5173' : (process.env.CLIENT_URL || 'https://ticket-booking-frontend-1ola.onrender.com');
    passport.authenticate('google', { session: false, failureRedirect: `${clientUrl}/auth/login?error=google_failed` })(req, res, next);
  },
  authController.googleCallback
);

// Success redirect page (frontend reads user from cookie)
router.get('/google/success', (req, res) => {
  const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  const clientUrl = isLocal ? 'http://localhost:5173' : (process.env.CLIENT_URL || 'https://ticket-booking-frontend-1ola.onrender.com');
  res.redirect(`${clientUrl}/customer/dashboard`);
});

// ─── Protected Routes (require valid JWT cookie) ──────────────────────────────
router.use(authenticate); // All routes below are protected

router.get('/me', authController.getMe);
router.patch('/update-profile', validate(updateProfileSchema), authController.updateProfile);
router.patch('/change-password', validate(changePasswordSchema), authController.changePassword);

module.exports = router;
