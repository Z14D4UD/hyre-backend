// server/routes/publicBusinessRoutes.js
const express = require('express');
const router  = express.Router();
const { getPublicBusiness } =
  require('../controllers/publicBusinessController');

router.get('/:id', getPublicBusiness);    // GET /api/public/business/:id

module.exports = router;
