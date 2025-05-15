// server/controllers/customerController.js
const path     = require('path');        // ✨ NEW: required for relative path helper
const Customer = require('../models/Customer');

// GET /api/customer/profile
exports.getCustomerProfile = async (req, res) => {
  try {
    if (!req.customer) {
      return res.status(403).json({ msg: 'Forbidden: Not a customer user' });
    }
    const customer = await Customer.findById(req.customer.id).select('-password');
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.json({
      name:            customer.name,
      location:        customer.location || '',
      joinedDate:      customer.createdAt
                         ? new Date(customer.createdAt).toLocaleDateString()
                         : 'N/A',
      aboutMe:         customer.aboutMe || '',
      phoneNumber:     customer.phoneNumber || '',
      email:           customer.email,
      approvedToDrive: !!customer.approvedToDrive,
      avatarUrl:       customer.avatarUrl || ''
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ msg: 'Server error fetching customer profile' });
  }
};

// PUT /api/customer/profile
exports.updateCustomerProfile = async (req, res) => {
  try {
    if (!req.customer) {
      return res.status(403).json({ msg: 'Forbidden: Not a customer user' });
    }

    const customerId = req.customer.id;
    const updateData = {
      name:        req.body.name,
      location:    req.body.location,
      aboutMe:     req.body.aboutMe,
      phoneNumber: req.body.phoneNumber,
      email:       req.body.email
    };

    /* ------------------------------------------------------------------ */
    /*   NEW: keep the exact relative path Multer wrote (timestamped)      */
    /* ------------------------------------------------------------------ */
    if (req.file) {
      updateData.avatarUrl = path
        .relative(path.join(__dirname, '..'), req.file.path)   // uploads/avatars/<id>/<ts>.jpg
        .replace(/\\/g, '/');
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
    console.error('Error updating customer profile:', error);
    res.status(500).json({ msg: 'Server error updating customer profile' });
  }
};
