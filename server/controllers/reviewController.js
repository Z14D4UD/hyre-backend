// server/controllers/reviewController.js
const Review = require('../models/Review');

/**
 * GET /api/business-reviews
 * Returns all reviews for the authenticated business.
 */
exports.getReviewsForBusiness = async (req, res) => {
  try {
    // req.business.id is set by authMiddleware
    const reviews = await Review.find({ business: req.business.id })
      .populate('client', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    console.error('FETCH business reviews err:', err);
    res.status(500).json({ msg: 'Server error fetching business reviews' });
  }
};

/**
 * GET /api/customer-reviews
 * Returns all reviews written by the authenticated customer.
 */
exports.getReviewsForCustomer = async (req, res) => {
  try {
    // req.customer.id is set by authMiddleware
    const reviews = await Review.find({ client: req.customer.id })
      .populate('business', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    console.error('FETCH customer reviews err:', err);
    res.status(500).json({ msg: 'Server error fetching customer reviews' });
  }
};

/**
 * (Optional) POST /api/reviews
 * Create a new review.  Front end can call after booking completion.
 */
exports.createReview = async (req, res) => {
  try {
    const { businessId, rating, comment } = req.body;
    const review = await Review.create({
      business: businessId,
      client:   req.customer?.id,
      rating,
      comment
    });
    res.status(201).json(review);
  } catch (err) {
    console.error('CREATE review err:', err);
    res.status(500).json({ msg: 'Server error creating review' });
  }
};
