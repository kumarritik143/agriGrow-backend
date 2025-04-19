// routes/auth.js
const express = require('express');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/me').get(protect, getCurrentUser);

module.exports = router;