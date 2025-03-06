const express = require('express');
const router = express.Router();
const { uploadCar, getCars, searchCars, getCarById } = require('../controllers/carController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/upload', authMiddleware, upload.single('image'), uploadCar);
router.get('/', getCars);
router.get('/search', searchCars);
router.get('/:id', getCarById);

module.exports = router;
