// server/controllers/paymentController.js

// 1) At startup, warn if the Stripe key is missing:
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️  STRIPE_SECRET_KEY is NOT set! Payments will fail.');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

const paypal = require('@paypal/checkout-server-sdk');
function paypalEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment());

exports.createStripePayment = async (req, res) => {
  // 2) Dump request and key‐presence to your logs:
  console.log('👉 createStripePayment called. body:', req.body);
  console.log('👉 STRIPE_SECRET_KEY loaded?', !!process.env.STRIPE_SECRET_KEY);

  const { amount, currency } = req.body;

  // 3) Quick validation:
  if (typeof amount !== 'number' || !currency) {
    console.warn('⚠️  Bad request, missing amount or currency');
    return res
      .status(400)
      .json({ error: 'Request must include numeric amount and currency.' });
  }

  // 4) Prevent Stripe “amount too small” error:
  if (amount < 30) {
    console.warn('⚠️  Amount too small for Stripe:', amount);
    return res
      .status(400)
      .json({ error: 'Stripe requires a minimum payment of £0.30.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency });
    console.log('✅ Stripe PaymentIntent created:', paymentIntent.id);
    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    // 5) Surface exactly what Stripe tells us:
    console.error('❌ Stripe createPaymentIntent error:', error);
    const status = error.statusCode || 500;
    return res
      .status(status)
      .json({ error: error.raw?.message || error.message });
  }
};

exports.createPayPalOrder = async (req, res) => {
  console.log('👉 createPayPalOrder called. body:', req.body);
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
    console.log('✅ PayPal Order created:', order.result.id);
    return res.json({ orderID: order.result.id });
  } catch (error) {
    console.error('❌ PayPal create-order error:', error);
    return res.status(500).json({ error: error.message });
  }
};

exports.capturePayPalOrder = async (req, res) => {
  console.log('👉 capturePayPalOrder called. body:', req.body);
  const { orderID } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    console.log('✅ PayPal Order captured:', capture.result.id);
    return res.json({ capture: capture.result });
  } catch (error) {
    console.error('❌ PayPal capture-order error:', error);
    return res.status(500).json({ error: error.message });
  }
};
