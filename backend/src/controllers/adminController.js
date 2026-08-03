const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const getAnalytics = catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalEvents = await Event.countDocuments();
  const totalBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
  const totalCancelled = await Booking.countDocuments({ bookingStatus: 'cancelled' });

  // Aggregate total simulated revenue
  const revenueAgg = await Booking.aggregate([
    { $match: { bookingStatus: 'confirmed' } },
    { $group: { _id: null, totalRevenue: { $sum: '$finalAmount' }, totalTicketsSold: { $sum: { $size: '$tickets' } } } },
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
  
  // Get recent 5 bookings for live dashboard feed
  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email')
    .populate('event', 'title date');

  // Get users count by role
  const rolesCount = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const stats = {
    totalUsers,
    totalEvents,
    totalBookings,
    totalCancelled,
    totalRevenue,
    recentBookings,
    rolesCount,
  };

  sendSuccess(res, 200, 'Admin platform analytics retrieved', stats);
});

const getAllUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.role && req.query.role !== 'all') {
    query.role = req.query.role;
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

  sendSuccess(res, 200, 'All registered users fetched', {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'organizer', 'admin'].includes(role)) {
    const err = new Error('Invalid role specified');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  sendSuccess(res, 200, `User role upgraded to ${role.toUpperCase()}`, { user });
});

const getAllEventsAdmin = catchAsync(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 }).populate('organizer', 'name email');
  sendSuccess(res, 200, 'Admin master event inventory retrieved', { events });
});

const updateEventStatusAdmin = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!['published', 'cancelled', 'draft', 'completed'].includes(status)) {
    const err = new Error('Invalid status specified');
    err.statusCode = 400;
    throw err;
  }

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  sendSuccess(res, 200, `Event moderation status changed to ${status.toUpperCase()}`, { event });
});

module.exports = {
  getAnalytics,
  getAllUsers,
  updateUserRole,
  getAllEventsAdmin,
  updateEventStatusAdmin,
};
