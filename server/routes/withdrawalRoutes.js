// server/routes/withdrawalRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { requestWithdrawal } = require('../controllers/withdrawalController');

router.post('/', authMiddleware, requestWithdrawal);

module.exports = router;
