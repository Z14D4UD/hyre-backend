const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getAffiliateData } = require('../controllers/affiliateController');

router.get('/me', authMiddleware, getAffiliateData);

module.exports = router;
