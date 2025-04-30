// server/controllers/withdrawalController.js

const Business = require('../models/Business');
const { createPayPalPayout, createStripeTransfer } = require('../services/payoutService');

exports.requestWithdrawal = async (req, res) => {
  try {
    // Determine account type: business or affiliate
    let accountType;
    let accountId;
    if (req.business) {
      accountType = 'business';
      accountId = req.business.id;
    } else if (req.affiliate) {
      accountType = 'affiliate';
      accountId = req.affiliate.id;
    } else {
      return res.status(403).json({ msg: 'Unauthorized withdrawal request' });
    }

    const { amount, method, details } = req.body;
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return res.status(400).json({ msg: 'Invalid withdrawal amount' });
    }

    if (!['paypal', 'bank'].includes(method)) {
      return res.status(400).json({ msg: 'Invalid withdrawal method' });
    }

    // Fetch the business (or affiliate) record
    let business;
    if (accountType === 'business') {
      business = await Business.findById(accountId);
      if (!business) {
        return res.status(404).json({ msg: 'Business not found' });
      }
      if (business.balance < withdrawalAmount) {
        return res.status(400).json({ msg: 'Insufficient balance' });
      }
    }

    // ── compute 5% service fee and net amount ─────────────────────────────
    const serviceFee = withdrawalAmount * 0.05;
    const netAmount  = withdrawalAmount - serviceFee;

    let payoutResult;
    if (method === 'paypal') {
      if (!details || !details.paypalEmail) {
        return res.status(400).json({ msg: 'PayPal email is required for withdrawal' });
      }
      // send only the net amount to user
      payoutResult = await createPayPalPayout(netAmount, "USD", details.paypalEmail);
    } else if (method === 'bank') {
      if (!business.stripeAccountId) {
        return res.status(400).json({ msg: 'No connected bank account. Please connect your bank account first.' });
      }
      // send only the net amount to user
      payoutResult = await createStripeTransfer(netAmount, "USD", business.stripeAccountId);
    }

    // ── debit the full requested amount from business balance ──────────────
    if (accountType === 'business') {
      business.balance -= withdrawalAmount;
      // Optionally record fee: e.g. business.totalFeesCollected = (business.totalFeesCollected || 0) + serviceFee;
      await business.save();
    }

    // You may also record the serviceFee into your platform's revenue tracking here

    res.json({
      msg: 'Withdrawal request submitted successfully',
      requestedAmount: withdrawalAmount,
      serviceFee,
      netPaid: netAmount,
      payoutResult
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ msg: 'Server error processing withdrawal' });
  }
};
