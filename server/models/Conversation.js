const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  name: { type: String },
  lastMessage: { type: String },
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null }, // optional reservation id
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
