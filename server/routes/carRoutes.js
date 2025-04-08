// server/routes/carRoutes.js
const express = require('express');
const router = express.Router();
const { uploadCar, getCars, searchCars, getCarById } = require('../controllers/carController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// POST /api/cars/upload – Upload a new car listing (requires auth & file upload)
router.post('/upload', authMiddleware, upload.single('image'), uploadCar);

// GET /api/cars – Retrieve all cars
router.get('/', getCars);

// GET /api/cars/search – Search for cars (by make, model, etc.)
router.get('/search', searchCars);

// GET /api/cars/:id – Retrieve a single car by ID
router.get('/:id', getCarById);

module.exports = router;
