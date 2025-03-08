const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middlewares/authMiddlewares');

// Retrieve chat messages for a specific room
router.get('/:room', auth, chatController.getChatMessages);

// Send a chat message
router.post('/send', auth, chatController.sendChatMessage);

module.exports = router;
