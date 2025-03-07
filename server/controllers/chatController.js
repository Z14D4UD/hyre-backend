const Chat = require('../models/Chat');

exports.getChatMessages = async (req, res) => {
  try {
    const { room } = req.params;  // room could be a booking ID or a custom chat room identifier
    const messages = await Chat.find({ room }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error retrieving chat messages:', error);
    res.status(500).json({ msg: 'Server error retrieving chat messages' });
  }
};

exports.sendChatMessage = async (req, res) => {
  try {
    const { room, message } = req.body;
    // Determine sender from the auth middleware (req.customer or req.business)
    const sender = req.customer ? req.customer.id : req.business.id;
    const senderModel = req.customer ? 'Customer' : 'Business';
    
    const chatMessage = new Chat({
      room,
      message,
      sender,
      senderModel,
      timestamp: Date.now(),
    });
    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ msg: 'Server error sending chat message' });
  }
};
