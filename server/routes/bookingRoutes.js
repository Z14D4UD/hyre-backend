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

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/my', getMyBookings);
router.get('/customer', getCustomerBookings);
router.get('/invoice/:id', generateInvoice);
router.post('/payout', requestPayout);

// PATCH status endpoint
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
