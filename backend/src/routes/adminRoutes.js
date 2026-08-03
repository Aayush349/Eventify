const express = require('express');
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../constants');

const router = express.Router();

// Ensure user is logged in and possesses 'admin' authority
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/events', adminController.getAllEventsAdmin);
router.patch('/events/:id/status', adminController.updateEventStatusAdmin);

module.exports = router;
