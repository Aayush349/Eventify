const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

/**
 * Passport Google OAuth 2.0 Strategy
 *
 * NOTE: This requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
 * The actual user find/create logic is handled in authController.googleCallback
 * Passport here just retrieves the Google profile
 */
const configurePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth not configured (credentials missing). Will activate when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are provided.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        // Pass profile to controller — actual DB logic is in authService.googleOAuth
        return done(null, profile);
      }
    )
  );

  // Passport session serialization (not using sessions — JWT only)
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  console.log('✅ Google OAuth configured successfully.');
};

module.exports = configurePassport;
