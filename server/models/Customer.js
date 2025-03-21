const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Make sure these fields exist
  location: { type: String },
  aboutMe: { type: String },
  phoneNumber: { type: String },
  approvedToDrive: { type: Boolean, default: false },

  avatarUrl: { type: String },
  idDocument: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
