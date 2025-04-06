// server/services/payoutService.js

const paypal = require('@paypal/payouts-sdk');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Set your Stripe secret key in env

// --- PayPal Payouts Integration ---

// Helper: Create a PayPal client using sandbox or live environment
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  let environment;
  if (process.env.PAYPAL_MODE === 'live') {
    environment = new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
  return new paypal.core.PayPalHttpClient(environment);
}

/**
 * Create a PayPal payout.
 * @param {number} amount - The amount to pay out.
 * @param {string} currency - Currency code (e.g. "USD").
 * @param {string} recipientEmail - The recipient's PayPal email.
 * @returns {Promise<Object>} The payout response.
 */
async function createPayPalPayout(amount, currency, recipientEmail) {
  const request = new paypal.payouts.PayoutsPostRequest();
  request.requestBody({
    sender_batch_header: {
      sender_batch_id: Math.random().toString(36).substring(9),
      email_subject: "You have a payout!",
      email_message: "You have received a payout! Thanks for using our service!"
    },
    items: [
      {
        recipient_type: "EMAIL",
        amount: {
          value: amount.toFixed(2),
          currency: currency
        },
        note: "Thank you for your business.",
        receiver: recipientEmail,
        sender_item_id: "item_1"
      }
    ]
  });
  
  const client = getPayPalClient();
  try {
    const response = await client.execute(request);
    return response.result;
  } catch (err) {
    console.error("Error creating PayPal payout", err);
    throw err;
  }
}

// --- Stripe Bank Transfer Integration ---

/**
 * Create a Stripe transfer to a connected account.
 * @param {number} amount - The amount to transfer in dollars.
 * @param {string} currency - Currency code (e.g., "usd").
 * @param {string} destinationAccount - The Stripe connected account ID.
 * @param {object} metadata - Optional metadata.
 * @returns {Promise<Object>} The Stripe transfer response.
 */
async function createStripeTransfer(amount, currency, destinationAccount, metadata = {}) {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Stripe amount in cents
      currency: currency.toLowerCase(),
      destination: destinationAccount,
      metadata
    });
    return transfer;
  } catch (err) {
    console.error("Error creating Stripe transfer", err);
    throw err;
  }
}

module.exports = {
  createPayPalPayout,
  createStripeTransfer
};
