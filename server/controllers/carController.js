// server/controllers/carController.js

const Car = require('../models/Car');
const Business = require('../models/Business');

// Upload a new car listing
exports.uploadCar = async (req, res) => {
  // Extract fields from req.body using updated field names.
  const {
    carMake,     // updated from "make"
    model,
    location,    // location as string (e.g., "London, UK")
    latitude,
    longitude,
    pricePerDay, // updated field name
    description, // optional
    year,        // optional
    mileage,     // optional
    features     // expects a comma-separated string
  } = req.body;

  // The authenticated business's ID should be in req.business.
  const businessId = req.business.id;
  
  // Determine the image path; if a file was uploaded, use its path (normalize path separators if needed)
  const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : '';

  try {
    // Create a new Car document
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

    // Optionally add points to the business (assuming your Business model supports a "points" field)
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
    // Populate business details if desired (only name and email)
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
    // Expect query parameters:
    //  - query: search term for location (or part of the address)
    //  - make: car make filter (for carMake field)
    //  - Optionally: lat, lng, radius for geo-based searches (if you implement that)
    const { query, make, lat, lng, radius } = req.query;
    let filter = {};

    if (query) {
      // Search case-insensitively in the "location" field (or address if you prefer)
      filter.location = { $regex: query, $options: 'i' };
    }
    if (make) {
      filter.carMake = { $regex: make, $options: 'i' };
    }
    if (lat && lng && radius) {
      // For a geo-based search, you would need to store your location in GeoJSON format and create a 2dsphere index.
      // For this example, we assume filtering by text is sufficient.
      // Alternatively, you can add additional conditions here.
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
