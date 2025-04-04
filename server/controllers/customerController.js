// server/controllers/customerController.js
const Customer = require('../models/Customer');

// NEW FUNCTION: Get the current customer's profile
exports.getCustomerProfile = async (req, res) => {
  try {
    // Defensive check: if req.customer is undefined, return an error
    if (!req.customer) {
      return res.status(403).json({ msg: 'Forbidden: Not a customer user' });
    }
    const customerId = req.customer.id;
    const customer = await Customer.findById(customerId).select('-password');
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.json({
      name: customer.name,
      location: customer.location || '',
      joinedDate: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A',
      aboutMe: customer.aboutMe || '',
      phoneNumber: customer.phoneNumber || '',
      email: customer.email, // email is returned as-is
      approvedToDrive: !!customer.approvedToDrive,
      avatarUrl: customer.avatarUrl || ''
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error.stack);
    res.status(500).json({ msg: 'Server error fetching customer profile' });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    // Defensive check: ensure req.customer exists
    if (!req.customer) {
      return res.status(403).json({ msg: 'Forbidden: Not a customer user' });
    }
    const customerId = req.customer.id;
    // Collect fields from req.body including email
    const updateData = {
      name: req.body.name,
      location: req.body.location,
      aboutMe: req.body.aboutMe,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email, // new email update
    };

    if (req.file) {
      updateData.avatarUrl = req.file.path; // e.g., "uploads/avatars/xyz.jpg"
    }

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
    console.error('Error updating profile:', error.stack);
    res.status(500).json({ msg: 'Server error updating profile' });
  }
};
