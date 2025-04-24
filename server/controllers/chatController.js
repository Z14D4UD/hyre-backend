// server/controllers/chatController.js

const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const Booking      = require('../models/Booking'); // if you need booking details

/**
 * GET /api/chat/conversations?filter=all|unread&search=...
 * List conversations for current user
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.customer
      ? req.customer.id
      : req.business
      ? req.business.id
      : null;

    if (!userId) return res.status(401).json({ msg: 'Not authorized' });

    let query = { participants: userId };
    const filter     = req.query.filter || 'all';
    const searchTerm = req.query.search;

    if (searchTerm) {
      query.$or = [
        { name:        { $regex: searchTerm, $options: 'i' } },
        { lastMessage: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    let conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    for (let conv of conversations) {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        readBy:       { $ne: userId }
      });
      conv.unreadCount = unreadCount;
    }

    if (filter === 'unread') {
      conversations = conversations.filter(c => c.unreadCount > 0);
    }

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ msg: 'Server error fetching conversations' });
  }
};

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Return all messages and optional booking details
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) return res.status(404).json({ msg: 'Conversation not found' });

    let bookingDetails = null;
    if (conversation.bookingId) {
      bookingDetails = await Booking.findById(conversation.bookingId).lean();
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      conversation,
      messages,
      bookingDetails
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ msg: 'Server error fetching messages' });
  }
};

/**
 * POST /api/chat/conversations/:conversationId/messages
 * Send a new message (with optional file)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.customer
      ? req.customer.id
      : req.business
      ? req.business.id
      : null;
    const senderModel = req.customer ? 'Customer' : 'Business';

    if (!userId) return res.status(401).json({ msg: 'Not authorized' });

    const { text } = req.body;
    const newMessage = new Message({
      conversation: conversationId,
      sender:       userId,
      senderModel,
      text:         text || '',
      attachment:   req.file?.path,
      readBy:       [userId]
    });
    await newMessage.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      updatedAt:   new Date()
    });

    res.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ msg: 'Server error sending message' });
  }
};

/**
 * PUT /api/chat/conversations/:conversationId/messages/:messageId/read
 * Mark a single message as read
 */
exports.markMessageRead = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.customer
      ? req.customer.id
      : req.business
      ? req.business.id
      : null;
    if (!userId) return res.status(401).json({ msg: 'Not authorized' });

    const message = await Message.findOne({ _id: messageId, conversation: conversationId });
    if (!message) return res.status(404).json({ msg: 'Message not found' });

    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();
    }

    res.json({ msg: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message read:', error);
    res.status(500).json({ msg: 'Server error marking message read' });
  }
};

/**
 * PUT /api/chat/conversations/:conversationId/read
 * Mark all messages in a conversation as read
 */
exports.markAllReadInConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.customer
      ? req.customer.id
      : req.business
      ? req.business.id
      : null;
    if (!userId) return res.status(401).json({ msg: 'Not authorized' });

    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    res.json({ msg: 'All messages in conversation marked as read' });
  } catch (error) {
    console.error('Error marking conversation read:', error);
    res.status(500).json({ msg: 'Server error marking conversation read' });
  }
};
