// server/models/Customer.js
const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String },
  aboutMe: { type: String },
  phoneNumber: { type: String },
  approvedToDrive: { type: Boolean, default: false },
  avatarUrl: { type: String },
  idDocument: { type: String },
  transmission: { type: String }, // ensure transmission field exists
  points: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
