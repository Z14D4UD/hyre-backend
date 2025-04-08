// server/routes/affiliateRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Import multer middleware
const { getAffiliateStats, getAffiliateProfile, updateAffiliateProfile } = require('../controllers/affiliateController');

// GET /api/affiliate/stats – Affiliate statistics
router.get('/stats', authMiddleware, getAffiliateStats);

// GET /api/affiliate/me – Retrieve affiliate profile
router.get('/me', authMiddleware, getAffiliateProfile);

// PUT /api/affiliate/me – Update affiliate profile, with file upload handling for 'avatar'
router.put('/me', authMiddleware, upload.single('avatar'), updateAffiliateProfile);

module.exports = router;
