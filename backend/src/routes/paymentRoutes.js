const express = require('express');
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.post('/process', paymentController.processPayment);
router.get('/history', paymentController.getMyPayments);

module.exports = router;
