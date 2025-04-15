const express = require('express');
const router = express.Router();
const { 
  uploadCar, 
  getCars, 
  searchCars, 
  getCarById, 
  searchAll 
} = require('../controllers/carController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// 1) POST /api/cars/upload – Upload a new car listing (requires authentication and file upload)
router.post('/upload', authMiddleware, upload.single('image'), uploadCar);

// 2) GET /api/cars – Retrieve all cars
router.get('/', getCars);

// 3) GET /api/cars/search – Search for cars (Car collection only)
router.get('/search', searchCars);

// 4) GET /api/cars/searchAll – Search across both Cars and Listings
router.get('/searchAll', searchAll);

// 5) GET /api/cars/:id – Retrieve a single car by its ID
router.get('/:id', getCarById);

module.exports = router;
