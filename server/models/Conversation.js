// server/models/Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  name: { type: String },
  lastMessage: { type: String },
  updatedAt: { type: Date, default: Date.now },

  // Optional: link to a booking/reservation
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
