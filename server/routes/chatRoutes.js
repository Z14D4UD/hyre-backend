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
  markMessageRead,
  markAllReadInConversation
} = require('../controllers/chatController');

// GET /api/chat/conversations?filter=all|unread
router.get('/conversations', authMiddleware, getConversations);

// GET /api/chat/conversations/:conversationId/messages
router.get('/conversations/:conversationId/messages', authMiddleware, getMessages);

// POST /api/chat/conversations/:conversationId/messages
// with optional attachment
router.post(
  '/conversations/:conversationId/messages',
  authMiddleware,
  upload.single('attachment'),
  sendMessage
);

// PUT /api/chat/conversations/:conversationId/messages/:messageId/read
// Mark a specific message as read
router.put(
  '/conversations/:conversationId/messages/:messageId/read',
  authMiddleware,
  markMessageRead
);

// PUT /api/chat/conversations/:conversationId/read
// Mark all messages in a conversation as read
router.put(
  '/conversations/:conversationId/read',
  authMiddleware,
  markAllReadInConversation
);

module.exports = router;
