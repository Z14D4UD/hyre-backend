// server/routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// use multer directly for uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/businessIds/' });

const { updateBookingStatus } = require('../controllers/bookingController');
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
  deleteListing
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

// Verify business ID
router.post(
  '/verify-id',
  authMiddleware,
  upload.single('idDocument'),
  verifyID
);

// Dashboard endpoints
router.get('/stats', authMiddleware, getStats);
router.get('/earnings', authMiddleware, getEarnings);
router.get('/bookingsOverview', authMiddleware, getBookingsOverview);

// Business Profile endpoints
router.get('/me', authMiddleware, getBusinessProfile);
router.put('/me', authMiddleware, upload.single('avatar'), updateBusinessProfile);

// Listings endpoints
router.post('/listings', authMiddleware, upload.array('images', 10), createListing);
router.get('/listings', authMiddleware, getBusinessListings);
router.get('/listings/:id', authMiddleware, getListingById);
router.put('/listings/:id', authMiddleware, upload.array('images', 10), updateListing);
router.delete('/listings/:id', authMiddleware, deleteListing);

// Booking status update (shared with bookingRoutes too)
router.patch('/:id/status', authMiddleware, updateBookingStatus);

module.exports = router;
