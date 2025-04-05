// server/routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  verifyID,
  getStats,
  getEarnings,
  getBookingsOverview
} = require('../controllers/businessController');
const Business = require('../models/Business');

// Import profile endpoints if any...
const { getBusinessProfile, updateBusinessProfile } = require('../controllers/businessProfileController');
// Import listing controller function
const { createListing } = require('../controllers/businessListingController');

// Import listing creation endpoint
const { createListing } = require('../controllers/businessListingController');

// Existing routes...
router.get('/featured', async (req, res) => {
  try {
    const featured = await Business.find({ isFeatured: true });
    res.json(featured);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/verify-id', authMiddleware, upload.single('idDocument'), verifyID);
router.get('/stats', authMiddleware, getStats);
router.get('/earnings', authMiddleware, getEarnings);
router.get('/bookingsOverview', authMiddleware, getBookingsOverview);

// Business Profile endpoints
router.get('/me', authMiddleware, getBusinessProfile);
router.put('/me', authMiddleware, upload.single('avatar'), updateBusinessProfile);

// NEW: Listing creation endpoint for business users
// NEW: Add Listing endpoint (for multiple images)
router.post('/listings', authMiddleware, upload.array('images', 10), createListing);

module.exports = router;
