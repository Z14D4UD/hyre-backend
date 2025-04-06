// server/controllers/withdrawalController.js

const Business = require('../models/Business');
const { createPayPalPayout, createStripeTransfer } = require('../services/payoutService');

exports.requestWithdrawal = async (req, res) => {
  try {
    const businessId = req.business.id;
    const { amount, method, details } = req.body;
    
    // Validate the withdrawal amount
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return res.status(400).json({ msg: 'Invalid withdrawal amount' });
    }
    
    // Validate method (must be either "paypal" or "bank")
    if (!['paypal', 'bank'].includes(method)) {
      return res.status(400).json({ msg: 'Invalid withdrawal method' });
    }
    
    // Fetch business details (assume a "balance" field exists on Business)
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }
    if (business.balance < withdrawalAmount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    let payoutResult;
    if (method === 'paypal') {
      if (!details || !details.paypalEmail) {
        return res.status(400).json({ msg: 'PayPal email is required for withdrawal' });
      }
      payoutResult = await createPayPalPayout(withdrawalAmount, "USD", details.paypalEmail);
    } else if (method === 'bank') {
      if (!details || !details.bankAccount) {
        return res.status(400).json({ msg: 'Bank account details are required for withdrawal' });
      }
      // In production, you may need to verify the bank account details or use a payment provider.
      payoutResult = await createStripeTransfer(withdrawalAmount, "USD", details.bankAccount);
    }

    // Deduct the withdrawn amount from the business balance and save
    business.balance -= withdrawalAmount;
    await business.save();

    res.json({ msg: 'Withdrawal request submitted successfully', payoutResult });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ msg: 'Server error processing withdrawal' });
  }
};
