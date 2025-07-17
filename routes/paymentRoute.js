const express = require('express');
const { protect } = require('../middleware/auth');
const { createRazorpayOrder } = require('../controllers/paymentController');

const router = express.Router();

// POST /api/payment/razorpay-order
router.post('/razorpay-order', protect, createRazorpayOrder);

module.exports = router; 