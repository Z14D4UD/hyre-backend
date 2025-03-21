// server/controllers/customerController.js
const Customer = require('../models/Customer');

// Existing verifyId function ...
// exports.verifyId = ...

// NEW FUNCTION: Get the current customer's profile
exports.getCustomerProfile = async (req, res) => {
  try {
    // auth middleware sets req.customer with the logged in customer's id
    const customerId = req.customer.id;
    const customer = await Customer.findById(customerId).select('-password');
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    // Return fields your frontend needs; you can adjust joinedDate as needed
    res.json({
      name: customer.name,
      location: customer.location || '',
      joinedDate: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A',
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
