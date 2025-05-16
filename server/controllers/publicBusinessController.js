// server/controllers/publicBusinessController.js
const Business = require('../models/Business');
const Listing  = require('../models/Listing');

exports.getPublicBusiness = async (req, res) => {
  try {
    const business = await Business
      .findById(req.params.id)
      .select('name location aboutMe avatarUrl createdAt');          // public fields only

    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    const listings = await Listing
      .find({ business: business._id })
      .select('title images pricePerDay trips rating')               // cards need just these
      .lean();

    res.json({ business, listings });
  } catch (err) {
    console.error('getPublicBusiness:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
