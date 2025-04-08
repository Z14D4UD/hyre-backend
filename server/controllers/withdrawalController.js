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

    // (Optional) Verify that the user/affiliate has enough funds here
    // For example, for a business you might check `business.balance`
    // and for an affiliate, you might check `affiliate.earnings` or a similar field.

    let payoutResult;
    if (method === 'paypal') {
      if (!details || !details.paypalEmail) {
        return res.status(400).json({ msg: 'PayPal email is required for withdrawal' });
      }
      payoutResult = await createPayPalPayout(withdrawalAmount, "USD", details.paypalEmail);
    } else if (method === 'bank') {
      // For bank transfers, ensure the account is set up (this example assumes using Stripe transfers)
      // You'll need the appropriate account ID; update as per your model.
      // For businesses, you might use business.stripeAccountId.
      // For affiliates, you might have a different field.
      // Here, we assume business for demonstration purposes:
      const business = await Business.findById(accountId);
      if (!business || !business.stripeAccountId) {
        return res.status(400).json({ msg: 'No connected bank account. Please connect your bank account first.' });
      }
      payoutResult = await createStripeTransfer(withdrawalAmount, "USD", business.stripeAccountId);
    }

    // Deduct the withdrawn amount from the appropriate balance and save in your model logic
    // For example, for businesses:
    if (accountType === 'business') {
      const business = await Business.findById(accountId);
      if (business.balance < withdrawalAmount) {
        return res.status(400).json({ msg: 'Insufficient balance' });
      }
      business.balance -= withdrawalAmount;
      await business.save();
    }
    // Similarly, if affiliates have a balance field or earnings field to deduct from.

    res.json({ msg: 'Withdrawal request submitted successfully', payoutResult });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ msg: 'Server error processing withdrawal' });
  }
};
