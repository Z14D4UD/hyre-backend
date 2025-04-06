// server/controllers/listingController.js
const Listing = require('../models/Listing'); // Make sure you have a Listing model defined

exports.getBusinessListings = async (req, res) => {
  try {
    const businessId = req.business.id;
    // Find all listings that belong to the logged-in business
    const listings = await Listing.find({ business: businessId });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching business listings:', error);
    res.status(500).json({ msg: 'Server error fetching listings' });
  }
};
