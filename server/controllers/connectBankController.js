// server/controllers/connectBankController.js
const Business = require('../models/Business');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/connect-bank
 * Create a Stripe Connect onboarding link for a business user.
 * If the business already has a connected account, return it.
 */
exports.createOnboardingLink = async (req, res) => {
  try {
    const businessId = req.business.id;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    // If already connected, return the existing stripeAccountId
    if (business.stripeAccountId) {
      return res.json({ stripeAccountId: business.stripeAccountId });
    }

    // Create a new Stripe account (if not already created)
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // adjust as needed
      email: business.email,
      business_type: 'company',
      capabilities: {
        transfers: { requested: true },
      },
    });

    // Save the newly created account ID into the Business model
    business.stripeAccountId = account.id;
    await business.save();

    // Create an account link for the onboarding process
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
