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
const { getBusinessProfile, updateBusinessProfile } = require('../controllers/businessProfileController');
const {
  createListing,
  getBusinessListings,
  getListingById,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const Business = require('../models/Business');

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

// Listings endpoints for "My Listings" page
router.post('/listings', authMiddleware, upload.array('images', 10), createListing);
router.get('/listings', authMiddleware, getBusinessListings);
router.get('/listings/:id', authMiddleware, getListingById);
router.put('/listings/:id', authMiddleware, upload.array('images', 10), updateListing);
router.delete('/listings/:id', authMiddleware, deleteListing);

module.exports = router;
