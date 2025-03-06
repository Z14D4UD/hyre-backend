const Business = require('../models/Business');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = () => crypto.randomBytes(20).toString('hex');

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
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

    const token = jwt.sign({ id: business._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, business, msg: 'Signup successful. Please check your email to confirm your account.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const business = await Business.findOne({ email });
    if (!business) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: business._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, business });
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
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
};
