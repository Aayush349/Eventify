const bookingService = require('../services/bookingService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const createBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body);
  sendSuccess(res, 201, 'Booking confirmed successfully! Your passes are ready.', { booking });
});

const getMyBookings = catchAsync(async (req, res) => {
  const result = await bookingService.getCustomerBookings(req.user.id, req.query);
  sendSuccess(res, 200, 'User bookings fetched successfully', result);
});

const getBookingById = catchAsync(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, 200, 'Booking details retrieved', { booking });
});

const cancelBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, 200, 'Booking has been cancelled and seats restored.', { booking });
});

const verifyCheckIn = catchAsync(async (req, res) => {
  const booking = await bookingService.verifyAndCheckIn(req.body.referenceCode, req.user.id, req.user.role);
  sendSuccess(res, 200, '✅ PASS VALIDATED! Attendee checked in successfully.', { booking });
});

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  verifyCheckIn,
};
