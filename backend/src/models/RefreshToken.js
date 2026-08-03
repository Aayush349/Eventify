const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true, // Hashed token — one active per row
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    ip: {
      type: String,
      default: 'unknown',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── TTL index: MongoDB auto-deletes expired tokens ──────────────────────────
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ─── Index on userId for fast lookup ─────────────────────────────────────────
refreshTokenSchema.index({ userId: 1 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;
