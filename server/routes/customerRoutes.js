// server/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');

// For storing avatar images
const upload = multer({ dest: 'uploads/avatars/' });

// PUT route to update profile (text fields + avatar)
router.put('/me', auth, upload.single('avatar'), customerController.updateCustomerProfile);

module.exports = router;
