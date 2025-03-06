const express = require('express');
const router = express.Router();
const { createBooking, requestPayout, getBookings, getMyBookings, generateInvoice } = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/my', authMiddleware, getMyBookings);
router.post('/payout', authMiddleware, requestPayout);
router.get('/invoice/:id', generateInvoice);

module.exports = router;
