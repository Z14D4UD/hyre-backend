// server/controllers/connectBankController.js
const Business = require('../models/Business');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/connect-bank
 * Create a Stripe Connect onboarding link for a business user.
 * If the business already has a connected account, return an onboarding link
 * that leads them to complete or update their details.
 */
exports.createOnboardingLink = async (req, res) => {
  try {
    if (!req.business) {
      return res.status(403).json({ msg: 'Forbidden: Not a business user' });
    }

    const businessId = req.business.id;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.FRONTEND_URL) {
      return res.status(500).json({
        msg: 'Stripe environment variables or FRONTEND_URL not configured properly.',
      });
    }

    // If the user already has a stripeAccountId, we can either:
    // (a) Return an onboarding link to update their existing account, or
    // (b) If everything is complete, we can return some success message
    let stripeAccountId = business.stripeAccountId;

    if (!stripeAccountId) {
      // Create a new Stripe account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // or your business's country
        email: business.email,
        business_type: 'company',
        capabilities: {
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;
      business.stripeAccountId = account.id;
      await business.save();
    }

    // Generate an onboarding link (accountLink) so the user can add bank info
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.FRONTEND_URL}/connect-bank?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/connect-bank?success=true`,
      type: 'account_onboarding',
    });

    return res.json({
      msg: 'Stripe Connect onboarding link created successfully',
      url: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating Stripe Connect onboarding link', error);
    return res.status(500).json({ msg: 'Server error creating onboarding link' });
  }
};
