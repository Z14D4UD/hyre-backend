// server/controllers/businessController.js
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Booking = require('../models/Booking');
const Car = require('../models/Car');

exports.verifyID = async (req, res) => {
  const businessId = req.business?.id;
  const idDocumentPath = req.file ? req.file.path : '';
  if (!idDocumentPath)
    return res.status(400).json({ msg: 'No ID document uploaded' });
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
  // Defensive check: ensure that req.business exists
  if (!req.business) {
    console.error("getStats: req.business is undefined", req);
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const businessId = req.business.id;
  try {
    // Calculate total revenue by summing totalAmount from bookings for this business
    const totalRevenueResult = await Booking.aggregate([
      { $match: { business: mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueResult[0] ? totalRevenueResult[0].total : 0;

    // Count total bookings for this business
    const bookings = await Booking.countDocuments({ business: businessId });

    // Count total cars for this business using the Car model
    const totalCars = await Car.countDocuments({ business: businessId });
    
    // Count rented cars by grouping unique car IDs that have bookings
    const rentedCarsResult = await Booking.aggregate([
      { $match: { business: mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: "$car" } },
      { $count: "count" }
    ]);
    const rentedCars = rentedCarsResult[0] ? rentedCarsResult[0].count : 0;

    // For active cars, assuming all cars are active (adjust if you add an "active" flag)
    const activeCars = totalCars;

    const stats = { totalRevenue, rentedCars, bookings, activeCars };
    res.json(stats);
  } catch (error) {
    console.error('Error in getStats:', error.stack);
    res.status(500).json({ msg: 'Server error while fetching stats' });
  }
};

exports.getEarnings = async (req, res) => {
  // Defensive check
  if (!req.business) {
    console.error("getEarnings: req.business is undefined", req);
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const businessId = req.business.id;
  try {
    // Group bookings by month (based on startDate) and sum totalAmount as earnings
    const earnings = await Booking.aggregate([
      { $match: { business: mongoose.Types.ObjectId(businessId) } },
      {
        $group: {
          _id: { $month: "$startDate" },
          totalEarnings: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    // Prepare an array for 12 months (January = index 0)
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
  // Defensive check
  if (!req.business) {
    console.error("getBookingsOverview: req.business is undefined", req);
    return res.status(403).json({ msg: 'Forbidden: not a business user' });
  }
  const businessId = req.business.id;
  try {
    // Group bookings by month (using startDate) and count them
    const bookingsOverview = await Booking.aggregate([
      { $match: { business: mongoose.Types.ObjectId(businessId) } },
      {
        $group: {
          _id: { $month: "$startDate" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    // Prepare an array for 12 months
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
