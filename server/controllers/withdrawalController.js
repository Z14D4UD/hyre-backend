// server/controllers/withdrawalController.js
const Withdrawal = require('../models/Withdrawal');
const payoutService = require('../services/payoutService');
const Business = require('../models/Business');

exports.requestWithdrawal = async (req, res) => {
  try {
    if (!req.business) {
      return res.status(403).json({ msg: 'Forbidden: Not a business user' });
    }
    const businessId = req.business.id;
    const { amount, method, details } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid withdrawal amount' });
    }
    if (!['paypal', 'bank'].includes(method)) {
      return res.status(400).json({ msg: 'Invalid withdrawal method' });
    }
    if (!details || typeof details !== 'object') {
      return res.status(400).json({ msg: 'Invalid withdrawal details' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }
    if (business.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    const payoutResult = await payoutService.initiatePayout(business, amount, method, details);
    if (!payoutResult.success) {
      return res.status(500).json({ msg: 'Payout failed', error: payoutResult.error });
    }

    // Deduct the amount from the business balance
    business.balance -= amount;
    await business.save();

    const newWithdrawal = new Withdrawal({
      business: businessId,
      amount,
      method,
      details,
      status: 'completed', // or 'pending' if asynchronous
    });
    await newWithdrawal.save();

    res.json({ msg: 'Withdrawal request submitted successfully', withdrawal: newWithdrawal, payoutResult });
  } catch (error) {
    console.error('Error in requestWithdrawal:', error);
    res.status(500).json({ msg: 'Server error processing withdrawal' });
  }
};
