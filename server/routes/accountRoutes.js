// server/routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getAccount,
  updateAccount,
  useAffiliateCode,
  changePassword,
  downloadData,
  closeAccount,
} = require('../controllers/accountController');

// GET /api/account - fetch user account info
router.get('/', authMiddleware, getAccount);

// PUT /api/account - update fields (e.g., transmission)
router.put('/', authMiddleware, updateAccount);

// POST /api/account/use-affiliate-code
router.post('/use-affiliate-code', authMiddleware, useAffiliateCode);

// PUT /api/account/password - change password
router.put('/password', authMiddleware, changePassword);

// GET /api/account/download - download account data as PDF
router.get('/download', authMiddleware, downloadData);

// DELETE /api/account - close account
router.delete('/', authMiddleware, closeAccount);

module.exports = router;
