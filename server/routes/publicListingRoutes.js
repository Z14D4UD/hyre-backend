// server/routes/publicListingRoutes.js
const express = require('express');
const router  = express.Router();
const ctl     = require('../controllers/listingController');

// GET /api/listings/:id  (no auth)
router.get('/:id', ctl.getListingPublic);

module.exports = router;
