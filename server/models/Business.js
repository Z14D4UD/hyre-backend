// server/models/Business.js
const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  /* ── core ──────────────────────────────────────────────── */
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  emailConfirmationToken: { type: String },
  verified: { type: Boolean, default: false },

  /* ── payouts ───────────────────────────────────────────── */
  balance:        { type: Number, default: 0 }, // AVAILABLE for withdrawal
  pendingBalance: { type: Number, default: 0 }, // Held until pickup date

  /* ── new country flag  (ISO-3166 alpha-2, e.g. GB, LB, MA, AE) ── */
  country: { type: String, default: 'GB', maxlength: 2 },

  /* ── misc profile fields (unchanged) ───────────────────── */
  isFeatured:   { type: Boolean, default: false },
  image:        { type: String },
  description:  { type: String },
  location:     { type: String },
  phoneNumber:  { type: String },
  aboutMe:      { type: String },
  reminders: [{
    title: String,
    description: String,
    dueDate: Date
  }],
  avatarUrl: { type: String },
  stripeAccountId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);
