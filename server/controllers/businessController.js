// server/controllers/businessController.js

const mongoose = require('mongoose');
const Business = require('../models/Business');
const Booking  = require('../models/Booking');
const Car      = require('../models/Car');

// Verify uploaded ID document
exports.verifyID = async (req, res) => {
  const businessId     = req.business?.id;
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

// Fetch stats for business dashboard, with escrow logic
exports.getStats = async (req, res) => {
  if (!req.business) {
    console.error("getStats: req.business is undefined", req);
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const businessId = req.business.id;
  const today      = new Date();

  try {
    // 1) Total revenue (all time)
    const totalRevenueResult = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      { $group:   { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // 2) Total bookings count
    const bookingsCount = await Booking.countDocuments({ business: businessId });

    // 3) Total cars for this business
    const totalCars = await Car.countDocuments({ business: businessId });

    // 4) Distinct rented cars ever
    const rentedCarsResult = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: "$car" } },
      { $count: "count" }
    ]);
    const rentedCars = rentedCarsResult[0]?.count || 0;

    // 5) Active cars right now (booking in-progress)
    const activeCarsResult = await Booking.aggregate([
      { $match: {
          business:  new mongoose.Types.ObjectId(businessId),
          startDate: { $lte: today },
          endDate:   { $gte: today },
          status:    "Active"
      }},
      { $group: { _id: "$car" } },
      { $count: "count" }
    ]);
    const activeCars = activeCarsResult[0]?.count || 0;

    // 6) Available balance: sum of payouts for bookings whose startDate ≤ today and status is Active
    const availResult = await Booking.aggregate([
      { $match: {
          business:  new mongoose.Types.ObjectId(businessId),
          startDate: { $lte: today },
          status:    "Active"
      }},
      { $group: { _id: null, total: { $sum: "$payout" } } }
    ]);
    const availableBalance = availResult[0]?.total || 0;

    // 7) Pending payouts: sum of payouts for future bookings (startDate > today) still Active
    const pendResult = await Booking.aggregate([
      { $match: {
          business:  new mongoose.Types.ObjectId(businessId),
          startDate: { $gt: today },
          status:    "Active"
      }},
      { $group: { _id: null, total: { $sum: "$payout" } } }
    ]);
    const pendingPayouts = pendResult[0]?.total || 0;

    // 8) Rent-status breakdown (for the donut)
    const hiredCount     = await Booking.countDocuments({
      business: businessId,
      startDate: { $lte: today },
      endDate:   { $gte: today },
      status:   "Active"
    });
    const pendingCount   = await Booking.countDocuments({
      business:  businessId,
      startDate: { $gt: today },
      status:    "Active"
    });
    const cancelledCount = await Booking.countDocuments({
      business,
      status: "Cancelled"
    });

    res.json({
      totalRevenue,
      bookings:     bookingsCount,
      rentedCars,
      activeCars,
      balance:      availableBalance, // maps to your front-end "Available Balance"
      pendingPayouts,                 // front-end will read stats.pendingPayouts
      rentStatus: {
        hired:     hiredCount,
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
