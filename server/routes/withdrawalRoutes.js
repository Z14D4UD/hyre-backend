const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createWithdrawalRequest, getWithdrawalHistory } = require('../controllers/withdrawalController');

// POST /api/withdrawals – create a new withdrawal request
router.post('/', authMiddleware, createWithdrawalRequest);

// GET /api/withdrawals – retrieve withdrawal history for the business
router.get('/', authMiddleware, getWithdrawalHistory);

module.exports = router;
