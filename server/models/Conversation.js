// server/models/Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  name: { type: String },
  lastMessage: { type: String },
  updatedAt: { type: Date, default: Date.now },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // <-- add this if referencing a booking
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
