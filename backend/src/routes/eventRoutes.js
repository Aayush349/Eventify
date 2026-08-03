const express = require('express');
const eventController = require('../controllers/eventController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { uploadSingle } = require('../middleware/multer');
const { validate, validateQuery, createEventSchema, updateEventSchema, querySchema } = require('../validators/eventValidator');

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', validateQuery(querySchema), eventController.getAllEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/search', eventController.searchEvents);
router.get('/:id', eventController.getEventById);

// ─── Organizer Routes (Protected) ─────────────────────────────────────────────
router.use(authenticate);
router.use(authorize('organizer', 'admin'));

router.post('/', validate(createEventSchema), eventController.createEvent);
router.patch('/:id', validate(updateEventSchema), eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.patch('/:id/publish', eventController.publishEvent);
router.post('/:id/image', uploadSingle, eventController.uploadEventBanner);

// ─── Organizer: own events list ───────────────────────────────────────────────
router.get('/organizer/my-events', eventController.getOrganizerEvents);

module.exports = router;
