// server/controllers/accountController.js
const Customer = require('../models/Customer'); // or "User" if your model is named differently
const bcrypt = require('bcryptjs');

// GET /api/account
exports.getAccount = async (req, res) => {
  try {
    const userId = req.customer.id; // or req.user.id if your auth sets it differently
    const user = await Customer.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    // Return relevant fields
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

// PUT /api/account - update fields (e.g. transmission)
exports.updateAccount = async (req, res) => {
  try {
    const userId = req.customer.id;
    const { transmission } = req.body;
    // For example, just updating "transmission"
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
exports.useAffiliateCode = async (req, res) => {
  try {
    const userId = req.customer.id;
    const { code } = req.body;
    if (!code) return res.status(400).json({ msg: 'No code provided' });

    // TODO: Look up affiliate by "code", update affiliate's balance, etc.
    // Example:
    // const affiliate = await Affiliate.findOne({ code });
    // if (!affiliate) return res.status(400).json({ msg: 'Invalid code' });
    // affiliate.balance += <someAmount>;
    // await affiliate.save();

    // Also mark that user has 10% off next booking if needed
    res.json({ msg: 'Affiliate code applied. You get 10% off your next booking!' });
  } catch (error) {
    console.error('Error in useAffiliateCode:', error);
    res.status(500).json({ msg: 'Server error applying affiliate code' });
  }
};

// PUT /api/account/password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.customer.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ msg: 'Missing old or new password' });
    }
    const user = await Customer.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid old password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;
    await user.save();

    res.json({ msg: 'Password updated' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ msg: 'Server error changing password' });
  }
};

// GET /api/account/download
exports.downloadData = async (req, res) => {
  try {
    const userId = req.customer.id;
    const user = await Customer.findById(userId).lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Prepare data
    const dataToDownload = {
      name: user.name,
      email: user.email,
      transmission: user.transmission || '',
      points: user.points || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // etc.
    };

    const jsonStr = JSON.stringify(dataToDownload, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="myData.json"');
    res.send(jsonStr);
  } catch (error) {
    console.error('Error in downloadData:', error);
    res.status(500).json({ msg: 'Server error downloading data' });
  }
};

// DELETE /api/account
exports.closeAccount = async (req, res) => {
  try {
    const userId = req.customer.id;
    const deleted = await Customer.findByIdAndDelete(userId);
    if (!deleted) {
      return res.status(404).json({ msg: 'User not found or already deleted' });
    }
    // TODO: remove any associated bookings, etc.
    res.json({ msg: 'Account closed' });
  } catch (error) {
    console.error('Error in closeAccount:', error);
    res.status(500).json({ msg: 'Server error closing account' });
  }
};
