const paypal = require('@paypal/checkout-server-sdk');

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  // Use LiveEnvironment in production; use SandboxEnvironment for testing
  return new paypal.core.LiveEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

async function processPayout(withdrawal) {
  // Build a payout request – this is a basic implementation.
  const requestBody = {
    sender_batch_header: {
      sender_batch_id: String(withdrawal._id),
      email_subject: "You have a payout from Hyre",
      email_message: "You have received a payout from Hyre.",
    },
    items: [
      {
        recipient_type: "EMAIL",
        amount: {
          value: withdrawal.amount.toFixed(2),
          currency: "USD", // Adjust as needed
        },
        receiver: withdrawal.details.paypalEmail,
        note: "Thank you for using Hyre!",
        sender_item_id: String(withdrawal._id),
      },
    ],
  };

  const request = new paypal.payouts.PayoutsPostRequest();
  request.requestBody(requestBody);
  const response = await client().execute(request);
  return response;
}

module.exports = { processPayout };
