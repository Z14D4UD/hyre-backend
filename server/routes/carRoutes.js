// server/routes/carRoutes.js
const express = require('express');
const router = express.Router();

// Destructure the functions from carController
const { 
  uploadCar, 
  getCars, 
  searchCars, 
  getCarById, 
  searchAll 
} = require('../controllers/carController');

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// POST /api/cars/upload – Upload a new car listing (requires authentication and file upload)
router.post('/upload', authMiddleware, upload.single('image'), uploadCar);

// GET /api/cars – Retrieve all cars
router.get('/', getCars);

// GET /api/cars/search – Search for cars (by location, make, etc.)
router.get('/search', searchCars);

// GET /api/cars/searchAll – Search across both Cars and Listings
router.get('/searchAll', searchAll);

// GET /api/cars/:id – Retrieve a single car by its ID
router.get('/:id', getCarById);

module.exports = router;
