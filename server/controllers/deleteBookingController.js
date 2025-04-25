// server/controllers/deleteBookingController.js

const Booking      = require('../models/Booking');
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');

/**
 * DELETE /api/bookings/:id
 * Remove a booking (and its associated chat) entirely.
 */
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    // 1) Delete conversation & messages for this booking
    const convo = await Conversation.findOne({ bookingId: id });
    if (convo) {
      await Message.deleteMany({ conversation: convo._id });
      await convo.deleteOne();
    }

    // 2) Delete the booking
    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.json({ msg: 'Booking and related chat removed.' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ msg: 'Server error deleting booking' });
  }
};
