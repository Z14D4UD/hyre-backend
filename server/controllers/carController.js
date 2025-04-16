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
    availableFrom, // expected as a date string e.g. "2025-03-25"
    availableTo    // expected as a date string e.g. "2025-03-27"
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
 * Search for cars using fuzzy matching on location and address.
 * Additional filters for make, price, year, and vehicleType are applied.
 * Date filtering is omitted for Cars.
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
 * Search across both the Car and Listing collections.
 * For Cars:
 *   - If a location query is provided, use full‑text search ($text) on indexed fields.
 *   - Additional filters (make, price, year, vehicleType) are applied.
 *   - If lat/lng are provided, a bounding box filter is applied.
 * For Listings:
 *   - Use full‑text search on address and title.
 *   - Additional filters (make, price, year, vehicleType) are applied.
 *   - Date overlap filtering is applied if fromDate and untilDate are provided.
 *   - If latitude/longitude are missing, the address is geocoded.
 * Also, add a "priceLabel" field (e.g., "£1000") for front‑end marker labeling.
 */
exports.searchAll = async (req, res) => {
  try {
    const { query, make, lat, lng, radius, fromDate, untilDate, price, vehicleType, year } = req.query;
    
    // Build filter for Car collection.
    let carFilter = {};
    if (query && query.trim() !== "") {
      carFilter.$text = { $search: query };
    }
    if (make && make.trim() !== "") {
      carFilter.carMake = { $regex: make, $options: 'i' };
    }
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const rad = parseFloat(radius) || 50; // default radius 50 km
      const degRadius = rad / 111; // approximate conversion
      carFilter.latitude = { $gte: latNum - degRadius, $lte: latNum + degRadius };
      carFilter.longitude = { $gte: lngNum - degRadius, $lte: lngNum + degRadius };
    }
    if (price && price.toString().trim() !== "" && parseFloat(price) > 0) {
      carFilter.pricePerDay = { $lte: parseFloat(price) };
    }
    if (year && year.trim() !== "") {
      carFilter.year = parseInt(year, 10);
    }
    if (vehicleType && vehicleType.trim() !== "") {
      carFilter.model = { $regex: vehicleType, $options: 'i' };
    }
    
    // Build filter for Listing collection.
    let listingFilter = {};
    if (query && query.trim() !== "") {
      listingFilter.$text = { $search: query };
    }
    if (make && make.trim() !== "") {
      listingFilter.make = { $regex: make, $options: 'i' };
    }
    if (price && price.toString().trim() !== "" && parseFloat(price) > 0) {
      listingFilter.pricePerDay = { $lte: parseFloat(price) };
    }
    if (year && year.trim() !== "") {
      listingFilter.year = parseInt(year, 10);
    }
    if (vehicleType && vehicleType.trim() !== "") {
      listingFilter.carType = { $regex: vehicleType, $options: 'i' };
    }
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
    
    // For Cars, if latitude/longitude are missing, attempt to geocode using the "location" field.
    const geocodedCars = await Promise.all(
      cars.map(async (carDoc) => {
        let car = carDoc.toObject();
        if ((!car.latitude || !car.longitude) && car.location) {
          try {
            const geoRes = await geocoder.geocode(car.location);
            if (geoRes && geoRes.length > 0) {
              car.latitude = geoRes[0].latitude;
              car.longitude = geoRes[0].longitude;
            }
          } catch (err) {
            console.error('Geocoding error for Car', car._id, err);
          }
        }
        // Set priceLabel for marker display.
        if (car.pricePerDay) {
          car.priceLabel = `£${parseFloat(car.pricePerDay).toFixed(0)}`;
        } else {
          car.priceLabel = '£0';
        }
        return car;
      })
    );

    // For Listings, if latitude/longitude are missing, attempt to geocode using the "address" field.
    const geocodedListings = await Promise.all(
      listings.map(async (listingDoc) => {
        let listing = listingDoc.toObject();
        if ((!listing.latitude || !listing.longitude) && listing.address) {
          try {
            const geoRes = await geocoder.geocode(listing.address);
            if (geoRes && geoRes.length > 0) {
              listing.latitude = geoRes[0].latitude;
              listing.longitude = geoRes[0].longitude;
            }
          } catch (err) {
            console.error('Geocoding error for Listing', listing._id, err);
          }
        }
        if (listing.pricePerDay) {
          listing.priceLabel = `£${parseFloat(listing.pricePerDay).toFixed(0)}`;
        } else {
          listing.priceLabel = '£0';
        }
        return listing;
      })
    );

    const finalCars = geocodedCars.map(car => ({ type: 'car', data: car }));
    const finalListings = geocodedListings.map(lst => ({ type: 'listing', data: lst }));

    const results = [...finalCars, ...finalListings];
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
