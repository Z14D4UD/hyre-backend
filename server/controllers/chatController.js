// server/controllers/chatController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Booking = require('../models/Booking'); // or wherever your reservation is stored

/**
 * GET /api/chat/conversations?filter=all|unread
 * Return the list of conversations for the current user, optionally filtering by unread
 */
exports.getConversations = async (req, res) => {
  try {
    // If you support both business & customer, pick the ID from whichever is set
    const userId = req.customer ? req.customer.id
                  : req.business ? req.business.id
                  : null;

    if (!userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Basic conversation query
    let query = { participants: userId };

    // If user wants to filter by “unread,” find conversations that have at least one unread message for this user
    // For a simple approach, you can store readBy array in each message. We'll do a naive approach:
    //  - get all conversations
    //  - if filter=unread, we only keep those that have at least one message not read by user
    const filter = req.query.filter || 'all'; // e.g. “all” or “unread”

    let conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    // Attach “unreadCount” or “hasUnread” to each conversation
    for (let conv of conversations) {
      // Count messages that do not have userId in readBy
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        'readBy': { $ne: userId }
      });
      conv.unreadCount = unreadCount;
    }

    // If filter=unread, only keep convs with unreadCount>0
    if (filter === 'unread') {
      conversations = conversations.filter((c) => c.unreadCount > 0);
    }

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ msg: 'Server error fetching conversations' });
  }
};

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Return messages in a conversation. Also optionally attach booking/reservation info if the conversation references it
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Optionally fetch conversation to see if there's a booking/reservation
    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    // If conversation has a bookingId, we can fetch the booking details to show
    let bookingDetails = null;
    if (conversation.bookingId) {
      // For example, if your booking is stored in a Booking model
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
 * Create a new message with optional attachment
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.customer ? req.customer.id
                  : req.business ? req.business.id
                  : null;
    const senderModel = req.customer ? 'Customer'
                      : req.business ? 'Business'
                      : null;

    if (!userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const { text } = req.body;

    // Create new message
    const newMessage = new Message({
      conversation: conversationId,
      sender: userId,
      senderModel,
      text: text || '',
      attachment: req.file ? req.file.path : undefined,
      readBy: [userId], // Mark as read by the sender
    });
    await newMessage.save();

    // Update conversation's last message and timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      updatedAt: new Date(),
    });

    res.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ msg: 'Server error sending message' });
  }
};

/**
 * PUT /api/chat/conversations/:conversationId/messages/:messageId/read
 * Mark a single message as read by the current user
 */
exports.markMessageRead = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.customer ? req.customer.id
                  : req.business ? req.business.id
                  : null;

    const message = await Message.findOne({
      _id: messageId,
      conversation: conversationId
    });
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // If userId is not in readBy, add it
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
    const userId = req.customer ? req.customer.id
                  : req.business ? req.business.id
                  : null;

    // Mark all messages in conversation as read
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
