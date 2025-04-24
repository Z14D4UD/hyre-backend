// server/controllers/chatController.js
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const Booking      = require('../models/Booking');

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
        { lastMessage: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    let convos = await Conversation.find(query).sort({ updatedAt: -1 }).lean();
    for (let c of convos) {
      c.unreadCount = await Message.countDocuments({
        conversation: c._id,
        readBy:       { $ne: userId },
      });
    }
    if (filter === 'unread') convos = convos.filter(c => c.unreadCount > 0);
    res.json(convos);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ msg: 'Server error fetching conversations' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const convo = await Conversation.findById(conversationId).lean();
    if (!convo) return res.status(404).json({ msg: 'Conversation not found' });

    let bookingDetails = null;
    if (convo.bookingId) {
      bookingDetails = await Booking.findById(convo.bookingId).lean();
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ conversation: convo, messages, bookingDetails });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ msg: 'Server error fetching messages' });
  }
};

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
      attachment:   req.file ? req.file.path : undefined,
      readBy:       [userId],
    });
    await newMessage.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      updatedAt:   new Date(),
    });

    res.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ msg: 'Server error sending message' });
  }
};

exports.markMessageRead = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.customer
      ? req.customer.id
      : req.business
      ? req.business.id
      : null;
    if (!userId) return res.status(401).json({ msg: 'Not authorized' });

    const msg = await Message.findOne({ _id: messageId, conversation: conversationId });
    if (!msg) return res.status(404).json({ msg: 'Message not found' });

    if (!msg.readBy.includes(userId)) {
      msg.readBy.push(userId);
      await msg.save();
    }

    res.json({ msg: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message read:', error);
    res.status(500).json({ msg: 'Server error marking message read' });
  }
};

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
