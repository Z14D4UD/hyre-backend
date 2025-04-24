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

// Create a new booking
router.post('/', createBooking);

// Fetch all bookings (admin)
router.get('/', getBookings);

// Fetch bookings for the logged-in account
router.get('/my', getMyBookings);
router.get('/customer', getCustomerBookings);

// Download a PDF invoice
router.get('/invoice/:id', generateInvoice);

// Business requests a payout
router.post('/payout', requestPayout);

// **Approve or reject a booking**
// PATCH /bookings/:id/status
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
