const Joi = require('joi');

const ticketItemSchema = Joi.object({
  ticketTypeId: Joi.string().required().messages({
    'any.required': 'Ticket type ID is required',
  }),
  name: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).max(20).required().messages({
    'number.min': 'Must order at least 1 ticket',
    'number.max': 'Cannot book more than 20 seats per transaction',
  }),
});

const createBookingSchema = Joi.object({
  eventId: Joi.string().required().messages({
    'any.required': 'Event ID is required',
  }),
  tickets: Joi.array().items(ticketItemSchema).min(1).required().messages({
    'array.min': 'Please select at least one ticket to book',
  }),
  promoCode: Joi.string().trim().optional().allow('', null),
  paymentMethod: Joi.string().trim().optional(),
  attendeeDetails: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({ 'any.required': 'Attendee name is required' }),
    email: Joi.string().email().required().messages({ 'any.required': 'Valid attendee email is required' }),
    phone: Joi.string().trim().min(8).max(20).required().messages({ 'any.required': 'Attendee contact number is required' }),
  }).required(),
});

const queryBookingSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
  status: Joi.string().valid('confirmed', 'pending', 'cancelled', 'refunded').optional(),
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
    return res.status(400).json({ success: false, message: 'Invalid query parameters', errors, statusCode: 400 });
  }
  req.query = value;
  next();
};

module.exports = {
  createBookingSchema,
  queryBookingSchema,
  validate,
  validateQuery,
};
