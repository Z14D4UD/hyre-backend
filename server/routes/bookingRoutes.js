// server/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createBooking,
  requestPayout,
  getBookings,
  getMyBookings,
  getCustomerBookings,
  generateInvoice
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/my', authMiddleware, getMyBookings); // Handles bookings for all account types
router.get('/customer', authMiddleware, getCustomerBookings); // For customer-specific bookings (if needed)
router.get('/invoice/:id', generateInvoice);
router.post('/payout', authMiddleware, requestPayout);

module.exports = router;
