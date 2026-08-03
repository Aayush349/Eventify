const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const { uploadImage, deleteImage } = require('../utils/uploadToCloudinary');
const { EVENT_STATUS } = require('../constants/index');

// ─── Create Event (draft) ─────────────────────────────────────────────────────
const createEvent = async (organizerId, data) => {
  const event = await Event.create({ ...data, organizer: organizerId, status: EVENT_STATUS.DRAFT });
  return event;
};

// ─── Publish Event ────────────────────────────────────────────────────────────
const publishEvent = async (eventId, organizerId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);
  if (event.organizer.toString() !== organizerId.toString())
    throw new AppError('You do not own this event', 403);
  if (event.status === EVENT_STATUS.PUBLISHED)
    throw new AppError('Event is already published', 400);
  if (new Date(event.date.start) < new Date())
    throw new AppError('Cannot publish an event with a past start date', 400);
  if (!event.ticketTypes?.length)
    throw new AppError('Add at least one ticket type before publishing', 400);

  event.status = EVENT_STATUS.PUBLISHED;
  await event.save();
  return event;
};

// ─── Update Event ─────────────────────────────────────────────────────────────
const updateEvent = async (eventId, organizerId, data) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);
  if (event.organizer.toString() !== organizerId.toString())
    throw new AppError('You do not own this event', 403);
  if (event.status === EVENT_STATUS.CANCELLED)
    throw new AppError('Cannot update a cancelled event', 400);

  Object.assign(event, data);
  await event.save();
  return event;
};

// ─── Cancel / Delete Event ────────────────────────────────────────────────────
const deleteEvent = async (eventId, organizerId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);
  if (event.organizer.toString() !== organizerId.toString())
    throw new AppError('You do not own this event', 403);

  // Delete Cloudinary image
  if (event.bannerImage?.publicId) await deleteImage(event.bannerImage.publicId);

  // Soft delete via status
  event.status = EVENT_STATUS.CANCELLED;
  await event.save();
};

// ─── Upload Banner Image ──────────────────────────────────────────────────────
const uploadEventBanner = async (eventId, organizerId, fileBuffer) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);
  if (event.organizer.toString() !== organizerId.toString())
    throw new AppError('You do not own this event', 403);

  // Delete old image if exists
  if (event.bannerImage?.publicId) await deleteImage(event.bannerImage.publicId);

  const { url, publicId } = await uploadImage(fileBuffer, 'tickethub/events');
  event.bannerImage = { url, publicId };
  await event.save();
  return { url, publicId };
};

// ─── Get All Events (Public, Paginated, Filtered) ─────────────────────────────
const getAllEvents = async (queryParams) => {
  const {
    page = 1, limit = 12, category, city, dateFrom, dateTo,
    priceMin, priceMax, sortBy = 'date_asc', search,
  } = queryParams;

  const filter = { status: EVENT_STATUS.PUBLISHED };

  if (category && category.trim() !== '') filter.category = category.toLowerCase().trim();
  if (city && city.trim() !== '') filter['venue.city'] = { $regex: city.trim(), $options: 'i' };
  if ((dateFrom && dateFrom !== '') || (dateTo && dateTo !== '')) {
    filter['date.start'] = {};
    if (dateFrom && dateFrom !== '') filter['date.start'].$gte = new Date(dateFrom);
    if (dateTo && dateTo !== '') filter['date.start'].$lte = new Date(dateTo);
  }
  if ((priceMin !== undefined && priceMin !== '') || (priceMax !== undefined && priceMax !== '')) {
    filter['ticketTypes.price'] = {};
    if (priceMin !== undefined && priceMin !== '') filter['ticketTypes.price'].$gte = Number(priceMin);
    if (priceMax !== undefined && priceMax !== '') filter['ticketTypes.price'].$lte = Number(priceMax);
  }
  if (search && search.trim() !== '') {
    filter.$text = { $search: search.trim() };
  }

  const sortMap = {
    date_asc: { 'date.start': 1 },
    date_desc: { 'date.start': -1 },
    price_asc: { 'ticketTypes.0.price': 1 },
    price_desc: { 'ticketTypes.0.price': -1 },
    popular: { views: -1 },
  };
  const sort = sortMap[sortBy] || sortMap.date_asc;

  const skip = (Number(page) - 1) * Number(limit);

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('organizer', 'name avatar')
      .select('-description'),
    Event.countDocuments(filter),
  ]);

  return {
    events,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      hasNext: skip + events.length < total,
      hasPrev: Number(page) > 1,
    },
  };
};

// ─── Get Featured Events (Landing Page) ──────────────────────────────────────
const getFeaturedEvents = async (limit = 6) => {
  return Event.find({ isFeatured: true, status: EVENT_STATUS.PUBLISHED })
    .sort({ 'date.start': 1 })
    .limit(limit)
    .populate('organizer', 'name avatar')
    .select('title slug category venue date bannerImage ticketTypes views');
};

// ─── Get Event by ID or Slug ──────────────────────────────────────────────────
const getEventById = async (idOrSlug) => {
  const isId = idOrSlug.match(/^[a-f\d]{24}$/i);
  const filter = isId ? { _id: idOrSlug } : { slug: idOrSlug };

  const event = await Event.findOne(filter).populate('organizer', 'name avatar email');
  if (!event) throw new AppError('Event not found', 404);

  // Increment view count (fire-and-forget, non-blocking)
  Event.findByIdAndUpdate(event._id, { $inc: { views: 1 } }).exec();

  return event;
};

// ─── Get Organizer's Events ───────────────────────────────────────────────────
const getOrganizerEvents = async (organizerId, queryParams = {}) => {
  const { page = 1, limit = 20, status } = queryParams;
  const filter = { organizer: organizerId };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [events, total] = await Promise.all([
    Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Event.countDocuments(filter),
  ]);

  return {
    events,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
  };
};

// ─── Search Events ────────────────────────────────────────────────────────────
const searchEvents = async (query, page = 1, limit = 12) => {
  if (!query?.trim()) return { events: [], pagination: { total: 0 } };

  const filter = { status: EVENT_STATUS.PUBLISHED, $text: { $search: query } };
  const skip = (Number(page) - 1) * Number(limit);

  const [events, total] = await Promise.all([
    Event.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(Number(limit))
      .populate('organizer', 'name avatar')
      .select('-description'),
    Event.countDocuments(filter),
  ]);

  return { events, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } };
};

// ─── Get Related Events ───────────────────────────────────────────────────────
const getRelatedEvents = async (eventId, category, limit = 3) => {
  return Event.find({
    _id: { $ne: eventId },
    category,
    status: EVENT_STATUS.PUBLISHED,
    'date.start': { $gte: new Date() },
  })
    .sort({ 'date.start': 1 })
    .limit(limit)
    .select('title slug category venue date bannerImage ticketTypes');
};

module.exports = {
  createEvent, publishEvent, updateEvent, deleteEvent,
  uploadEventBanner, getAllEvents, getFeaturedEvents,
  getEventById, getOrganizerEvents, searchEvents, getRelatedEvents,
};
