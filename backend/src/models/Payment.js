const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../constants');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'UPI (Demo Sandbox)',
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.SUCCESS,
      index: true,
    },
    simulationDetails: {
      testCardNumber: { type: String, default: null },
      testUpiId: { type: String, default: null },
      simulatedOutcome: { type: String, default: 'SUCCESS' },
      notes: { type: String, default: 'Processed via District Mock Sandbox' },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to auto-generate transaction ID if missing
paymentSchema.pre('save', async function (next) {
  if (!this.transactionId) {
    const randomChars = Math.random().toString(36).substring(2, 9).toUpperCase();
    this.transactionId = `TXN-DST-${randomChars}`;
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
