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
    // The following are ignored for logic, but stored if your model has them:
    availableFrom,
    availableTo
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
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      pricePerDay,
      imageUrl,
      description,
      year,
      mileage,
      features: features ? features.split(',').map(s => s.trim()) : [],
      // If your Car model has fields for date availability, you can store them:
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      availableTo: availableTo ? new Date(availableTo) : undefined
    });

    await car.save();

    // Optionally, add points to the Business (if your Business model supports "points")
    await Business.findByIdAndUpdate(businessId, { $inc: { points: 10 } });

    res.status(201).json({ car });
  } catch (error) {
    console.error('Error uploading car:', error);
    res.status(500).json({ message: 'Server error while uploading car.' });
  }
};

// Retrieve all cars (no filters)
exports.getCars = async (req, res) => {
  try {
    const cars = await Car.find({}).populate('business', 'name email');
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Server error while retrieving cars.' });
  }
};

// Search for cars using:
//  - fuzzy matching on location or address
//  - bounding box filter if lat/lng/radius
//  - optional filters: price (<=), make (regex), year (exact match), vehicleType (regex on model?), etc.
//  - *ignoring any date overlap logic*, so listings appear even if the user's chosen dates do not overlap
exports.searchCars = async (req, res) => {
  try {
    const {
      query,
      make,
      lat,
      lng,
      radius,
      fromDate,
      untilDate,   // We won't filter by date—just ignoring it
      price,
      vehicleType,
      year
    } = req.query;

    const filter = {};

    // 1) Fuzzy match location or address
    if (query) {
      filter.$or = [
        { location: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ];
    }

    // 2) Make filter (regex on carMake)
    if (make) {
      filter.carMake = { $regex: make, $options: 'i' };
    }

    // 3) If lat, lng, and radius are present, do bounding box
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const rad = parseFloat(radius);
      filter.latitude = { $gte: latNum - rad, $lte: latNum + rad };
      filter.longitude = { $gte: lngNum - rad, $lte: lngNum + rad };
    }

    // 4) Price filter: show listings with pricePerDay <= user price
    if (price) {
      filter.pricePerDay = { $lte: parseFloat(price) };
    }

    // 5) Year filter: exact match
    if (year) {
      filter.year = parseInt(year, 10);
    }

    // 6) Vehicle type filter?
    //  If your Car model does not have a `vehicleType` field, you have 2 options:
    //   A) Add `vehicleType` to your CarSchema
    //   B) Hack: match it in `model` or `features`. Example if your business might store "Sedan" in features:
    // For demonstration, let's assume we store "Sedan", "SUV" in the Car's `model` or `features`.
    if (vehicleType) {
      // If your model field is actually named carType or something else, change accordingly.
      // For now, let's assume we do a fuzzy match on `model`.
      filter.model = { $regex: vehicleType, $options: 'i' };
    }

    // We IGNORE fromDate/untilDate filters => removing date overlap logic
    // This way, the listing appears regardless of user’s chosen date range

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
