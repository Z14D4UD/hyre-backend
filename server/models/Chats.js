const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  room: { type: String, required: true },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'senderModel', 
    required: true 
  },
  senderModel: { 
    type: String, 
    required: true, 
    enum: ['Customer', 'Business'] 
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);
