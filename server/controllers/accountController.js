// server/controllers/accountController.js
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Helper to generate a random token
const generateToken = () => crypto.randomBytes(20).toString('hex');

// GET /api/account
const getAccount = async (req, res) => {
  try {
    const userId = req.customer.id;
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      transmission: user.transmission || '',
      points: user.points || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error in getAccount:', error);
    res.status(500).json({ msg: 'Server error fetching account' });
  }
};

// PUT /api/account
const updateAccount = async (req, res) => {
  try {
    const userId = req.customer.id;
    const { transmission } = req.body;

    // Update the user's transmission field
    const updated = await Customer.findByIdAndUpdate(
      userId,
      { transmission },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Return the updated user data
    res.json({
      _id: updated._id,
      email: updated.email,
      name: updated.name,
      transmission: updated.transmission,
      points: updated.points || 0,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('Error in updateAccount:', error);
    res.status(500).json({ msg: 'Server error updating account' });
  }
};

// POST /api/account/use-affiliate-code
const useAffiliateCode = async (req, res) => {
  try {
    // ...
    res.json({ msg: 'Affiliate code applied. You get 10% off your next booking!' });
  } catch (error) {
    console.error('Error in useAffiliateCode:', error);
    res.status(500).json({ msg: 'Server error applying affiliate code' });
  }
};

// PUT /api/account/password
const changePassword = async (req, res) => {
  try {
    // ...
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ msg: 'Server error changing password' });
  }
};

// GET /api/account/download (PDFKit example)
const downloadData = async (req, res) => {
  try {
    // ...
  } catch (error) {
    console.error('Error in downloadData:', error);
    res.status(500).json({ msg: 'Server error generating PDF' });
  }
};

// DELETE /api/account
const closeAccount = async (req, res) => {
  try {
    // ...
  } catch (error) {
    console.error('Error in closeAccount:', error);
    res.status(500).json({ msg: 'Server error closing account' });
  }
};

module.exports = {
  getAccount,
  updateAccount,
  useAffiliateCode,
  changePassword,
  downloadData,
  closeAccount,
};
