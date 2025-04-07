// server/routes/connectBankRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createOnboardingLink } = require('../controllers/connectBankController');

// POST /api/connect-bank - Create Stripe Connect onboarding link
router.post('/', authMiddleware, createOnboardingLink);

module.exports = router;
