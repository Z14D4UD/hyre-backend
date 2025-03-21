// server/controllers/customerController.js
const Customer = require('../models/Customer');

// NEW FUNCTION: Get the current customer's profile
exports.getCustomerProfile = async (req, res) => {
  try {
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
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ msg: 'Server error fetching customer profile' });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    // Log what the server receives in the request body (aboutMe, location, etc.)
    console.log('Received update data (req.body):', req.body);
    // Log any uploaded file data (avatar)
    console.log('Received file (req.file):', req.file);

    const customerId = req.customer.id;

    // Collect fields from req.body including email
    const updateData = {
      name: req.body.name,
      location: req.body.location,
      aboutMe: req.body.aboutMe,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email, // new email update
    };

    // If a new avatar is uploaded, update avatarUrl
    if (req.file) {
      updateData.avatarUrl = req.file.path; // e.g., "uploads/avatars/xyz.jpg"
    }

    // Log what we're sending to Mongoose
    console.log('Update data for Mongoose:', updateData);

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true }
    ).select('-password');

    // Log the result from Mongoose
    console.log('Updated customer from DB:', updatedCustomer);

    if (!updatedCustomer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ msg: 'Server error updating profile' });
  }
};
