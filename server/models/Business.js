// server/models/Business.js
const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailConfirmationToken: { type: String },
  verified: { type: Boolean, default: false },
  balance: { type: Number, default: 0 },  // <-- Ensure balance is always a Number
  isFeatured: { type: Boolean, default: false },
  image: { type: String },
  description: { type: String },
  location: { type: String },
  phoneNumber: { type: String },
  aboutMe: { type: String },
  avatarUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);
