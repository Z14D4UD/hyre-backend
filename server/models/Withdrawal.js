// server/models/Withdrawal.js
const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['paypal', 'bank'], required: true },
  details: { type: Object, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
