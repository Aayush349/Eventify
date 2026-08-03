const mongoose = require('mongoose');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../constants');

const ticketItemSchema = new mongoose.Schema(
  {
    ticketTypeId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    bookingReference: {
      type: String,
      unique: true,
      index: true,
    },
    tickets: {
      type: [ticketItemSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        'Booking must contain at least one ticket item',
      ],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    promoCode: {
      type: String,
      trim: true,
      default: null,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED, // In Demo mode, orders confirm instantly upon creation
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.SUCCESS, // Simulated Demo mode payment
    },
    paymentMethod: {
      type: String,
      default: 'Demo Gateway (UPI/Card/NetBanking)',
    },
    attendeeDetails: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    checkedIn: {
      type: Boolean,
      default: false,
      index: true,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to auto-generate unique District-style booking reference (e.g., DST-8X4N9Y2Z)
bookingSchema.pre('save', async function (next) {
  if (!this.bookingReference) {
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestampPart = Date.now().toString().slice(-4);
    this.bookingReference = `DST-${randomChars}${timestampPart}`;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
