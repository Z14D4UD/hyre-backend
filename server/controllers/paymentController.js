// server/controllers/paymentController.js

// 1) Ensure we actually have a Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️  STRIPE_SECRET_KEY is not set in the environment!');
}
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY,
  { apiVersion: '2020-08-27' }
);

const paypal = require('@paypal/checkout-server-sdk');
function paypalEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment());

exports.createStripePayment = async (req, res) => {
  const { amount, currency } = req.body;

  // 2) Basic validation
  if (typeof amount !== 'number' || !currency) {
    return res
      .status(400)
      .json({ error: 'Request must include numeric amount and currency.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency
    });
    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    // 3) Log and return whatever Stripe gave us
    console.error('Stripe createPaymentIntent error:', error);
    return res
      .status(500)
      .json({ error: error.raw?.message || error.message });
  }
};

exports.createPayPalOrder = async (req, res) => {
  const { amount, currency } = req.body;
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{
      amount: { currency_code: currency, value: amount.toString() }
    }]
  });
  try {
    const order = await paypalClient.execute(request);
    return res.json({ orderID: order.result.id });
  } catch (error) {
    console.error('PayPal create-order error:', error);
    return res.status(500).json({ error: error.message });
  }
};

exports.capturePayPalOrder = async (req, res) => {
  const { orderID } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});
  try {
    const capture = await paypalClient.execute(request);
    return res.json({ capture: capture.result });
  } catch (error) {
    console.error('PayPal capture-order error:', error);
    return res.status(500).json({ error: error.message });
  }
};
