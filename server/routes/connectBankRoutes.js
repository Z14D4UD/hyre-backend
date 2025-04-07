// server/routes/connectBankRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createOnboardingLink } = require('../controllers/connectBankController');

// POST /api/connect-bank
router.post('/', authMiddleware, createOnboardingLink);

// (Optional) If you plan to handle Stripe webhooks or updates, do so here
// router.post('/webhook', express.raw({ type: 'application/json' }), updateConnectedAccount);

module.exports = router;
