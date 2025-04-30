// server/models/Conversation.js
const mongoose = require('mongoose');

/**
 * A conversation can involve customers, businesses, affiliates, or support.
 * We therefore store participants as plain ObjectIds (no rigid ref).
 */
const ConversationSchema = new mongoose.Schema(
  {
    /** every participant’s _id */
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'participantModels'
      }
    ],

    /** parallel array indicating each ID’s model */
    participantModels: [
      {
        type: String,
        enum: ['Customer', 'Business', 'Affiliate', 'Support']
      }
    ],

    /** optional label for the UI */
    name:        { type: String },

    /** last message text – shown in the conversation list */
    lastMessage: { type: String },

    /** links the convo to a booking (so we can find / create by bookingId) */
    bookingId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  },
  { timestamps: true } // adds createdAt + updatedAt
);

module.exports = mongoose.model('Conversation', ConversationSchema);
