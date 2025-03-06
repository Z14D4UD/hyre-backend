const express = require('express');
const router = express.Router();
const {
  createStripePayment,
  createPayPalOrder,
  capturePayPalOrder
} = require('../controllers/paymentController');

router.post('/stripe', createStripePayment);
router.post('/paypal/create-order', createPayPalOrder);
router.post('/paypal/capture-order', capturePayPalOrder);

module.exports = router;
