// server/routes/chatRoutes.js
const express       = require('express');
const router        = express.Router();
const authMiddleware= require('../middlewares/authMiddleware');
const multer        = require('multer');
const upload        = multer({ dest: 'uploads/chat/' });
const {
  getConversations,
  getMessages,
  sendMessage,
  markMessageRead,
  markAllReadInConversation
} = require('../controllers/chatController');

router.get('/conversations',                authMiddleware, getConversations);
router.get('/conversations/:conversationId/messages', authMiddleware, getMessages);
router.post(
  '/conversations/:conversationId/messages',
  authMiddleware,
  upload.single('attachment'),
  sendMessage
);
router.put(
  '/conversations/:conversationId/messages/:messageId/read',
  authMiddleware,
  markMessageRead
);
router.put(
  '/conversations/:conversationId/read',
  authMiddleware,
  markAllReadInConversation
);

module.exports = router;
