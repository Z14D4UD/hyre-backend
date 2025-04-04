// server/controllers/businessProfileController.js
const Business = require('../models/Business');

exports.getBusinessProfile = async (req, res) => {
  try {
    if (!req.business) {
      return res.status(403).json({ msg: 'Not a business user' });
    }
    const business = await Business.findById(req.business.id);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }
    // You might add a "joinedDate" or other fields
    const responseData = {
      ...business.toObject(),
      joinedDate: business.createdAt ? business.createdAt.toLocaleDateString() : 'N/A',
    };
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching business profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateBusinessProfile = async (req, res) => {
  try {
    if (!req.business) {
      return res.status(403).json({ msg: 'Not a business user' });
    }
    const { name, location, aboutMe, phoneNumber, email } = req.body;
    const updateFields = {
      name,
      location,
      aboutMe,
      phoneNumber,
      email
    };
    // If an avatar was uploaded
    if (req.file) {
      updateFields.avatarUrl = `uploads/${req.file.filename}`;
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.business.id,
      { $set: updateFields },
      { new: true }
    );
    if (!updatedBusiness) {
      return res.status(404).json({ msg: 'Business not found' });
    }
    res.json(updatedBusiness);
  } catch (error) {
    console.error('Error updating business profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
