const express = require('express');
const router = express.Router();
const { postChatMessage, getChatMessages } = require('../controllers/chatController');

// POST endpoint to create a new chat message
router.post('/', postChatMessage);

// GET endpoint to retrieve messages for a specific room
router.get('/:room', getChatMessages);

module.exports = router;
