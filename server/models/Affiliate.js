const mongoose = require('mongoose');

const AffiliateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  affiliateCode: { type: String, required: true, unique: true },
  earnings: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Affiliate', AffiliateSchema);
