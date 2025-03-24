const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    // Support both Customer and Business users
    const userId = req.customer ? req.customer.id : req.business.id;
    const conversations = await Conversation.find({
      participants: userId,
    }).sort({ updatedAt: -1 }).lean();

    // For each conversation, get the count of unread messages for this user
    const updatedConvs = await Promise.all(conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        read: false,
        sender: { $ne: userId }
      });
      return { ...conv, unreadCount };
    }));

    res.json(updatedConvs);
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
    
    // Mark messages as read if they are not sent by the current user
    const userId = req.customer ? req.customer.id : req.business.id;
    await Message.updateMany({
      conversation: conversationId,
      sender: { $ne: userId },
      read: false
    }, { read: true });
    
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
      read: false  // default false
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
