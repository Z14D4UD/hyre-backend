const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['paypal', 'bank'], required: true },
  details: { type: Object, required: true }, // e.g. { paypalEmail: 'user@example.com' } or bank info
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
