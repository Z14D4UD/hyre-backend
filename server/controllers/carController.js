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
    features,
    availableFrom, // expected as a date string (e.g. "2025-03-25")
    availableTo    // expected as a date string (e.g. "2025-03-27")
  } = req.body;

  // Get the authenticated business's ID from req.business
  const businessId = req.business.id;
  
  // Normalize the image path if a file is uploaded
  const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : '';

  try {
    // Create a new Car document using the provided fields.
    // Make sure your Car model contains "availableFrom" and "availableTo" if you want to use date filters later.
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
      features: features ? features.split(',').map(s => s.trim()) : [],
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      availableTo: availableTo ? new Date(availableTo) : undefined
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

// Search for cars using full-text search for fuzzy matching, plus additional filters.
// This function uses MongoDB's text search, so you must create a text index on the Car model.
exports.searchCars = async (req, res) => {
  try {
    const {
      query,
      make,
      lat,
      lng,
      radius,
      fromDate,    // not currently used in filtering
      untilDate,   // not currently used in filtering
      price,
      vehicleType,
      year
    } = req.query;
    
    let filter = {};

    if (query) {
      // Use text search for broad matching.
      // Ensure you have created a text index on: location, address, carMake, and model.
      filter.$text = { $search: query };
    }

    if (make) {
      // Further narrow by carMake using a regex match.
      filter.carMake = { $regex: make, $options: 'i' };
    }

    // Optional: If lat, lng, and radius are provided, create a bounding box filter.
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const rad = parseFloat(radius);
      filter.latitude = { $gte: latNum - rad, $lte: latNum + rad };
      filter.longitude = { $gte: lngNum - rad, $lte: lngNum + rad };
    }

    if (price) {
      filter.pricePerDay = { $lte: parseFloat(price) };
    }

    if (year) {
      filter.year = parseInt(year, 10);
    }

    if (vehicleType) {
      // Assuming you have a field for vehicleType.
      // If not, you might use a regex on model or a dedicated field.
      filter.vehicleType = { $regex: vehicleType, $options: 'i' };
    }

    // OPTIONAL: Date filtering logic is omitted here so that listings appear regardless of chosen dates.
    // You could add date overlap logic here if needed.

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
