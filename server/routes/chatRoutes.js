// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/chat/' });

const {
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
} = require('../controllers/chatController');

// GET /api/chat/conversations
router.get('/conversations', authMiddleware, getConversations);

// GET /api/chat/conversations/:conversationId/messages
router.get('/conversations/:conversationId/messages', authMiddleware, getMessages);

// POST /api/chat/conversations/:conversationId/messages
router.post(
  '/conversations/:conversationId/messages',
  authMiddleware,
  upload.single('attachment'),
  sendMessage
);

// NEW: PUT /api/chat/conversations/:conversationId/mark-read
router.put(
  '/conversations/:conversationId/mark-read',
  authMiddleware,
  markConversationRead
);

module.exports = router;
