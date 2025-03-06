const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number },
  image: { type: String },
  type: { type: String },
  features: [{ type: String }],
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  availableFrom: { type: Date },
  availableTo: { type: Date },
  price_per_day: { type: Number }
}, { timestamps: true });

CarSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Car', CarSchema);
