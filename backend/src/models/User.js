const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants/index');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    avatar: {
      type: String,
      default: null,
    },
    // Google OAuth
    googleId: {
      type: String,
      default: null,
      sparse: true, // Allow multiple nulls (unique only for non-null)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Password reset
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance method: compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: safe user object (no sensitive fields) ─────────────────
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    googleId: this.googleId,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);
module.exports = User;
