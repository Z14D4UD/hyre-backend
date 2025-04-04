// server/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getBusinessReviews } = require('../controllers/reviewController');

// Endpoint to get reviews for the logged-in business
router.get('/business-reviews', authMiddleware, getBusinessReviews);

module.exports = router;
