// server/models/Car.js
const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  business: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Business', 
    required: true 
  },
  carMake: { type: String, required: true },
  model: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String }, // optional for a full address
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String },
  year: { type: Number },
  mileage: { type: Number },
  features: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Car', CarSchema);
