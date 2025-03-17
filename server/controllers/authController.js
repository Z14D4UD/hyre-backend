// server/controllers/authController.js

const Business = require('../models/Business');
const Customer = require('../models/Customer');
const Affiliate = require('../models/Affiliate');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// ... other required modules (crypto, sendEmail, etc.) remain unchanged

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Try finding the user in Business, then Customer, then Affiliate
    let user = await Business.findOne({ email });
    let accountType = 'business';
    if (!user) {
      user = await Customer.findOne({ email });
      accountType = 'customer';
    }
    if (!user) {
      user = await Affiliate.findOne({ email });
      accountType = 'affiliate';
    }
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id, accountType }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Determine the redirect URL based on account type
    let redirectUrl = '/dashboard';
    if (accountType === 'business') redirectUrl = '/dashboard/business';
    else if (accountType === 'customer') redirectUrl = '/dashboard/customer';
    else if (accountType === 'affiliate') redirectUrl = '/dashboard/affiliate';
    
    return res.json({ token, user, accountType, redirectUrl });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// ... other exports remain unchanged
