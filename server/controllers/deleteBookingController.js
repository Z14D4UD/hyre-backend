// server/controllers/deleteBookingController.js

const Booking = require('../models/Booking');

/**
 * DELETE /api/bookings/:id
 * Only the owning business may delete its booking.
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // ensure only the business that owns it can delete
    if (!req.business || booking.business.toString() !== req.business.id) {
      return res.status(403).json({ msg: 'Forbidden: cannot delete this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    return res.json({ msg: 'Booking removed successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    return res.status(500).json({ msg: 'Server error while deleting booking' });
  }
};
