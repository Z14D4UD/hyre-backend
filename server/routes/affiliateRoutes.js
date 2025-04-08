// server/routes/affiliateRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getAffiliateStats, getAffiliateProfile, updateAffiliateProfile } = require('../controllers/affiliateController');

// GET /api/affiliate/stats – Affiliate statistics
router.get('/stats', authMiddleware, getAffiliateStats);

// GET /api/affiliate/me – Retrieve affiliate profile
router.get('/me', authMiddleware, getAffiliateProfile);

// PUT /api/affiliate/me – Update affiliate profile
router.put('/me', authMiddleware, updateAffiliateProfile);

module.exports = router;
