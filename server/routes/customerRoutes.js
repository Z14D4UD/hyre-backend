// server/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/avatars/' });

// GET route to fetch profile
router.get('/me', auth, customerController.getCustomerProfile);

// PUT route to update profile (text fields + avatar)
router.put('/me', auth, upload.single('avatar'), customerController.updateCustomerProfile);

module.exports = router;
