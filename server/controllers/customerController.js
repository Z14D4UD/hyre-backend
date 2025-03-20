// server/controllers/customerController.js

const Customer = require('../models/Customer');

// Existing verifyId function
exports.verifyId = async (req, res) => {
  try {
    const customerId = req.customer.id;
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

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

// NEW FUNCTION: Get the current customer's profile
exports.getCustomerProfile = async (req, res) => {
  try {
    // If your auth middleware sets req.customer, we can use req.customer.id
    // If it sets req.user, then use req.user.id instead.
    const customerId = req.customer.id; // or req.user.id

    const customer = await Customer.findById(customerId).select('-password');
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    // Return the fields your frontend needs
    res.json({
      name: customer.name,
      location: customer.location || '',
      // If you store creation date, you could format a "joinedDate"
      joinedDate: 'March 2025', // or derive from customer.createdAt
      aboutMe: customer.aboutMe || '',
      phoneNumber: customer.phoneNumber || '',
      email: customer.email,
      approvedToDrive: !!customer.approvedToDrive,
      avatarUrl: customer.avatarUrl || ''
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ msg: 'Server error fetching customer profile' });
  }
};
