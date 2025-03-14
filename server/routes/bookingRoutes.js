const express = require('express');
const router = express.Router();
const { createBooking, requestPayout, getBookings, getMyBookings, getCustomerBookings, generateInvoice } = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/my', getMyBookings); // for businesses
router.get('/customer', getCustomerBookings); // for customers
router.get('/invoice/:id', generateInvoice);
router.post('/payout', requestPayout);

module.exports = router;
