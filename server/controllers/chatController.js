// server/controllers/chatController.js

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');

/**
 * GET /api/chat/conversations
 * Return a list of conversations the user is part of,
 * including their unreadCount, lastMessage, updatedAt, etc.
 */
exports.getConversations = async (req, res) => {
  try {
    // Identify the user’s _id (customer or business)
    const userId = req.customer ? req.customer.id : req.business.id;
    if (!userId) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Find conversations where participants.user == userId
    const conversations = await Conversation.find({
      'participants.user': userId,
    })
      .sort({ updatedAt: -1 })
      .lean();

    // We can do a map to figure out the unreadCount for this user
    const results = conversations.map((conv) => {
      // find participant subdoc for this user
      const part = conv.participants.find((p) => p.user.toString() === userId);
      const unreadCount = part ? part.unreadCount : 0;

      return {
        _id: conv._id,
        name: conv.name || 'Conversation',
        lastMessage: conv.lastMessage || '',
        updatedAt: conv.updatedAt,
        // participants: conv.participants, // optional
        unreadCount,
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ msg: 'Server error fetching conversations' });
  }
};

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Return the messages in this conversation
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    // We can also verify that user is part of this conversation, if needed
    // For now, we skip that step.

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ msg: 'Server error fetching messages' });
  }
};

/**
 * POST /api/chat/conversations/:conversationId/messages
 * Send a new message (with optional text + attachment).
 * We'll increment unreadCount for the other participants.
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.customer ? req.customer.id : req.business.id;
    const senderModel = req.customer ? 'Customer' : 'Business';

    const { text } = req.body;
    // If we have an attachment, it's in req.file.path
    const attachmentPath = req.file ? req.file.path : null;

    // Create and save the message
    const newMessage = new Message({
      conversation: conversationId,
      sender: userId,
      senderModel,
      text: text,
      attachment: attachmentPath,
    });
    await newMessage.save();

    // Update conversation:
    // - lastMessage = text (or "Attachment" if text is empty)
    // - updatedAt = now
    // - increment unreadCount for participants who are not sender
    const convo = await Conversation.findById(conversationId);
    if (!convo) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    // lastMessage
    const lastMessageText = text || (attachmentPath ? 'Attachment' : '');
    convo.lastMessage = lastMessageText;
    convo.updatedAt = new Date();

    // Increase unreadCount for the other participants
    convo.participants.forEach((p) => {
      if (p.user.toString() !== userId) {
        p.unreadCount = (p.unreadCount || 0) + 1;
      }
    });

    await convo.save();

    res.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ msg: 'Server error sending message' });
  }
};

/**
 * PUT /api/chat/conversations/:conversationId/mark-read
 * Mark conversation as read for the current user.
 */
exports.markConversationRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.customer ? req.customer.id : req.business.id;

    const convo = await Conversation.findById(conversationId);
    if (!convo) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    // set unreadCount = 0 for this user
    convo.participants.forEach((p) => {
      if (p.user.toString() === userId) {
        p.unreadCount = 0;
      }
    });
    await convo.save();

    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking conversation read:', error);
    res.status(500).json({ msg: 'Server error marking conversation read' });
  }
};
