const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads (ID documents)
const upload = multer({ dest: 'uploads/id-documents/' });

// Endpoint for ID upload (only for customers)
router.post('/verify-id', auth, upload.single('idDocument'), customerController.verifyId);

module.exports = router;
