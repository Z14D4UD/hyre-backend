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
 * This endpoint applies additional filters for make, price, year, and vehicle type.
 * Date filtering is omitted for Cars.
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
    // Only add the price filter if price > 0.
    if (price && parseFloat(price) > 0) {
      filter.pricePerDay = { $lte: parseFloat(price) };
    }
    if (year) {
      filter.year = parseInt(year, 10);
    }
    if (vehicleType) {
      filter.model = { $regex: vehicleType, $options: 'i' };
    }
    
    console.log('Car Search Filter:', filter);
    const cars = await Car.find(filter).populate('business', 'name email');
    res.json(cars);
  } catch (error) {
    console.error('Error searching cars:', error);
    res.status(500).json({ message: 'Server error while searching for cars.' });
  }
};

/**
 * Search across both the Car and Listing collections.
 * For the Car collection, this uses full-text search (requires text index) if a query is provided.
 * For the Listing collection, it also uses full-text search on address and title,
 * and applies date overlap filtering.
 */
// server/controllers/carController.js

exports.searchAll = async (req, res) => {
  try {
    const { 
      query, 
      make, 
      lat, 
      lng, 
      radius, 
      fromDate, 
      untilDate, 
      price, 
      vehicleType, 
      year 
    } = req.query;
    
    // Build filter for the Car collection.
    let carFilter = {};
    if (query && query.trim() !== "") {
      // Use full-text search (requires text index) on Car.
      carFilter.$text = { $search: query };
    }
    if (make && make.trim() !== "") {
      carFilter.carMake = { $regex: make, $options: 'i' };
    }
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const rad = parseFloat(radius);
      carFilter.latitude = { $gte: latNum - rad, $lte: latNum + rad };
      carFilter.longitude = { $gte: lngNum - rad, $lte: lngNum + rad };
    }
    if (price && parseFloat(price) > 0) {
      carFilter.pricePerDay = { $lte: parseFloat(price) };
    }
    if (year && year.trim() !== "") {
      carFilter.year = parseInt(year, 10);
    }
    if (vehicleType && vehicleType.trim() !== "") {
      // Assuming that a vehicle type is stored in the model field (or adjust if you have a dedicated vehicleType field)
      carFilter.model = { $regex: vehicleType, $options: 'i' };
    }
    // Note: For Cars, date filtering is omitted.
    
    // Build filter for the Listing collection.
    let listingFilter = {};
    if (query && query.trim() !== "") {
      // Use full-text search on Listing (requires text index).
      listingFilter.$text = { $search: query };
    }
    if (make && make.trim() !== "") {
      listingFilter.make = { $regex: make, $options: 'i' };
    }
    if (price && parseFloat(price) > 0) {
      listingFilter.pricePerDay = { $lte: parseFloat(price) };
    }
    if (year && year.trim() !== "") {
      listingFilter.year = parseInt(year, 10);
    }
    if (vehicleType && vehicleType.trim() !== "") {
      listingFilter.carType = { $regex: vehicleType, $options: 'i' };
    }
    // Apply date overlap filtering for Listings only if both dates are provided.
    if (
      fromDate && fromDate.trim() !== "" &&
      untilDate && untilDate.trim() !== ""
    ) {
      const searchFrom = new Date(fromDate);
      const searchUntil = new Date(untilDate);
      if (!isNaN(searchFrom.valueOf()) && !isNaN(searchUntil.valueOf())) {
        // Overlap condition: listing.availableFrom <= requested until 
        // and listing.availableTo >= requested from.
        listingFilter.availableFrom = { $lte: searchUntil };
        listingFilter.availableTo = { $gte: searchFrom };
      }
    }
    
    // Optional: Log the filters for debugging.
    const util = require('util');
    console.log('Car Filter:', util.inspect(carFilter, { depth: null }));
    console.log('Listing Filter:', util.inspect(listingFilter, { depth: null }));
    
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
