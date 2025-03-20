// server/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');

// Existing code for ID upload
const upload = multer({ dest: 'uploads/id-documents/' });
router.post('/verify-id', auth, upload.single('idDocument'), customerController.verifyId);

// NEW ROUTE: GET /api/customer/me
router.get('/me', auth, customerController.getCustomerProfile);

module.exports = router;
