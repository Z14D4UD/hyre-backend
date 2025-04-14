// server/controllers/carController.js
const Car = require('../models/Car');
const Business = require('../models/Business');

// Upload a new car listing
exports.uploadCar = async (req, res) => {
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
  
  // Normalize the image path if a file is uploaded
  const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : '';

  try {
    // Create a new Car document using the provided fields.
    const car = new Car({
      business: businessId,
      carMake,
      model,
      location,
      // Ensure we store numeric coordinates
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

    // Optionally, add points to the Business (if supported in your Business model)
    await Business.findByIdAndUpdate(businessId, { $inc: { points: 10 } });

    res.status(201).json({ car });
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

// Search for cars using fuzzy matching on both location and address fields
exports.searchCars = async (req, res) => {
  try {
    // Extract query parameters from the request
    const { query, make, lat, lng, radius } = req.query;
    let filter = {};

    if (query) {
      // Use a case-insensitive regex search on both 'location' and 'address' fields
      filter.$or = [
        { location: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ];
    }

    if (make) {
      // Use regex for carMake as well
      filter.carMake = { $regex: make, $options: 'i' };
    }

    // Optional: If lat, lng, and radius (in degrees) are provided, create a bounding box filter.
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const rad = parseFloat(radius);
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
