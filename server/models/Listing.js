const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  business:           { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  title:              { type: String, required: true },
  description:        { type: String },
  make:               { type: String },
  model:              { type: String },
  carType:            { type: String },
  year:               { type: Number },
  mileage:            { type: Number },
  fuelType:           { type: String },
  status:             { type: String, default: 'Available' },
  engineSize:         { type: String },
  transmission:       { type: String },
  pricePerDay:        { type: Number },
  licensePlate:       { type: String },
  availableFrom:      { type: Date },
  availableTo:        { type: Date },
  address:            { type: String, required: true },
  // Feature flags
  gps:                { type: Boolean, default: false },
  bluetooth:          { type: Boolean, default: false },
  heatedSeats:        { type: Boolean, default: false },
  parkingSensors:     { type: Boolean, default: false },
  backupCamera:       { type: Boolean, default: false },
  appleCarPlay:       { type: Boolean, default: false },
  androidAuto:        { type: Boolean, default: false },
  keylessEntry:       { type: Boolean, default: false },
  childSeat:          { type: Boolean, default: false },
  leatherSeats:       { type: Boolean, default: false },
  tintedWindows:      { type: Boolean, default: false },
  convertible:        { type: Boolean, default: false },
  roofRack:           { type: Boolean, default: false },
  petFriendly:        { type: Boolean, default: false },
  smokeFree:          { type: Boolean, default: false },
  seatCovers:         { type: Boolean, default: false },
  dashCam:            { type: Boolean, default: false },
  // Images: an array of image file paths
  images:             [{ type: String }],
  terms:              { type: String },
  cancellationPolicy: { type: String },  // ← new
}, { timestamps: true });

ListingSchema.index({ address: 'text', title: 'text', make: 'text', model: 'text' });

module.exports = mongoose.model('Listing', ListingSchema);
