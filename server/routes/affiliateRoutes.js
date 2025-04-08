// server/routes/affiliateRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getAffiliateStats } = require('../controllers/affiliateController');

// GET /api/affiliate/stats
router.get('/stats', authMiddleware, getAffiliateStats);

module.exports = router;
