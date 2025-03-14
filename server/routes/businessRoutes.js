const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { verifyID } = require('../controllers/businessController');
const Business = require('../models/Business');

router.get('/featured', async (req, res) => {
  try {
    const featured = await Business.find({ isFeatured: true });
    res.json(featured);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-id', authMiddleware, upload.single('idDocument'), verifyID);

module.exports = router;
