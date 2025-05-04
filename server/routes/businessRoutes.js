// server/routes/bookingRoutes.js
const express        = require('express')
const router         = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const {
  createBooking,
  requestPayout,
  getBookings,
  getMyBookings,
  getCustomerBookings,
  getBookingById,
  generateInvoice,
  updateBookingStatus
} = require('../controllers/bookingController')
const { deleteBooking } = require('../controllers/deleteBookingController')

// Booking creation must be authenticated
router.post('/',               authMiddleware, createBooking)

// Public booking list
router.get('/',                getBookings)

// Payout request
router.post('/payout',         authMiddleware, requestPayout)

// “My” routes (must come *before* any ':id' route)
router.get('/my',              authMiddleware, getMyBookings)
router.get('/customer',        authMiddleware, getCustomerBookings)

// Download invoice PDF (protected)
router.get('/invoice/:id',     authMiddleware, generateInvoice)

// Update booking status
router.patch('/:id/status',    authMiddleware, updateBookingStatus)

// Delete booking
router.delete('/:id',          authMiddleware, deleteBooking)

// Single booking (used by PaymentSuccessPage)
// <-- this must come last so it doesn’t catch '/customer', '/invoice', etc.
router.get('/:id',             authMiddleware, getBookingById)

module.exports = router
