const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../constants');

/**
 * Validates and creates a new ticket booking, atomically reducing available seats
 */
const createBooking = async (userId, data) => {
  const { eventId, tickets, promoCode, attendeeDetails, paymentMethod } = data;

  // 1. Check if event exists and is published
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  if (event.status !== 'published') {
    const error = new Error('This event is currently not open for bookings');
    error.statusCode = 400;
    throw error;
  }
  if (new Date(event.date.start) < new Date()) {
    const error = new Error('Cannot book tickets for a past event');
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate seat availability and calculate real price from DB (prevent client spoofing)
  const validatedTickets = [];
  let calculatedTotal = 0;

  for (const item of tickets) {
    // Find ticket type in Event model by ID or name
    const ticketTier = event.ticketTypes.id(item.ticketTypeId) || 
                       event.ticketTypes.find((t) => t.name.toLowerCase() === item.name?.toLowerCase());
    
    if (!ticketTier) {
      const error = new Error(`Ticket tier '${item.name || item.ticketTypeId}' does not exist for this event`);
      error.statusCode = 400;
      throw error;
    }

    if (ticketTier.availableSeats < item.quantity) {
      const error = new Error(
        `Only ${ticketTier.availableSeats} seat(s) left for tier '${ticketTier.name}'. Please reduce quantity.`
      );
      error.statusCode = 400;
      throw error;
    }

    // Deduct seats from event inventory
    ticketTier.availableSeats -= item.quantity;

    const subtotal = ticketTier.price * item.quantity;
    calculatedTotal += subtotal;

    validatedTickets.push({
      ticketTypeId: ticketTier._id.toString(),
      name: ticketTier.name,
      price: ticketTier.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  // Save event with updated available seats
  await event.save();

  // 3. Apply Demo Promo Codes
  let discountAmount = 0;
  let cleanPromo = promoCode ? promoCode.trim().toUpperCase() : null;

  if (cleanPromo) {
    if (cleanPromo === 'DISTRICT10' || cleanPromo === 'DISCOUNT10') {
      // 10% off up to ₹500
      discountAmount = Math.min(calculatedTotal * 0.1, 500);
    } else if (cleanPromo === 'WELCOME500' && calculatedTotal >= 1200) {
      // Flat ₹500 off on ₹1200+
      discountAmount = 500;
    } else if (cleanPromo === 'FREEPASS' && calculatedTotal > 0) {
      // Demo testing code: 100% off
      discountAmount = calculatedTotal;
    }
  }

  const finalAmount = Math.max(0, Math.round((calculatedTotal - discountAmount) * 100) / 100);

  // 4. Create and confirm Booking record (Demo mode instant confirmation)
  const booking = await Booking.create({
    user: userId,
    event: event._id,
    tickets: validatedTickets,
    totalAmount: calculatedTotal,
    discountAmount: Math.round(discountAmount * 100) / 100,
    promoCode: discountAmount > 0 ? cleanPromo : null,
    finalAmount,
    bookingStatus: BOOKING_STATUS.CONFIRMED,
    paymentStatus: PAYMENT_STATUS.SUCCESS,
    paymentMethod: paymentMethod || 'Demo Gateway (Instant Pass)',
    attendeeDetails,
  });

  // Populate event details before returning
  await booking.populate('event', 'title slug bannerImage date venue category');
  return booking;
};

/**
 * Retrieves all bookings belonging to a specific customer
 */
const getCustomerBookings = async (userId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { user: userId };
  if (query.status) {
    filter.bookingStatus = query.status;
  }

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('event', 'title slug bannerImage date venue category status');

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Retrieves full details of a specific booking ticket certificate
 */
const getBookingById = async (bookingId, userId, userRole) => {
  const booking = await Booking.findById(bookingId)
    .populate('event', 'title slug description bannerImage date venue category organizer')
    .populate('user', 'name email');

  if (!booking) {
    const error = new Error('Booking record not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure user owns the booking or is an admin/organizer
  if (userRole !== 'admin' && booking.user._id.toString() !== userId.toString()) {
    const error = new Error('Unauthorized to view this booking ticket');
    error.statusCode = 403;
    throw error;
  }

  return booking;
};

/**
 * Cancels an active booking and restores available seats back to the event
 */
const cancelBooking = async (bookingId, userId, userRole) => {
  const booking = await Booking.findById(bookingId).populate('event');
  if (!booking) {
    const error = new Error('Booking record not found');
    error.statusCode = 404;
    throw error;
  }

  if (userRole !== 'admin' && booking.user.toString() !== userId.toString()) {
    const error = new Error('Unauthorized to cancel this booking');
    error.statusCode = 403;
    throw error;
  }

  if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
    const error = new Error('Booking is already cancelled');
    error.statusCode = 400;
    throw error;
  }

  // Restore seats back to the Event inventory
  if (booking.event) {
    const event = await Event.findById(booking.event._id || booking.event);
    if (event && event.ticketTypes) {
      for (const orderedItem of booking.tickets) {
        const ticketTier = event.ticketTypes.id(orderedItem.ticketTypeId) ||
                           event.ticketTypes.find((t) => t.name.toLowerCase() === orderedItem.name.toLowerCase());
        if (ticketTier) {
          ticketTier.availableSeats = Math.min(ticketTier.totalSeats, ticketTier.availableSeats + orderedItem.quantity);
        }
      }
      await event.save();
    }
  }

  booking.bookingStatus = BOOKING_STATUS.CANCELLED;
  booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
  await booking.save();

  await booking.populate('event', 'title slug bannerImage date venue category');
  return booking;
};

/**
 * Verifies and marks a digital QR pass as checked in at venue gate
 */
const verifyAndCheckIn = async (referenceCode, organizerId, userRole) => {
  if (!referenceCode) {
    const error = new Error('Please provide a booking reference ID or ticket hash');
    error.statusCode = 400;
    throw error;
  }
  
  const cleanRef = referenceCode.split('/').pop().trim();
  
  let booking = null;
  if (/^[0-9a-fA-F]{24}$/.test(cleanRef) && !cleanRef.toUpperCase().startsWith('DST-')) {
    booking = await Booking.findById(cleanRef).populate('event');
  } else {
    booking = await Booking.findOne({ bookingReference: cleanRef.toUpperCase() }).populate('event');
  }

  if (!booking) {
    const error = new Error(`Invalid pass code (${cleanRef})! No matching ticket record exists on the platform.`);
    error.statusCode = 404;
    throw error;
  }

  if (userRole === 'organizer' && booking.event?.organizer?.toString() !== organizerId.toString()) {
    const error = new Error('Access Denied: This ticket belongs to an event hosted by a different organizer.');
    error.statusCode = 403;
    throw error;
  }

  if (booking.bookingStatus === BOOKING_STATUS.CANCELLED || booking.bookingStatus === 'cancelled') {
    const error = new Error('🚫 ACCESS DENIED! This ticket pass was CANCELLED and refunded.');
    error.statusCode = 400;
    throw error;
  }

  if (booking.checkedIn) {
    const checkInTime = new Date(booking.checkedInAt || booking.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const error = new Error(`⚠️ DOUBLE ENTRY ALERT! Pass '${booking.bookingReference}' was ALREADY checked in at ${checkInTime}.`);
    error.statusCode = 400;
    throw error;
  }

  booking.checkedIn = true;
  booking.checkedInAt = new Date();
  await booking.save();

  await booking.populate('user', 'name email');
  return booking;
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getBookingById,
  cancelBooking,
  verifyAndCheckIn,
};
