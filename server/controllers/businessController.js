// server/controllers/businessController.js
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Booking = require('../models/Booking');
const Car = require('../models/Car');

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

exports.getStats = async (req, res) => {
  if (!req.business) {
    console.error("getStats: req.business is undefined", req);
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const businessId = req.business.id;

  try {
    // 1) Calculate total revenue from bookings
    const totalRevenueResult = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // 2) Count total bookings
    const bookings = await Booking.countDocuments({ business: businessId });

    // 3) Count total cars
    const totalCars = await Car.countDocuments({ business: businessId });

    // 4) Count rented cars
    const rentedCarsResult = await Booking.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: "$car" } },
      { $count: "count" }
    ]);
    const rentedCars = rentedCarsResult[0]?.count || 0;

    // 5) Active cars (for now, assume all are active)
    const activeCars = totalCars;

    // 6) Pull the business record to get the current balance
    const businessDoc = await Business.findById(businessId);
    // If for some reason no doc found, fallback to 0
    const balance = businessDoc?.balance ?? 0;

    // Return all stats in one object
    const stats = {
      totalRevenue,
      rentedCars,
      bookings,
      activeCars,
      balance,
    };
    res.json(stats);
  } catch (error) {
    console.error('Error in getStats:', error.stack);
    res.status(500).json({ msg: 'Server error while fetching stats' });
  }
};

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
