// server/routes/adminRoutes.js

const express          = require('express');
const router           = express.Router();
const authMiddleware   = require('../middlewares/authMiddleware');
const adminMiddleware  = require('../middlewares/adminMiddleware');
const { getStats }     = require('../controllers/adminController');

router.get(
  '/stats',
  authMiddleware,
  adminMiddleware,
  getStats
);

module.exports = router;
