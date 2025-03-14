const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailConfirmationToken: { type: String },
  verified: { type: Boolean, default: false },
  balance: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  image: { type: String },       // URL to a featured image
  description: { type: String }  // Short description
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);
