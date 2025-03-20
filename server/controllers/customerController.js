// server/controllers/customerController.js
const Customer = require('../models/Customer');

// Existing verifyId function ...

exports.updateCustomerProfile = async (req, res) => {
  try {
    // auth middleware sets req.customer = { id: decoded.id }
    const customerId = req.customer.id;

    // Collect fields from req.body
    const updateData = {
      name: req.body.name,
      location: req.body.location,
      aboutMe: req.body.aboutMe,
      phoneNumber: req.body.phoneNumber
    };

    // If a new avatar is uploaded, update avatarUrl
    if (req.file) {
      updateData.avatarUrl = req.file.path; // e.g., "uploads/avatars/xyz.jpg"
    }

    // Update customer in DB
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedCustomer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ msg: 'Server error updating profile' });
  }
};
