const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    // For this example, we support both Customer and Business (adjust as needed)
    const userId = req.customer ? req.customer.id : req.business.id;
    const conversations = await Conversation.find({
      participants: userId,
    }).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ msg: 'Server error fetching conversations' });
  }
};

// GET /api/chat/conversations/:conversationId/messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ msg: 'Server error fetching messages' });
  }
};

// POST /api/chat/conversations/:conversationId/messages
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.customer ? req.customer.id : req.business.id;
    const senderModel = req.customer ? 'Customer' : 'Business';

    const { text } = req.body;
    const newMessage = new Message({
      conversation: conversationId,
      sender: userId,
      senderModel,
      text: text,
      attachment: req.file ? req.file.path : undefined,
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
