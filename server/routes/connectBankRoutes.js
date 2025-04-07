// server/routes/connectBankRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createOnboardingLink, updateConnectedAccount } = require('../controllers/connectBankController');

// POST /api/connect-bank - Create a Stripe Connect onboarding link
router.post('/', authMiddleware, createOnboardingLink);

// (Optional) Stripe webhook endpoint for account updates
router.post('/webhook', express.raw({ type: 'application/json' }), updateConnectedAccount);

module.exports = router;
