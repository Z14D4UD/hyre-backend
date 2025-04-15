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
 * Search across both the Car and Listing collections.
 * 
 * For Cars:
 *   - If a location query is provided, use full-text search ($text) on indexed fields.
 *   - Apply additional filters (make, price, year, vehicleType). Date filtering is omitted.
 *   - Additionally, if lat/lng are provided, a bounding box filter is applied.
 * 
 * For Listings:
 *   - Use full-text search on address/title.
 *   - Apply additional filters (make, price, year, vehicleType).
 *   - If fromDate and untilDate are provided, perform date overlap filtering.
 *   - If latitude/longitude are missing, geocode the address.
 */
exports.searchAll = async (req, res) => {
  try {
    const { query, make, lat, lng, radius, fromDate, untilDate, price, vehicleType, year } = req.query;
    
    // Build filter for the Car collection.
    let carFilter = {};
    if (query && query.trim() !== "") {
      carFilter.$text = { $search: query };
    }
    if (make && make.trim() !== "") {
      carFilter.carMake = { $regex: make, $options: 'i' };
    }
    // If lat/lng are provided, use a bounding box filter.
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      // Use the provided radius in km or default to 50 km
      const rad = parseFloat(radius) || 50;
      // Approximate degrees for given km (1 degree ~111 km)
      const degRadius = rad / 111;
      carFilter.latitude = { $gte: latNum - degRadius, $lte: latNum + degRadius };
      carFilter.longitude = { $gte: lngNum - degRadius, $lte: lngNum + degRadius };
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
    
    // Build filter for the Listing collection.
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
    // Date filtering (only for listings) if both fromDate and untilDate are provided.
    if (fromDate && fromDate.trim() !== "" && untilDate && untilDate.trim() !== "") {
      const searchFrom = new Date(fromDate);
      const searchUntil = new Date(untilDate);
      if (!isNaN(searchFrom.valueOf()) && !isNaN(searchUntil.valueOf())) {
        listingFilter.availableFrom = { $lte: searchUntil };
        listingFilter.availableTo = { $gte: searchFrom };
      }
    }
    
    // OPTIONAL: If lat/lng provided, you can further narrow listings by location
    // using a simple bounding box (for simplicity, omitted if you wish only text filtering).
    
    const util = require('util');
    console.log('Car Filter:', util.inspect(carFilter, { depth: null }));
    console.log('Listing Filter:', util.inspect(listingFilter, { depth: null }));
    
    // Execute both queries concurrently.
    const [cars, listings] = await Promise.all([
      Car.find(carFilter).populate('business', 'name email'),
      Listing.find(listingFilter)
    ]);
    
    // For each listing, if latitude/longitude are missing, attempt to geocode the address.
    const geocodedListings = await Promise.all(
      listings.map(async (listing) => {
        // Check for numeric latitude and longitude.
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
    
    // Merge results from both queries.
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
