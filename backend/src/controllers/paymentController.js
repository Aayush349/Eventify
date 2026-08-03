const paymentService = require('../services/paymentService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const processPayment = catchAsync(async (req, res) => {
  const result = await paymentService.processDemoPayment(req.user.id, req.body);
  sendSuccess(res, 201, 'Demo transaction processed successfully', result);
});

const getMyPayments = catchAsync(async (req, res) => {
  const payments = await paymentService.getUserPayments(req.user.id);
  sendSuccess(res, 200, 'Payment history retrieved', { payments });
});

module.exports = {
  processPayment,
  getMyPayments,
};
