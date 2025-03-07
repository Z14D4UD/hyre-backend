const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  date: { type: Date, default: Date.now },
  filePath: { type: String } // path to the invoice PDF
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
