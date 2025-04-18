// server/models/Affiliate.js
const mongoose = require('mongoose');

const AffiliateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  affiliateCode: { type: String, required: true, unique: true },
  earnings: { type: Number, default: 0 },
  // Additional fields for affiliate metrics
  referrals: { type: Number, default: 0 },         // Total number of referrals
  recentReferrals: { type: Number, default: 0 },     // Referrals in the last 30 days
  recentVisits: { type: Number, default: 0 },        // Visits in the last 30 days
  conversions: { type: Number, default: 0 },         // Conversions in the last 30 days
  paidReferrals: { type: Number, default: 0 },       // Number of referrals that resulted in paid earnings
  unpaidEarnings: { type: Number, default: 0 }, 
  aboutMe: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },

  // Earnings pending payment
  totalEarnings: { type: Number, default: 0 },       // Total earnings
  avatarUrl: { type: String }                        // New field for profile picture URL
}, { timestamps: true });

module.exports = mongoose.model('Affiliate', AffiliateSchema);
