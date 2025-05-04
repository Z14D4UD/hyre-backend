const express = require('express');
const router  = express.Router();
const {
  getAllListings,
  getListingPublic
} = require('../controllers/listingController');

// PUBLIC READ-ONLY
// GET /api/listings → returns all listings
router.get('/', getAllListings);

// GET /api/listings/:id → same as public detail
router.get('/:id', getListingPublic);

// GET /api/listings/public/:id → legacy if needed
router.get('/public/:id', getListingPublic);

module.exports = router;
2