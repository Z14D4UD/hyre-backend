// server/services/payoutService.js
const paypal = require('@paypal/payouts-sdk');

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  // Use LiveEnvironment in production; SandboxEnvironment for development/testing
  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

async function createPayout(payoutRequest) {
  const request = new paypal.payouts.PayoutsPostRequest();
  request.requestBody(payoutRequest);
  try {
    const response = await client().execute(request);
    return response;
  } catch (err) {
    console.error("PayPal Payouts error:", err);
    throw err;
  }
}

module.exports = { createPayout };
