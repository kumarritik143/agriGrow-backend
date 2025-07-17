const express = require('express');
const { protect } = require('../middleware/auth');
const { placeOrder, getUserOrders } = require('../controllers/orderController');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/my', protect, getUserOrders);

module.exports = router; 