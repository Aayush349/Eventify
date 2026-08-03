const mongoose = require('mongoose');
const { EVENT_STATUS } = require('../constants/index');

const EVENT_CATEGORIES = [
  'concerts', 'sports', 'theatre', 'comedy',
  'art', 'standup', 'conference', 'festival', 'other',
];

// ─── Sub-schema: Ticket Type ──────────────────────────────────────────────────
const ticketTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0, default: 0 },
  totalSeats: { type: Number, required: true, min: 1 },
  availableSeats: { type: Number },           // set to totalSeats on create
  description: { type: String, trim: true },
  salesEnd: { type: Date },
}, { _id: true });

// ─── Sub-schema: Venue ────────────────────────────────────────────────────────
const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  country: { type: String, default: 'India', trim: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { _id: false });

// ─── Main Event Schema ────────────────────────────────────────────────────────
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: EVENT_CATEGORIES, message: 'Invalid category' },
      lowercase: true,
    },
    tags: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 10,
        message: 'Maximum 10 tags allowed',
      },
      default: [],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
    venue: {
      type: venueSchema,
      required: [true, 'Venue information is required'],
    },
    date: {
      start: { type: Date, required: [true, 'Start date is required'] },
      end: { type: Date, required: [true, 'End date is required'] },
      doors: { type: Date },
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.DRAFT,
    },
    bannerImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    ticketTypes: {
      type: [ticketTypeSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one ticket type is required',
      },
    },
    totalCapacity: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ 'date.start': 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ isFeatured: 1, status: 1 });
eventSchema.index({ title: 'text', description: 'text', 'venue.city': 'text' });

// ─── Pre-save: auto-generate slug + sync availableSeats ──────────────────────
eventSchema.pre('save', function (next) {
  // Slug from title + short id
  if (this.isModified('title') || this.isNew) {
    const base = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60);
    this.slug = `${base}-${Date.now().toString(36)}`;
  }

  // Sync availableSeats to totalSeats on new ticket types
  if (this.isModified('ticketTypes')) {
    this.ticketTypes.forEach((t) => {
      if (t.availableSeats === undefined || t.availableSeats === null) {
        t.availableSeats = t.totalSeats;
      }
    });
    this.totalCapacity = this.ticketTypes.reduce((sum, t) => sum + t.totalSeats, 0);
  }

  next();
});

// ─── Virtual: minPrice ────────────────────────────────────────────────────────
eventSchema.virtual('minPrice').get(function () {
  if (!this.ticketTypes?.length) return 0;
  return Math.min(...this.ticketTypes.map((t) => t.price));
});

// ─── Virtual: isSoldOut ───────────────────────────────────────────────────────
eventSchema.virtual('isSoldOut').get(function () {
  if (!this.ticketTypes?.length) return false;
  return this.ticketTypes.every((t) => t.availableSeats === 0);
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
