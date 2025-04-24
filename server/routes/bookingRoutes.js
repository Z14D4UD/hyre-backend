// server/routes/bookingRoutes.js
const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createBooking,
  requestPayout,
  getBookings,
  getMyBookings,
  getCustomerBookings,
  generateInvoice,
  updateBookingStatus    // ← make sure this is exported from bookingController
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/my', getMyBookings);
router.get('/customer', getCustomerBookings);
router.get('/invoice/:id', generateInvoice);
router.post('/payout', requestPayout);

// NEW: Patch status
router.patch(
  '/:id/status',
  authMiddleware,
  updateBookingStatus
);

module.exports = router;
