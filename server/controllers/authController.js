// server/controllers/authController.js

const Business = require('../models/Business');
const Customer = require('../models/Customer');
const Affiliate = require('../models/Affiliate');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = () => crypto.randomBytes(20).toString('hex');

exports.signup = async (req, res) => {
  const { name, email, password, accountType } = req.body;
  try {
    if (accountType === 'business') {
      let business = await Business.findOne({ email });
      if (business) return res.status(400).json({ msg: 'Business already exists' });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const emailConfirmationToken = generateToken();
  
      business = new Business({ name, email, password: hashedPassword, emailConfirmationToken });
      await business.save();
  
      const confirmUrl = `${process.env.FRONTEND_URL}/confirm/${emailConfirmationToken}`;
      const message = `Please confirm your email by clicking this link: ${confirmUrl}`;
      await sendEmail({ email: business.email, subject: 'Hyre Account Confirmation', message });
  
      const token = jwt.sign({ id: business._id, accountType: 'business' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({
        token,
        business,
        msg: 'Signup successful. Please check your email to confirm your account.',
        redirectUrl: '/dashboard/business'
      });
    } else if (accountType === 'customer') {
      let customer = await Customer.findOne({ email });
      if (customer) return res.status(400).json({ msg: 'Customer already exists' });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      customer = new Customer({ name, email, password: hashedPassword });
      await customer.save();
  
      const token = jwt.sign({ id: customer._id, accountType: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({
        token,
        customer,
        msg: 'Customer signup successful.',
        redirectUrl: '/dashboard/customer'
      });
    } else if (accountType === 'affiliate') {
      let affiliate = await Affiliate.findOne({ email });
      if (affiliate) return res.status(400).json({ msg: 'Affiliate already exists' });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const affiliateCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  
      affiliate = new Affiliate({ name, email, password: hashedPassword, affiliateCode });
      await affiliate.save();
  
      const token = jwt.sign({ id: affiliate._id, accountType: 'affiliate' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({
        token,
        affiliate,
        msg: 'Affiliate signup successful.',
        redirectUrl: '/dashboard/affiliate'
      });
    } else {
      return res.status(400).json({ msg: 'Invalid account type' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password, accountType } = req.body;
  try {
    if (accountType === 'business') {
      const business = await Business.findOne({ email });
      if (!business) return res.status(400).json({ msg: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, business.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
      const token = jwt.sign({ id: business._id, accountType: 'business' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({
        token,
        business,
        redirectUrl: '/dashboard/business'
      });
    } else if (accountType === 'customer') {
      const customer = await Customer.findOne({ email });
      if (!customer) return res.status(400).json({ msg: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
      const token = jwt.sign({ id: customer._id, accountType: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({
        token,
        customer,
        redirectUrl: '/dashboard/customer'
      });
    } else if (accountType === 'affiliate') {
      const affiliate = await Affiliate.findOne({ email });
      if (!affiliate) return res.status(400).json({ msg: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, affiliate.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
      const token = jwt.sign({ id: affiliate._id, accountType: 'affiliate' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({
        token,
        affiliate,
        redirectUrl: '/dashboard/affiliate'
      });
    } else {
      return res.status(400).json({ msg: 'Invalid account type' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.confirmEmail = async (req, res) => {
  const token = req.params.token;
  try {
    const business = await Business.findOne({ emailConfirmationToken: token });
    if (!business) return res.status(400).json({ msg: 'Invalid or expired token' });
    business.verified = true;
    business.emailConfirmationToken = undefined;
    await business.save();
    res.json({ msg: 'Email confirmed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const business = await Business.findOne({ email });
    if (!business) return res.status(404).json({ msg: 'No account with that email found' });
    const resetToken = generateToken();
    business.resetPasswordToken = resetToken;
    business.resetPasswordExpire = Date.now() + 3600000;
    await business.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`;
    await sendEmail({ email: business.email, subject: 'Hyre Password Reset', message });
    res.json({ msg: 'Password reset link sent to email.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const business = await Business.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!business) return res.status(400).json({ msg: 'Invalid or expired token' });
    const salt = await bcrypt.genSalt(10);
    business.password = await bcrypt.hash(password, salt);
    business.resetPasswordToken = undefined;
    business.resetPasswordExpire = undefined;
    await business.save();
    res.json({ msg: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.googleCallback = (req, res) => {
  const token = jwt.sign({ id: req.user._id, accountType: 'business' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
};
