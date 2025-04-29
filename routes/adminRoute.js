const express = require('express');
const { adminLogin, createAdmin } = require('../controllers/adminController');

const router = express.Router();

router.post('/login', adminLogin);
router.post('/create', createAdmin);

module.exports = router;