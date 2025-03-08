// File: server/controllers/customerController.js

const Customer = require('../models/Customer');

exports.verifyId = async (req, res) => {
  try {
    // Assuming your auth middleware sets req.customer for a logged in customer
    const customerId = req.customer.id; 
    // Assuming you use multer to handle file uploads and the file is available as req.file
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    // Update the customer's record with the path to the uploaded ID document
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { idDocument: req.file.path },
      { new: true }
    );
    res.json({ msg: 'ID document uploaded successfully', customer: updatedCustomer });
  } catch (error) {
    console.error('Error during ID verification:', error);
    res.status(500).json({ msg: 'Server error during ID verification' });
  }
};
