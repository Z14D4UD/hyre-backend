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

router.get('/', authMiddleware, getAccount);
router.put('/', authMiddleware, updateAccount);
router.post('/use-affiliate-code', authMiddleware, useAffiliateCode);
router.put('/password', authMiddleware, changePassword);
router.get('/download', authMiddleware, downloadData);
router.delete('/', authMiddleware, closeAccount);

module.exports = router;
