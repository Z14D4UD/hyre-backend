const mongoose = require('mongoose');
const Business = require('../models/Business');
const Booking  = require('../models/Booking');
const Car      = require('../models/Car');

// Verify uploaded ID document
exports.verifyID = async (req, res) => {
  const businessId = req.business?.id;
  const idDocumentPath = req.file ? req.file.path : '';
  if (!idDocumentPath) {
    return res.status(400).json({ msg: 'No ID document uploaded' });
  }
  try {
    const business = await Business.findByIdAndUpdate(
      businessId,
      { idDocument: idDocumentPath, verified: true },
      { new: true }
    );
    res.json({ msg: 'ID verified successfully', business });
  } catch (error) {
    console.error('Error in verifyID:', error.stack);
    res.status(500).send('Server error');
  }
};

// Fetch stats for business dashboard
exports.getStats = async (req, res) => {
  if (!req.business) {
    console.error("getStats: req.business is undefined", req);
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const businessId = req.business.id;
  const today      = new Date();

  try {
    // 1) Total revenue
    const totalRevenueResult = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // 2) Total bookings count
    const bookings = await Booking.countDocuments({ business: businessId });

    // 3) Total cars for this business
    const totalCars = await Car.countDocuments({ business: businessId });

    // 4) Rented cars ever (distinct)
    const rentedCarsResult = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: "$car" } },
      { $count: "count" }
    ]);
    const rentedCars = rentedCarsResult[0]?.count || 0;

    // 5) Active cars = currently out on booking (startDate ≤ today ≤ endDate)
    const activeCarsResult = await Booking.aggregate([
      { $match: {
          business:  new mongoose.Types.ObjectId(businessId),
          startDate: { $lte: today },
          endDate:   { $gte: today }
      }},
      { $group: { _id: "$car" } },
      { $count: "count" }
    ]);
    const activeCars = activeCarsResult[0]?.count || 0;

    // 6) Business balance
    const businessDoc = await Business.findById(businessId);
    const balance     = businessDoc?.balance ?? 0;

    // 7) Rent-status breakdown
    const pendingCount   = await Booking.countDocuments({
      business:  businessId,
      startDate: { $gt: today }
    });
    const cancelledCount = await Booking.countDocuments({
      business: businessId,
      endDate:  { $lt: today }
    });

    res.json({
      totalRevenue,
      bookings,
      rentedCars,
      activeCars,
      balance,
      rentStatus: {
        hired:     activeCars,
        pending:   pendingCount,
        cancelled: cancelledCount
      }
    });
  } catch (error) {
    console.error('Error in getStats:', error.stack);
    res.status(500).json({ msg: 'Server error while fetching stats' });
  }
};

// Fetch monthly earnings for chart
exports.getEarnings = async (req, res) => {
  if (!req.business) {
    console.error("getEarnings: req.business is undefined", req);
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const businessId = req.business.id;

  try {
    const earnings = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      {
        $group: {
          _id: { $month: "$startDate" },
          totalEarnings: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthlyEarnings = Array(12).fill(0);
    earnings.forEach(item => {
      monthlyEarnings[item._id - 1] = item.totalEarnings;
    });
    res.json(monthlyEarnings);
  } catch (error) {
    console.error('Error in getEarnings:', error.stack);
    res.status(500).json({ msg: 'Server error while fetching earnings' });
  }
};

// Fetch monthly bookings count for chart
exports.getBookingsOverview = async (req, res) => {
  if (!req.business) {
    console.error("getBookingsOverview: req.business is undefined", req);
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const businessId = req.business.id;

  try {
    const bookingsOverview = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      {
        $group: {
          _id: { $month: "$startDate" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthlyBookings = Array(12).fill(0);
    bookingsOverview.forEach(item => {
      monthlyBookings[item._id - 1] = item.count;
    });
    res.json(monthlyBookings);
  } catch (error) {
    console.error('Error in getBookingsOverview:', error.stack);
    res.status(500).json({ msg: 'Server error while fetching bookings overview' });
  }
};
