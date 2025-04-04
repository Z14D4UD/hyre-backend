// server/controllers/reviewController.js
const Review = require('../models/Review');

exports.getBusinessReviews = async (req, res) => {
  try {
    // Ensure the user is a business user
    if (!req.business) {
      return res.status(403).json({ msg: 'Forbidden: Not a business user' });
    }
    // Fetch reviews for the business, sorted by creation date (newest first)
    const reviews = await Review.find({ business: req.business.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching business reviews:', error.stack);
    res.status(500).json({ msg: 'Server error' });
  }
};
