//  server/routes/publicListingRoutes.js
const express  = require('express');
const router   = express.Router();
const ctl      = require('../controllers/listingController');

// Public – no auth middleware here
router.get('/:id', ctl.getListingPublic);

module.exports = router;
