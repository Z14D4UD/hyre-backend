// server/controllers/carController.js

const Car = require('../models/Car');
const Business = require('../models/Business');

// Upload a new car listing
exports.uploadCar = async (req, res) => {
  // Extract fields from req.body using updated field names.
  const {
    carMake,
    model,
    location,
    latitude,
    longitude,
    pricePerDay,
    description,
    year,
    mileage,
    features  // expects a comma-separated string
  } = req.body;

  // Get the authenticated business's ID from req.business
  const businessId = req.business.id;
  
  // Determine the image URL; if a file was uploaded, use its path and normalize it.
  const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : '';

  try {
    // Create a new Car document with the provided fields.
    const car = new Car({
      business: businessId,
      carMake,
      model,
      location,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      pricePerDay,
      imageUrl,
      description,
      year,
      mileage,
      features: features ? features.split(',').map(s => s.trim()) : []
    });

    await car.save();

    // Optionally add points to the business (if your Business model supports a "points" field)
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
    // Expect query parameters: query (for location search), make, and optionally lat, lng, radius (for geo-based bounding box search)
    const { query, make, lat, lng, radius } = req.query;
    let filter = {};

    if (query) {
      // A case-insensitive regex search in the "location" field
      filter.location = { $regex: query, $options: 'i' };
    }

    if (make) {
      // A regex filter on carMake
      filter.carMake = { $regex: make, $options: 'i' };
    }

    // If lat, lng, and radius are provided, build a rudimentary bounding box filter.
    if (lat && lng && radius) {
      // Note: This is a simple approximation. For precise geo-search,
      // consider storing a GeoJSON point and creating a 2dsphere index.
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const rad = parseFloat(radius); // Use an approximate value in degrees or compute conversion from meters

      // Here we compute a naive bounding box
      filter.latitude = { $gte: latNum - rad, $lte: latNum + rad };
      filter.longitude = { $gte: lngNum - rad, $lte: lngNum + rad };
    }

    const cars = await Car.find(filter).populate('business', 'name email');
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
