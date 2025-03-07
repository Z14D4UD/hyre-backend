const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // for customer bookings
  customerName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  basePrice: { type: Number, required: true },
  bookingFee: { type: Number },
  serviceFee: { type: Number },
  totalAmount: { type: Number },
  payout: { type: Number },
  currency: { type: String, default: 'usd' },
});

module.exports = mongoose.model('Booking', BookingSchema);
