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
const { deleteBooking } = require('../controllers/deleteBookingController');
const authMiddleware    = require('../middlewares/authMiddleware');

// Public booking endpoints
router.post('/', createBooking);
router.get('/', getBookings);

// Protected endpoints (require login)
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
