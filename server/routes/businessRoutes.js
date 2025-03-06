const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { verifyID } = require('../controllers/businessController');

router.post('/verify-id', authMiddleware, upload.single('idDocument'), verifyID);

module.exports = router;
