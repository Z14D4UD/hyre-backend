// server/controllers/withdrawalController.js

exports.requestWithdrawal = async (req, res) => {
  try {
    // For a business, you might check req.business; for an affiliate, check req.affiliate
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

    // (Assume you have logic to check balance for each account type, and
    // that your data models store balances for both business and affiliates.)
    // For example, for affiliates, you might have an 'earnings' field.

    // Fetch account details based on accountType (your current business withdrawal logic might work similarly)
    // (Update the logic accordingly if affiliate accounts store balance in a different field)
    // ... rest of the code

    // Process withdrawal via paypal or bank (same as your business logic)
    // For example:
    let payoutResult;
    if (method === 'paypal') {
      if (!details || !details.paypalEmail) {
        return res.status(400).json({ msg: 'PayPal email is required for withdrawal' });
      }
      // Create PayPal payout
      payoutResult = await createPayPalPayout(withdrawalAmount, 'USD', details.paypalEmail);
    } else if (method === 'bank') {
      // For bank transfers, ensure the account is properly set up (this logic may differ)
      // e.g., business might store stripeAccountId and affiliate might store a separate bank info field.
      payoutResult = await createStripeTransfer(withdrawalAmount, 'USD', /* account id from the corresponding model */);
    }

    // Deduct the withdrawn amount from the account's balance
    // ... update model and save

    res.json({ msg: 'Withdrawal request submitted successfully', payoutResult });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ msg: 'Server error processing withdrawal' });
  }
};
