// server/routes/publicListingRoutes.js
const express = require('express');
const router  = express.Router();

const { getListingPublic } = require('../controllers/listingController');

//  GET /api/listings/:id   ← no auth, everyone can read
router.get('/:id', getListingPublic);

module.exports = router;
