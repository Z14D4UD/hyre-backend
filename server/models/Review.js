// server/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  client:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  rating:   { type: Number, required: true },
  comment:  { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
