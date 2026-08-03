const Joi = require('joi');

const ticketTypeSchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  price: Joi.number().min(0).required(),
  totalSeats: Joi.number().integer().min(1).required(),
  description: Joi.string().trim().max(200).optional().allow(''),
  salesEnd: Joi.date().optional().allow(null),
});

const createEventSchema = Joi.object({
  title: Joi.string().trim().max(120).required().messages({ 'any.required': 'Title is required' }),
  description: Joi.string().max(5000).required().messages({ 'any.required': 'Description is required' }),
  category: Joi.string()
    .valid('concerts', 'sports', 'theatre', 'comedy', 'art', 'standup', 'conference', 'festival', 'other')
    .required(),
  tags: Joi.array().items(Joi.string().trim()).max(10).optional(),
  venue: Joi.object({
    name: Joi.string().trim().required(),
    address: Joi.string().trim().optional().allow(''),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().optional().allow(''),
    country: Joi.string().trim().optional(),
    coordinates: Joi.object({ lat: Joi.number(), lng: Joi.number() }).optional(),
  }).required(),
  date: Joi.object({
    start: Joi.date().greater('now').required().messages({
      'date.greater': 'Start date must be in the future',
    }),
    end: Joi.date().greater(Joi.ref('start')).required().messages({
      'date.greater': 'End date must be after start date',
    }),
    doors: Joi.date().optional().allow(null),
  }).required(),
  ticketTypes: Joi.array().items(ticketTypeSchema).min(1).required().messages({
    'array.min': 'At least one ticket type is required',
  }),
  isFeatured: Joi.boolean().optional(),
});

const updateEventSchema = createEventSchema.fork(
  ['title', 'description', 'category', 'venue', 'date', 'ticketTypes'],
  (schema) => schema.optional()
);

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().allow('', null),
  limit: Joi.number().integer().min(1).max(50).optional().allow('', null),
  category: Joi.string().optional().allow('', null),
  city: Joi.string().optional().allow('', null),
  dateFrom: Joi.date().optional().allow('', null),
  dateTo: Joi.date().optional().allow('', null),
  priceMin: Joi.number().min(0).optional().allow('', null),
  priceMax: Joi.number().min(0).optional().allow('', null),
  sortBy: Joi.string().valid('date_asc', 'date_desc', 'price_asc', 'price_desc', 'popular').optional().allow('', null),
  search: Joi.string().optional().allow('', null),
  status: Joi.string().optional().allow('', null),
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => d.message);
    const mainMessage = errors[0] || 'Validation failed';
    return res.status(400).json({ success: false, message: mainMessage, errors, statusCode: 400 });
  }
  req.body = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Invalid query parameters', errors });
  }
  req.query = value;
  next();
};

module.exports = { createEventSchema, updateEventSchema, querySchema, validate, validateQuery };
