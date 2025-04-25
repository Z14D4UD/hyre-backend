// server/models/Business.js
const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailConfirmationToken: { type: String },
  verified: { type: Boolean, default: false },

  // AVAILABLE funds the business can withdraw
  balance: { type: Number, default: 0 },

  // NEW: funds held in escrow until pickup date
  pendingBalance: { type: Number, default: 0 },

  isFeatured: { type: Boolean, default: false },
  image: { type: String },
  description: { type: String },
  location: { type: String },
  phoneNumber: { type: String },
  aboutMe: { type: String },
  reminders: [
    {
      title: String,
      description: String,
      dueDate: Date,
    }
  ],
  avatarUrl: { type: String },
  stripeAccountId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);
