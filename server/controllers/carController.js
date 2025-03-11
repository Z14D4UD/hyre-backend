// server/controllers/carController.js

const Car = require('../models/Car');
const Business = require('../models/Business');

// Upload a new car listing
exports.uploadCar = async (req, res) => {
  const { make, model, year, type, features, lat, lng, price_per_day } = req.body;
  // Assuming the authenticated business info is attached to req.business
  const businessId = req.business.id;
  // Determine the image path if an image was uploaded
  const imagePath = req.file ? req.file.path : '';
  
  try {
    const car = new Car({
      business: businessId,
      make,
      model,
      year,
      image: imagePath,
      type,
      features: features ? features.split(',') : [],
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      availableFrom: req.body.availableFrom,
      availableTo: req.body.availableTo,
      price_per_day
    });
    
    await car.save();
    
    // Optionally add points to the business for uploading a car
    await Business.findByIdAndUpdate(businessId, { $inc: { points: 10 } });
    
    res.json({ car });
  } catch (error) {
    console.error('Error uploading car:', error);
    res.status(500).json({ message: 'Server error while uploading car.' });
  }
};

// Retrieve all cars
exports.getCars = async (req, res) => {
  try {
    const cars = await Car.find({}).populate('business', 'name email');
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Server error while retrieving cars.' });
  }
};

// Search for cars based on query parameters
exports.searchCars = async (req, res) => {
  try {
    const { type, features, lat, lng, radius } = req.query;
    let query = {};
    
    if (type) {
      query.type = type;
    }
    if (features) {
      // Split features by comma and ensure all are present
      const featureArray = features.split(',');
      query.features = { $all: featureArray };
    }
    if (lat && lng && radius) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius)
        }
      };
    }
    
    const cars = await Car.find(query).populate('business', 'name email');
    res.json(cars);
  } catch (error) {
    console.error('Error searching cars:', error);
    res.status(500).json({ message: 'Server error while searching for cars.' });
  }
};

// Retrieve a single car by its ID
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('business', 'name email');
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }
    res.json(car);
  } catch (error) {
    console.error('Error fetching car by ID:', error);
    res.status(500).json({ message: 'Server error while retrieving the car.' });
  }
};
