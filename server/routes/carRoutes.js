// server/routes/carRoutes.js
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

// 1) Upload a new car listing.
router.post('/upload', authMiddleware, upload.single('image'), uploadCar);

// 2) Retrieve all cars.
router.get('/', getCars);

// 3) Search for cars (Car collection only).
router.get('/search', searchCars);

// 4) Search across both Cars and Listings.
router.get('/searchAll', searchAll);

// 5) Retrieve a single car by its ID.
router.get('/:id', getCarById);

module.exports = router;
