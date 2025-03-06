const Chat = require('../models/Chats');

// POST /api/chat
// Create and save a new chat message
exports.postChatMessage = async (req, res) => {
  try {
    const { room, sender, message } = req.body;
    if (!room || !sender || !message) {
      return res.status(400).json({ msg: 'Room, sender, and message are required' });
    }
    
    const chatMessage = new Chat({
      room,
      sender,
      message
    });
    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Error posting chat message:', error);
    res.status(500).json({ msg: 'Server error posting chat message' });
  }
};

// GET /api/chat/:room
// Retrieve all chat messages for a specific room
exports.getChatMessages = async (req, res) => {
  try {
    const { room } = req.params;
    if (!room) {
      return res.status(400).json({ msg: 'Room parameter is required' });
    }
    
    const messages = await Chat.find({ room }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error retrieving chat messages:', error);
    res.status(500).json({ msg: 'Server error retrieving chat messages' });
  }
};
