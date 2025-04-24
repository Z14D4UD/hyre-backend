// server/routes/bookingRoutes.js

const express = require('express');
const router  = express.Router();
const {
  createBooking,
  requestPayout,
  getBookings,
  getMyBookings,
  getCustomerBookings,
  generateInvoice,
  updateBookingStatus
} = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public
router.post('/', createBooking);

// JWT-protected (business must be authenticated)
router.post('/payout', authMiddleware, requestPayout);
router.get('/', authMiddleware, getBookings);
router.get('/my', authMiddleware, getMyBookings);
router.get('/customer', authMiddleware, getCustomerBookings);
router.get('/invoice/:id', authMiddleware, generateInvoice);

// Status change endpoint
router.patch('/:id/status', authMiddleware, updateBookingStatus);

module.exports = router;
