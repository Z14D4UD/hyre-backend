const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  customerName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  basePrice: { type: Number, required: true },
  bookingFee: { type: Number, required: true },
  serviceFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  payout: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  invoice: { type: String },
  status: { type: String, default: 'booked' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
