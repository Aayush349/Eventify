const eventService = require('../services/eventService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

// ─── Public ───────────────────────────────────────────────────────────────────

const getAllEvents = catchAsync(async (req, res) => {
  const result = await eventService.getAllEvents(req.query);
  sendSuccess(res, 200, 'Events fetched successfully', result);
});

const getFeaturedEvents = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  const events = await eventService.getFeaturedEvents(limit);
  sendSuccess(res, 200, 'Featured events fetched', { events });
});

const searchEvents = catchAsync(async (req, res) => {
  const { q, page, limit } = req.query;
  const result = await eventService.searchEvents(q, page, limit);
  sendSuccess(res, 200, 'Search results', result);
});

const getEventById = catchAsync(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  const related = await eventService.getRelatedEvents(event._id, event.category);
  sendSuccess(res, 200, 'Event fetched successfully', { event, related });
});

// ─── Organizer ────────────────────────────────────────────────────────────────

const createEvent = catchAsync(async (req, res) => {
  const event = await eventService.createEvent(req.user.id, req.body);
  sendSuccess(res, 201, 'Event created as draft', { event });
});

const updateEvent = catchAsync(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.user.id, req.body);
  sendSuccess(res, 200, 'Event updated', { event });
});

const deleteEvent = catchAsync(async (req, res) => {
  await eventService.deleteEvent(req.params.id, req.user.id);
  sendSuccess(res, 200, 'Event cancelled');
});

const publishEvent = catchAsync(async (req, res) => {
  const event = await eventService.publishEvent(req.params.id, req.user.id);
  sendSuccess(res, 200, 'Event published successfully', { event });
});

const uploadEventBanner = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }
  const result = await eventService.uploadEventBanner(req.params.id, req.user.id, req.file.buffer);
  sendSuccess(res, 200, 'Banner uploaded successfully', result);
});

const getOrganizerEvents = catchAsync(async (req, res) => {
  const result = await eventService.getOrganizerEvents(req.user.id, req.query);
  sendSuccess(res, 200, 'Events fetched', result);
});

module.exports = {
  getAllEvents, getFeaturedEvents, searchEvents, getEventById,
  createEvent, updateEvent, deleteEvent, publishEvent,
  uploadEventBanner, getOrganizerEvents,
};
