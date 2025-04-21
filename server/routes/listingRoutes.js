// server/routes/listingRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const upload  = require('../middlewares/uploadMiddleware');
const ctl     = require('../controllers/listingController');

// PUBLIC: details + reviews
router.get('/public/:id', ctl.getListingPublic);

// AUTHENTICATED CRUD
router.post  ('/listings',     auth, upload.array('images'), ctl.createListing);
router.get   ('/listings',     auth,                         ctl.getBusinessListings);
router.get   ('/listings/:id', auth,                         ctl.getListingById);
router.put   ('/listings/:id', auth, upload.array('images'), ctl.updateListing);
router.delete('/listings/:id', auth,                         ctl.deleteListing);

module.exports = router;
