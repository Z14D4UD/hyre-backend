// server/routes/businessRoutes.js
const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// ✨  NEW: reuse the shared upload middleware you fixed earlier
const upload = require('../middlewares/uploadMiddleware');

const { updateBookingStatus } = require('../controllers/bookingController');
const {
  verifyID,
  getStats,
  getEarnings,
  getBookingsOverview
} = require('../controllers/businessController');
const {
  getBusinessProfile,
  updateBusinessProfile
} = require('../controllers/businessProfileController');
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

/* -------------------------------------------------------------------------- */
/*                          ID-verification upload                            */
/* -------------------------------------------------------------------------- */
router.post(
  '/verify-id',
  authMiddleware,
  upload.single('idDocument'),
  verifyID
);

/* -------------------------------------------------------------------------- */
/*                              Dashboard stats                               */
/* -------------------------------------------------------------------------- */
router.get('/stats',            authMiddleware, getStats);
router.get('/earnings',         authMiddleware, getEarnings);
router.get('/bookingsOverview', authMiddleware, getBookingsOverview);

/* -------------------------------------------------------------------------- */
/*                           Business profile CRUD                            */
/* -------------------------------------------------------------------------- */
router.get('/me', authMiddleware, getBusinessProfile);
router.put(
  '/me',
  authMiddleware,
  upload.single('avatar'),   // <-- avatar upload now uses the shared middleware
  updateBusinessProfile
);

/* -------------------------------------------------------------------------- */
/*                               Listings CRUD                                */
/* -------------------------------------------------------------------------- */
router.post(
  '/listings',
  authMiddleware,
  upload.array('images', 10),
  createListing
);
router.get('/listings',        authMiddleware, getBusinessListings);
router.get('/listings/:id',    authMiddleware, getListingById);
router.put(
  '/listings/:id',
  authMiddleware,
  upload.array('images', 10),
  updateListing
);
router.delete('/listings/:id', authMiddleware, deleteListing);

/* -------------------------------------------------------------------------- */
/*                       Booking status update endpoint                       */
/* -------------------------------------------------------------------------- */
router.patch('/:id/status', authMiddleware, updateBookingStatus);

module.exports = router;
