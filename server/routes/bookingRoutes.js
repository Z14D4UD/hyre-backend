// server/routes/bookingRoutes.js
const express = require('express');
const router  = express.Router();
const authMiddleware    = require('../middlewares/authMiddleware');
const {
  createBooking,
  requestPayout,
  getBookings,
  getMyBookings,
  getCustomerBookings,
  generateInvoice,
  updateBookingStatus
} = require('../controllers/bookingController');
const { deleteBooking } = require('../controllers/deleteBookingController');

// Booking creation must be authenticated
router.post('/', authMiddleware, createBooking);

// Public booking list
router.get('/', getBookings);

// All the routes below also require auth
router.use(authMiddleware);
router.get('/my', getMyBookings);
router.get('/customer', getCustomerBookings);
router.get('/invoice/:id', generateInvoice);
router.post('/payout', requestPayout);

// PATCH status endpoint
router.patch('/:id/status', updateBookingStatus);

// DELETE booking
router.delete('/:id', deleteBooking);

module.exports = router;
