const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { PAYMENT_STATUS, BOOKING_STATUS } = require('../constants');

/**
 * Initiates and processes a simulated demo payment for a booking
 */
const processDemoPayment = async (userId, data) => {
  const { bookingId, paymentMethod, status, simulationDetails } = data;

  const booking = await Booking.findById(bookingId).populate('event');
  if (!booking) {
    const err = new Error('Associated booking record not found');
    err.statusCode = 404;
    throw err;
  }

  // Ensure customer ownership or admin access
  if (booking.user.toString() !== userId.toString()) {
    const err = new Error('Unauthorized to process payment for this booking');
    err.statusCode = 403;
    throw err;
  }

  const isSuccess = status !== PAYMENT_STATUS.FAILED && status !== 'failed';

  // Create payment record in DB
  const payment = await Payment.create({
    user: userId,
    booking: booking._id,
    amount: booking.finalAmount,
    currency: 'INR',
    paymentMethod: paymentMethod || 'UPI (Demo Sandbox)',
    status: isSuccess ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED,
    simulationDetails: {
      ...simulationDetails,
      simulatedOutcome: isSuccess ? 'SUCCESS' : 'FAILED',
    },
  });

  if (isSuccess) {
    booking.paymentStatus = PAYMENT_STATUS.SUCCESS;
    booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
    await booking.save();
  } else {
    booking.paymentStatus = PAYMENT_STATUS.FAILED;
    await booking.save();
  }

  return { payment, booking };
};

/**
 * Retrieves payment transaction history for a user
 */
const getUserPayments = async (userId) => {
  const payments = await Payment.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'booking',
      select: 'bookingReference finalAmount event',
      populate: { path: 'event', select: 'title date venue' },
    });
  return payments;
};

module.exports = {
  processDemoPayment,
  getUserPayments,
};
