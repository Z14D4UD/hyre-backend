// server/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // For advanced usage, we might do refPath: 'senderModel',
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Customer', 'Business', 'Affiliate'], 
    // adapt to your logic
  },
  text: { type: String },
  attachment: { type: String }, // file path if an attachment is uploaded

  // If you want advanced read-tracking per message:
  // readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
