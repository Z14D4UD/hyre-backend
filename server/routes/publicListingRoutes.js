// server/routes/publicListingRoutes.js
const express = require('express');
const router  = express.Router();
const ctl     = require('../controllers/listingController');


// GET /api/listings/:id  (no auth)
router.get('/:id', ctl.getListingPublic);

// GET /api/listings
router.get('/', getAllListings);


module.exports = router;
