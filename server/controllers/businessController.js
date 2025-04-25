// server/controllers/businessController.js

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
    return res.json({ msg: 'ID verified successfully', business });
  } catch (error) {
    console.error('Error in verifyID:', error.stack);
    return res.status(500).send('Server error');
  }
};

// Dashboard stats (including escrow balances)
exports.getStats = async (req, res) => {
  if (!req.business) {
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const businessId = req.business.id;
  const today      = new Date();

  try {
    // Total revenue
    const totalRevenueResult = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Counts
    const bookings     = await Booking.countDocuments({ business: businessId });
    const totalCars    = await Car.countDocuments({ business: businessId });
    const rentedCarsResult = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: "$car" } },
      { $count: "count" }
    ]);
    const rentedCars = rentedCarsResult[0]?.count || 0;
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

    // Balances
    const biz      = await Business.findById(businessId).lean();
    const availableBalance = biz.balance;
    const pendingBalance   = biz.pendingBalance;

    // Rent status breakdown
    const hiredCount     = activeCars;
    const pendingCount   = await Booking.countDocuments({
      business:  businessId,
      startDate: { $gt: today }
    });
    const cancelledCount = await Booking.countDocuments({
      business: businessId,
      endDate:  { $lt: today }
    });

    return res.json({
      totalRevenue,
      bookings,
      rentedCars,
      activeCars,
      availableBalance,
      pendingBalance,
      rentStatus: {
        hired:     hiredCount,
        pending:   pendingCount,
        cancelled: cancelledCount
      }
    });
  } catch (error) {
    console.error('Error in getStats:', error.stack);
    return res.status(500).json({ msg: 'Server error while fetching stats' });
  }
};

// Release escrow into available balance for all started bookings
exports.releasePendingPayouts = async (req, res) => {
  if (!req.business) {
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const bizId = req.business.id;
  try {
    const now = new Date();
    const started = await Booking.find({
      business:  bizId,
      status:    'Active',
      startDate: { $lte: now }
    }).lean();

    const totalToRelease = started.reduce((sum, b) => sum + (b.payout || 0), 0);

    if (totalToRelease > 0) {
      await Business.findByIdAndUpdate(bizId, {
        $inc: {
          pendingBalance: -totalToRelease,
          balance:        totalToRelease
        }
      });
    }

    const biz = await Business.findById(bizId).lean();
    return res.json({
      availableBalance: biz.balance,
      pendingBalance:   biz.pendingBalance
    });
  } catch (error) {
    console.error('Error in releasePendingPayouts:', error);
    return res.status(500).json({ msg: 'Server error while releasing payouts' });
  }
};

// Fetch monthly earnings for chart
exports.getEarnings = async (req, res) => {
  if (!req.business) {
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
    return res.json(monthlyEarnings);
  } catch (error) {
    console.error('Error in getEarnings:', error.stack);
    return res.status(500).json({ msg: 'Server error while fetching earnings' });
  }
};

// Fetch monthly bookings count for chart
exports.getBookingsOverview = async (req, res) => {
  if (!req.business) {
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const businessId = req.business.id;
  try {
    const overview = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      {
        $group: {
          _id: { $month: "$startDate" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthly = Array(12).fill(0);
    overview.forEach(item => {
      monthly[item._id - 1] = item.count;
    });
    return res.json(monthly);
  } catch (error) {
    console.error('Error in getBookingsOverview:', error.stack);
    return res.status(500).json({ msg: 'Server error while fetching bookings overview' });
  }
};
