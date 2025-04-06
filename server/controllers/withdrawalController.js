const Withdrawal = require('../models/Withdrawal');
const Business = require('../models/Business');
const { processPayout } = require('../services/payoutService');

exports.createWithdrawalRequest = async (req, res) => {
  try {
    if (!req.business) {
      return res.status(403).json({ msg: 'Forbidden: Only business users can withdraw funds.' });
    }
    const businessId = req.business.id;
    const { amount, method, details } = req.body;

    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Please provide a valid withdrawal amount.' });
    }
    if (!method || !['paypal', 'bank'].includes(method)) {
      return res.status(400).json({ msg: 'Please choose a valid withdrawal method (paypal or bank).' });
    }

    // Check if the business exists and has sufficient balance
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found.' });
    }
    if (business.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance for withdrawal.' });
    }

    // Deduct the amount from the business balance (use transactions in production)
    business.balance -= amount;
    await business.save();

    // Create a new withdrawal request
    const withdrawal = new Withdrawal({
      business: businessId,
      amount,
      method,
      details,
      status: 'pending',
    });
    const savedWithdrawal = await withdrawal.save();

    // If PayPal, trigger payout (for bank, you might trigger a different process)
    if (method === 'paypal') {
      try {
        const payoutResponse = await processPayout(savedWithdrawal);
        // Update status based on payout response
        savedWithdrawal.status = 'completed';
        await savedWithdrawal.save();
      } catch (payoutError) {
        console.error('Payout error:', payoutError);
        // Optionally update status to "pending" or "failed"
        savedWithdrawal.status = 'pending';
        await savedWithdrawal.save();
      }
    }

    res.status(201).json({
      msg: 'Withdrawal request created successfully.',
      withdrawal: savedWithdrawal,
    });
  } catch (error) {
    console.error('Error creating withdrawal request:', error.stack);
    res.status(500).json({ msg: 'Server error creating withdrawal request.' });
  }
};

exports.getWithdrawalHistory = async (req, res) => {
  try {
    if (!req.business) {
      return res.status(403).json({ msg: 'Forbidden: Only business users can view withdrawal history.' });
    }
    const businessId = req.business.id;
    const withdrawals = await Withdrawal.find({ business: businessId }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    console.error('Error fetching withdrawal history:', error.stack);
    res.status(500).json({ msg: 'Server error fetching withdrawal history.' });
  }
};
