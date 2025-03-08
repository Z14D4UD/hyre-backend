const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middlewares/authMiddlewares');

// For creating a booking (accessible by both account types)
router.post('/', auth, bookingController.createBooking);

// Business-specific endpoints
router.get('/my', auth, bookingController.getMyBookings);
router.post('/payout', auth, bookingController.requestPayout);

// Customer-specific endpoint
router.get('/customer', auth, bookingController.getCustomerBookings);

// General endpoint to get all bookings (if needed)
router.get('/', auth, bookingController.getBookings);

// Invoice generation endpoint (accessible by both)
router.get('/:id/invoice', auth, bookingController.generateInvoice);

module.exports = router;
