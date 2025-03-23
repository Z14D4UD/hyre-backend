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
    const userId = req.customer.id; // assuming auth middleware sets req.customer
    const user = await Customer.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
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

// PUT /api/account - update fields (e.g., transmission)
const updateAccount = async (req, res) => {
  try {
    const userId = req.customer.id;
    const { transmission } = req.body;
    const updated = await Customer.findByIdAndUpdate(
      userId,
      { transmission },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'User not found' });
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
    const userId = req.customer.id;
    const { code } = req.body;
    if (!code) return res.status(400).json({ msg: 'No code provided' });
    // TODO: Look up affiliate by code, update affiliate balance, etc.
    res.json({ msg: 'Affiliate code applied. You get 10% off your next booking!' });
  } catch (error) {
    console.error('Error in useAffiliateCode:', error);
    res.status(500).json({ msg: 'Server error applying affiliate code' });
  }
};

// PUT /api/account/password - change password
const changePassword = async (req, res) => {
  try {
    const userId = req.customer.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ msg: 'Missing old or new password' });
    }
    const user = await Customer.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid old password' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ msg: 'Password updated' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ msg: 'Server error changing password' });
  }
};

// GET /api/account/download - download account data as PDF
const downloadData = async (req, res) => {
  try {
    const userId = req.customer.id;
    const user = await Customer.findById(userId).select('-password').lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set headers to prompt PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="MyHyreData.pdf"');

    // Pipe the PDF document to the response stream
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(18).text('Hyre Account Data', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${user.name || ''}`);
    doc.text(`Email: ${user.email || ''}`);
    doc.text(`Location: ${user.location || 'N/A'}`);
    doc.text(`About: ${user.aboutMe || 'N/A'}`);
    doc.text(`Phone Number: ${user.phoneNumber || 'N/A'}`);
    doc.text(`Transmission: ${user.transmission || 'Not set'}`);
    doc.text(`Points: ${user.points || 0}`);
    if (user.createdAt) {
      doc.text(`Joined: ${new Date(user.createdAt).toLocaleDateString()}`);
    }
    if (user.updatedAt) {
      doc.text(`Updated: ${new Date(user.updatedAt).toLocaleDateString()}`);
    }
    doc.moveDown();
    doc.fontSize(10).text('Thank you for using Hyre!', { align: 'center' });

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error('Error in downloadData:', error);
    res.status(500).json({ msg: 'Server error generating PDF' });
  }
};

// DELETE /api/account - close account
const closeAccount = async (req, res) => {
  try {
    const userId = req.customer.id;
    const deleted = await Customer.findByIdAndDelete(userId);
    if (!deleted) {
      return res.status(404).json({ msg: 'User not found or already deleted' });
    }
    // TODO: Remove associated data (e.g., bookings) if needed
    res.json({ msg: 'Account closed' });
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
