// server/routes/bookingRoutes.js
const express         = require('express');
const router          = express.Router();
const authMiddleware  = require('../middlewares/authMiddleware');
const {
  createBooking,
  requestPayout,
  getBookings,
  getMyBookings,
  getCustomerBookings,
  generateInvoice,
  updateBookingStatus
} = require('../controllers/bookingController');

// Create a new booking (customer only)
router.post('/',           authMiddleware, createBooking);

// Fetch all bookings (any authenticated user)
router.get('/',            authMiddleware, getBookings);

// Fetch bookings for current user
router.get('/my',          authMiddleware, getMyBookings);
router.get('/customer',    authMiddleware, getCustomerBookings);

// Download invoice PDF
router.get('/invoice/:id', authMiddleware, generateInvoice);

// Request payout (business only)
router.post('/payout',     authMiddleware, requestPayout);

// Update booking status (business only)
router.patch('/:id/status', authMiddleware, updateBookingStatus);

module.exports = router;
