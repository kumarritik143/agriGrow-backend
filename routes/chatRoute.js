const express = require('express');
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getMessages,
  getChatParticipants
} = require('../controllers/chatController');

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/messages/:participantId', protect, getMessages);
router.get('/participants', protect, getChatParticipants);

module.exports = router;