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
    availableFrom, // NEW: expected as a date string (e.g. "2025-03-25")
    availableTo    // NEW: expected as a date string (e.g. "2025-03-27")
  } = req.body;

  // Get the authenticated business's ID from req.business
  const businessId = req.business.id;
  
  // Normalize the image path if a file is uploaded
  const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : '';

  try {
    // Create a new Car document using the provided fields.
    // IMPORTANT: Ensure that your Car model has availableFrom and availableTo fields for date filtering.
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
      // Convert dates to Date objects; if not provided, they can be left undefined
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

// Search for cars using fuzzy matching on both location and address fields,
// plus date availability filtering (overlap) if fromDate and untilDate are provided.
exports.searchCars = async (req, res) => {
  try {
    // Extract query parameters
    const { query, make, lat, lng, radius, fromDate, untilDate } = req.query;
    let filter = {};

    if (query) {
      // Fuzzy match: search both "location" and "address" fields (case-insensitive)
      filter.$or = [
        { location: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ];
    }

    if (make) {
      // Fuzzy match on carMake
      filter.carMake = { $regex: make, $options: 'i' };
    }

    // If lat, lng, and radius are provided, create a rudimentary bounding box filter
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const rad = parseFloat(radius);
      filter.latitude = { $gte: latNum - rad, $lte: latNum + rad };
      filter.longitude = { $gte: lngNum - rad, $lte: lngNum + rad };
    }

    // Date overlap filtering:
    // We want to return a car if its available range overlaps the requested range.
    // Overlap condition: listing.availableFrom <= requested.until AND listing.availableTo >= requested.from
    if (fromDate && untilDate) {
      const searchFrom = new Date(fromDate);
      const searchUntil = new Date(untilDate);
      // For this filter to work, your Car model must have "availableFrom" and "availableTo" fields.
      filter.availableFrom = { $lte: searchUntil };
      filter.availableTo = { $gte: searchFrom };
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
