const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middlewares/authMiddleware');

// Customer invoices endpoints
router.get('/customer', auth, invoiceController.getCustomerInvoices);
router.get('/download/:invoiceId', auth, invoiceController.downloadInvoice);

module.exports = router;
