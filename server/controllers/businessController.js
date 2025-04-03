// server/controllers/businessController.js
const Business = require('../models/Business');

exports.verifyID = async (req, res) => {
  const businessId = req.business.id;
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
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.getStats = async (req, res) => {
  const businessId = req.business.id;
  try {
    // Replace with real queries/calculations
    const stats = {
      totalRevenue: 10000,
      rentedCars: 50,
      bookings: 120,
      activeCars: 10
    };
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error while fetching stats' });
  }
};

exports.getEarnings = async (req, res) => {
  const businessId = req.business.id;
  try {
    // Replace with your aggregation logic
    const earnings = [12000, 14500, 10000, 18500, 21000, 16500, 18000, 22000, 24000, 20000, 25000, 27000];
    res.json(earnings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error while fetching earnings' });
  }
};

exports.getBookingsOverview = async (req, res) => {
  const businessId = req.business.id;
  try {
    // Replace with real monthly booking counts
    const bookingsOverview = [985, 760, 890, 700, 1100, 900, 1200, 950, 780, 650, 1000, 1150];
    res.json(bookingsOverview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error while fetching bookings overview' });
  }
};
