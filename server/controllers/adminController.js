// server/controllers/adminController.js

const Booking      = require('../models/Booking');
const Customer     = require('../models/Customer');
const Business     = require('../models/Business');
const Affiliate    = require('../models/Affiliate');

exports.getStats = async (req, res) => {
  try {
    // total number of bookings
    const totalBookings = await Booking.countDocuments();

    // sum of all bookingFees and serviceFees
    const agg = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookingFees: { $sum: '$bookingFee' },
          totalServiceFees: { $sum: '$serviceFee' },
          totalRevenue:     { $sum: { $add: ['$bookingFee', '$serviceFee'] } }
        }
      }
    ]);
    const { totalBookingFees=0, totalServiceFees=0, totalRevenue=0 } = agg[0] || {};

    // total number of customers, businesses, affiliates
    const totalCustomers  = await Customer.countDocuments();
    const totalBusinesses = await Business.countDocuments();
    const totalAffiliates = await Affiliate.countDocuments();

    res.json({
      totalBookings,
      totalBookingFees,
      totalServiceFees,
      totalRevenue,
      totalCustomers,
      totalBusinesses,
      totalAffiliates
    });
  } catch (err) {
    console.error('admin stats error', err);
    res.status(500).json({ msg: 'Server error fetching admin stats' });
  }
};
