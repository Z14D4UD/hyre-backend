// server/models/Listing.js
const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  title: { type: String, required: true },
  description: { type: String },
  make: { type: String },
  model: { type: String },
  year: { type: Number },
  mileage: { type: Number },
  fuelType: { type: String },
  engineSize: { type: String },
  transmission: { type: String },
  pricePerDay: { type: Number },
  availability: { type: String },
  address: { type: String, required: true },
  // Feature flags:
  gps: { type: Boolean, default: false },
  bluetooth: { type: Boolean, default: false },
  heatedSeats: { type: Boolean, default: false },
  parkingSensors: { type: Boolean, default: false },
  backupCamera: { type: Boolean, default: false },
  appleCarPlay: { type: Boolean, default: false },
  androidAuto: { type: Boolean, default: false },
  // Images: an array of image file paths
  images: [{ type: String }],
  terms: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Listing', ListingSchema);
