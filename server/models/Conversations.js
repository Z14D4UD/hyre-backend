const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  // For simplicity, we assume participants are Customer IDs (adjust if you also have business conversations)
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  // Optional: store a conversation name (e.g. “Chat with Daud”)
  name: { type: String },
  lastMessage: { type: String },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
