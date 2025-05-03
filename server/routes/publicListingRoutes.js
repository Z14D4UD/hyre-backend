// server/routes/publicListingRoutes.js

const express = require('express');
const router  = express.Router();
const {
  getAllListings,     // <-- import this
  getListingPublic
} = require('../controllers/listingController');

/**
 * PUBLIC READ-ONLY
 * GET /api/listings  → returns all listings
 */
router.get('/', getAllListings);

/**
 * GET /api/listings/public/:id
 * Anyone can fetch a single listing with host + reviews
 */
router.get('/public/:id', getListingPublic);

module.exports = router;
