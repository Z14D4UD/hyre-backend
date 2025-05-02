// server/routes/businessRoutes.js
const express         = require('express');
const router          = express.Router();
const authMiddleware  = require('../middlewares/authMiddleware');
// use the shared uploadMiddleware everywhere:
const upload          = require('../middlewares/uploadMiddleware');

const Business              = require('../models/Business');
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
const { updateBookingStatus } = require('../controllers/bookingController');

/** 
 * VERIFY ID DOCUMENT
 * POST /api/business/verify-id
 */
router.post(
  '/verify-id',
  authMiddleware,
  upload.single('idDocument'),
  verifyID
);

/** DASHBOARD STATS */
router.get('/stats',           authMiddleware, getStats);
router.get('/earnings',        authMiddleware, getEarnings);
router.get('/bookingsOverview',authMiddleware, getBookingsOverview);

/** BUSINESS PROFILE */
router.get( '/me', authMiddleware,                 getBusinessProfile);
router.put( '/me', authMiddleware, upload.single('avatar'), updateBusinessProfile);

/** BOOKING STATUS (shared) */
router.patch('/:id/status', authMiddleware, updateBookingStatus);

module.exports = router;
