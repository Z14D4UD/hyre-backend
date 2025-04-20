// server/routes/listingRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const upload  = require('../middlewares/uploadMiddleware');
const ctl     = require('../controllers/listingController');

// Create
router.post(
  '/listings',
  auth,
  upload.array('images'),
  ctl.createListing
);

// List all for this business
router.get(
  '/listings',
  auth,
  ctl.getBusinessListings
);

// Get one by ID
router.get(
  '/listings/:id',
  auth,
  ctl.getListingById
);

// Update
router.put(
  '/listings/:id',
  auth,
  upload.array('images'),
  ctl.updateListing
);

// Delete
router.delete(
  '/listings/:id',
  auth,
  ctl.deleteListing
);

module.exports = router;
