// server/routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const { sendSupportEmail } = require('../controllers/supportController');

// POST /api/support/contact
router.post('/contact', sendSupportEmail);

module.exports = router;
