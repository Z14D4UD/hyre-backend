const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  idDocument: { type: String } // e.g., file path for the uploaded ID
});

module.exports = mongoose.model('Customer', CustomerSchema);
