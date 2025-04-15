// server/controllers/carController.js
const Car = require('../models/Car');
const Listing = require('../models/Listing');
const Business = require('../models/Business');

/**
 * Upload a new car listing to the Car collection.
 */
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
    availableFrom, // expected as a date string, e.g. "2025-03-25"
    availableTo    // expected as a date string, e.g. "2025-03-27"
  } = req.body;

  const businessId = req.business.id;
  const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : '';

  try {
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
    await Business.findByIdAndUpdate(businessId, { $inc: { points: 10 } });
    res.status(201).json({ car });
  } catch (error) {
    console.error('Error uploading car:', error);
    res.status(500).json({ message: 'Server error while uploading car.' });
  }
};

/**
 * Retrieve all cars from the Car collection.
 */
exports.getCars = async (req, res) => {
  try {
    const cars = await Car.find({}).populate('business', 'name email');
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Server error while retrieving cars.' });
  }
};

/**
 * Search for cars (from the Car collection) using fuzzy matching on location and address.
 * This endpoint uses regex filters (case-insensitive) plus additional filters for make, price, year, and vehicle type.
 * Date filtering is omitted for Car.
 */
exports.searchCars = async (req, res) => {
  try {
    const { query, make, lat, lng, radius, price, vehicleType, year } = req.query;
    let filter = {};

    if (query) {
      filter.$or = [
        { location: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ];
    }
    if (make) {
      filter.carMake = { $regex: make, $options: 'i' };
    }
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
      filter.model = { $regex: vehicleType, $options: 'i' };
    }
    
    const cars = await Car.find(filter).populate('business', 'name email');
    res.json(cars);
  } catch (error) {
    console.error('Error searching cars:', error);
    res.status(500).json({ message: 'Server error while searching for cars.' });
  }
};

/**
 * Search across both the Car and Listing collections.
 * For the Car collection, we use a full-text search if a query is provided.
 * For the Listing collection, we also use full-text search on address and title and apply date overlap filtering.
 * 
 * **Date Filtering for Listings:**  
 * A listing will be included only if its available dates overlap the requested date range:
 *   listing.availableFrom <= requested.until AND listing.availableTo >= requested.from
 * 
 * If the user's date range does not overlap the listing's dates, that listing will not appear.
 */
exports.searchAll = async (req, res) => {
  try {
    const { query, make, lat, lng, radius, fromDate, untilDate, price, vehicleType, year } = req.query;
    
    // Build filter for the Car collection.
    let carFilter = {};
    if (query && query.trim() !== "") {
      // Use text search on the fields (requires the text index in Car.js).
      carFilter.$text = { $search: query };
    }
    if (make) {
      carFilter.carMake = { $regex: make, $options: 'i' };
    }
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const rad = parseFloat(radius);
      carFilter.latitude = { $gte: latNum - rad, $lte: latNum + rad };
      carFilter.longitude = { $gte: lngNum - rad, $lte: lngNum + rad };
    }
    if (price) {
      carFilter.pricePerDay = { $lte: parseFloat(price) };
    }
    if (year) {
      carFilter.year = parseInt(year, 10);
    }
    if (vehicleType) {
      carFilter.model = { $regex: vehicleType, $options: 'i' };
    }
    // Note: For Cars, we omit date filtering.
    
    // Build filter for the Listing collection.
    let listingFilter = {};
    if (query && query.trim() !== "") {
      // Use text search on the Listing fields (requires the text index in Listing.js).
      listingFilter.$text = { $search: query };
    }
    if (make) {
      listingFilter.make = { $regex: make, $options: 'i' };
    }
    if (price) {
      listingFilter.pricePerDay = { $lte: parseFloat(price) };
    }
    if (year) {
      listingFilter.year = parseInt(year, 10);
    }
    if (vehicleType) {
      listingFilter.carType = { $regex: vehicleType, $options: 'i' };
    }
    // Apply date overlap filtering for Listings only if both dates are provided and valid.
    if (fromDate && untilDate && fromDate.trim() !== "" && untilDate.trim() !== "") {
      const searchFrom = new Date(fromDate);
      const searchUntil = new Date(untilDate);
      if (!isNaN(searchFrom.valueOf()) && !isNaN(searchUntil.valueOf())) {
        listingFilter.availableFrom = { $lte: searchUntil };
        listingFilter.availableTo = { $gte: searchFrom };
      }
    }
    
    // Execute both queries concurrently.
    const [cars, listings] = await Promise.all([
      Car.find(carFilter).populate('business', 'name email'),
      Listing.find(listingFilter)
    ]);
    
    // Merge results and tag each with a type.
    const results = [
      ...cars.map(item => ({ type: 'car', data: item })),
      ...listings.map(item => ({ type: 'listing', data: item }))
    ];
    
    res.json(results);
  } catch (error) {
    console.error('Error searching cars and listings:', error);
    res.status(500).json({ message: 'Server error while searching.' });
  }
};

/**
 * Retrieve a single car by its ID.
 */
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
