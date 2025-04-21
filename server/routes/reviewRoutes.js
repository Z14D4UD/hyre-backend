// server/routes/reviewRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const ctl     = require('../controllers/reviewController');

// Fetch reviews for the logged‑in business
router.get('/business-reviews', auth, ctl.getReviewsForBusiness);

// Fetch reviews for the logged‑in customer
router.get('/customer-reviews', auth, ctl.getReviewsForCustomer);

// (Optional) Create a new review
router.post('/reviews', auth, ctl.createReview);

module.exports = router;
