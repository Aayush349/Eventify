const express = require('express');
const bookingController = require('../controllers/bookingController');
const authenticate = require('../middleware/authenticate');
const { validate, validateQuery, createBookingSchema, queryBookingSchema } = require('../validators/bookingValidator');

const router = express.Router();

// All booking routes require authenticated user session
router.use(authenticate);

// Create a new booking order
router.post('/', validate(createBookingSchema), bookingController.createBooking);

// Get authenticated customer's booking history
router.get('/my-bookings', validateQuery(queryBookingSchema), bookingController.getMyBookings);

// Verify and check in ticket at venue gate (for Organizers/Admins)
router.post('/verify-checkin', bookingController.verifyCheckIn);

// Get specific booking pass by ID
router.get('/:id', bookingController.getBookingById);

// Cancel an active booking
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
