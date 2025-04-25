// server/routes/businessRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const upload  = require('../middlewares/uploadMiddleware');

const {
  verifyID,
  getStats,
  releasePendingPayouts,
  getEarnings,
  getBookingsOverview,
} = require('../controllers/businessController');

const { getBusinessProfile, updateBusinessProfile } = require('../controllers/businessProfileController');
const {
  createListing,
  getBusinessListings,
  getListingById,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');

// featured (public)
router.get('/featured', async (req, res) => {
  const Business = require('../models/Business');
  try {
    const featured = await Business.find({ isFeatured: true });
    res.json(featured);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// require auth for all below
router.use(auth);

// verify ID
router.post('/verify-id', upload.single('idDocument'), verifyID);

// ESCROW: release pending into available
router.post('/release-payouts', releasePendingPayouts);

// dashboard stats
router.get('/stats', getStats);
router.get('/earnings', getEarnings);
router.get('/bookingsOverview', getBookingsOverview);

// profile
router.get('/me', getBusinessProfile);
router.put('/me', upload.single('avatar'), updateBusinessProfile);

// listings
router.post('/listings', upload.array('images', 10), createListing);
router.get('/listings', getBusinessListings);
router.get('/listings/:id', getListingById);
router.put('/listings/:id', upload.array('images', 10), updateListing);
router.delete('/listings/:id', deleteListing);

module.exports = router;
