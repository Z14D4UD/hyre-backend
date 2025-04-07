// server/controllers/connectBankController.js
const Business = require('../models/Business');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/connect-bank
 * Create a Stripe Connect onboarding link for a business user.
 * If the business already has a connected account, generate a new onboarding link.
 */
exports.createOnboardingLink = async (req, res) => {
  try {
    const businessId = req.business.id;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    // If already connected, generate a new onboarding link for that account
    if (business.stripeAccountId) {
      const accountLink = await stripe.accountLinks.create({
        account: business.stripeAccountId,
        refresh_url: `${process.env.FRONTEND_URL}/connect-bank?refresh=true`,
        return_url: `${process.env.FRONTEND_URL}/connect-bank?success=true`,
        type: 'account_onboarding',
      });
      return res.json({ url: accountLink.url });
    }

    // Otherwise, create a new Stripe account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // Adjust as needed for your business
      email: business.email,
      business_type: 'company',
      capabilities: {
        transfers: { requested: true },
      },
    });

    // Save the Stripe connected account ID in the Business model
    business.stripeAccountId = account.id;
    await business.save();

    // Create an onboarding link for the new account
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/connect-bank?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/connect-bank?success=true`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating Stripe Connect onboarding link", error);
    res.status(500).json({ msg: 'Server error creating onboarding link' });
  }
};

/**
 * Optional: Handle Stripe webhook events to update connected account info.
 */
exports.updateConnectedAccount = async (req, res) => {
  // TODO: Implement webhook handling logic as needed.
  res.sendStatus(200);
};
