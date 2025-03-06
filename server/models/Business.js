const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  points: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  idDocument: { type: String },
  balance: { type: Number, default: 0 },
  emailConfirmationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  stripe_account_id: { type: String } // For Stripe payouts (if using Stripe Connect)
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);
