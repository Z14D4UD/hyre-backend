// server/models/Conversation.js
const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, 
  // or ref: 'Business' if you also allow businesses
  // or a union approach if you have multiple user types
  unreadCount: { type: Number, default: 0 },
});

const ConversationSchema = new mongoose.Schema({
  participants: [ParticipantSchema], 
  // e.g., [ { user: <ObjectId>, unreadCount: 3 }, ... ]

  name: { type: String },
  lastMessage: { type: String },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
