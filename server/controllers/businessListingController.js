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

// Import profile controller functions
const { getBusinessProfile, updateBusinessProfile } = require('../controllers/businessProfileController');

// Import listing controller function
const { createListing } = require('../controllers/businessListingController');

// Route to get featured businesses
router.get('/featured', async (req, res) => {
  try {
    const featured = await Business.find({ isFeatured: true });
    res.json(featured);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to verify business ID
router.post('/verify-id', authMiddleware, upload.single('idDocument'), verifyID);

// Dashboard endpoints
router.get('/stats', authMiddleware, getStats);
router.get('/earnings', authMiddleware, getEarnings);
router.get('/bookingsOverview', authMiddleware, getBookingsOverview);

// Business Profile endpoints (for "My Profile" page)
router.get('/me', authMiddleware, getBusinessProfile);
router.put('/me', authMiddleware, upload.single('avatar'), updateBusinessProfile);

// NEW: Listing Creation endpoint (for adding new listings)
// This route allows up to 10 image files to be uploaded under the field name "images"
router.post('/listings', authMiddleware, upload.array('images', 10), createListing);

module.exports = router;
