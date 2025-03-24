// server/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Customer', 'Business', 'Affiliate']
  },
  text: { type: String },
  attachment: { type: String }, // file path if an attachment is uploaded

  // NEW: track which user IDs have read this message
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer' // or if you have a union type, you'll need a different approach
  }],
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
