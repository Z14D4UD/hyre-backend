// server/controllers/carController.js
const Car = require('../models/Car');
const Listing = require('../models/Listing');
const Business = require('../models/Business');

const NodeGeocoder = require('node-geocoder');
const geocoderOptions = {
  provider: 'google',
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  formatter: null
};
const geocoder = NodeGeocoder(geocoderOptions);

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
 * Retrieve all cars.
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
 * Search for cars only.
 */
exports.searchCars = async (req, res) => {
  try {
    const { query, make, lat, lng, radius, price, vehicleType, year } = req.query;
    let filter = {};
    if (query && query.trim() !== "") {
      filter.$or = [
        { location: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ];
    }
    if (make && make.trim() !== "") {
      filter.carMake = { $regex: make, $options: 'i' };
    }
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const rad = parseFloat(radius);
      filter.latitude = { $gte: latNum - rad, $lte: latNum + rad };
      filter.longitude = { $gte: lngNum - rad, $lte: lngNum + rad };
    }
    if (price && parseFloat(price) > 0) {
      filter.pricePerDay = { $lte: parseFloat(price) };
    }
    if (year && year.trim() !== "") {
      filter.year = parseInt(year, 10);
    }
    if (vehicleType && vehicleType.trim() !== "") {
      filter.model = { $regex: vehicleType, $options: 'i' };
    }
    console.log('Car Search Filter:', require('util').inspect(filter, { depth: null }));
    const cars = await Car.find(filter).populate('business', 'name email');
    res.json(cars);
  } catch (error) {
    console.error('Error searching cars:', error);
    res.status(500).json({ message: 'Server error while searching for cars.' });
  }
};

/**
 * Search across both Car and Listing collections.
 * - For Cars: use full-text search if a query is provided, and apply additional filters.
 * - For Listings: use full-text search on address/title and apply filters.
 *   If fromDate and untilDate are provided, perform an overlap check.
 *   Listings lacking coordinates are geocoded via node-geocoder.
 */
exports.searchAll = async (req, res) => {
  try {
    const { query, make, lat, lng, radius, fromDate, untilDate, price, vehicleType, year } = req.query;
    
    // Car filter:
    let carFilter = {};
    if (query && query.trim() !== "") {
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
      carFilter.model = { $regex: vehicleType, $options: 'i' };
    }
    
    // Listing filter:
    let listingFilter = {};
    if (query && query.trim() !== "") {
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
    // Date overlap filter for Listings:
    if (fromDate && fromDate.trim() !== "" && untilDate && untilDate.trim() !== "") {
      const searchFrom = new Date(fromDate);
      const searchUntil = new Date(untilDate);
      if (!isNaN(searchFrom.valueOf()) && !isNaN(searchUntil.valueOf())) {
        listingFilter.availableFrom = { $lte: searchUntil };
        listingFilter.availableTo = { $gte: searchFrom };
      }
    }
    
    const util = require('util');
    console.log('Car Filter:', util.inspect(carFilter, { depth: null }));
    console.log('Listing Filter:', util.inspect(listingFilter, { depth: null }));
    
    // Execute queries concurrently.
    const [cars, listings] = await Promise.all([
      Car.find(carFilter).populate('business', 'name email'),
      Listing.find(listingFilter)
    ]);
    
    // For each listing, if latitude/longitude are missing, geocode the address.
    const geocodedListings = await Promise.all(
      listings.map(async (listing) => {
        if (!listing.latitude || !listing.longitude) {
          try {
            const geoRes = await geocoder.geocode(listing.address);
            if (geoRes && geoRes.length > 0) {
              listing = listing.toObject();
              listing.latitude = geoRes[0].latitude;
              listing.longitude = geoRes[0].longitude;
            }
          } catch (err) {
            console.error('Geocoding error for listing', listing._id, err);
          }
        }
        return listing;
      })
    );
    
    // Merge results.
    const results = [
      ...cars.map(item => ({ type: 'car', data: item })),
      ...geocodedListings.map(item => ({ type: 'listing', data: item }))
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
