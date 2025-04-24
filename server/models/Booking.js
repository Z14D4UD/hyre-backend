// server/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  car:          { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  business:     { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: true },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },
  basePrice:    { type: Number, required: true },
  bookingFee:   { type: Number },
  serviceFee:   { type: Number },
  totalAmount:  { type: Number },
  payout:       { type: Number },
  currency:     { type: String, default: 'usd' },
  affiliate:    { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate' },

  // ← **ADDED**: status so business can Approve/Reject
  status: {
    type: String,
    enum: ['Pending','Approved','Rejected','Cancelled'],
    default: 'Pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
