// server/controllers/carController.js
const path          = require('path');
const Car           = require('../models/Car');
const Listing       = require('../models/Listing');
const Business      = require('../models/Business');
const NodeGeocoder  = require('node-geocoder');

// ────────────────────────────  GEO  ──────────────────────────────
const geocoder = NodeGeocoder({
  provider : 'google',
  apiKey   : process.env.GOOGLE_MAPS_API_KEY,
  formatter: null
});

// ───────────────────────── UPLOAD CAR ────────────────────────────
exports.uploadCar = async (req, res) => {
  const {
    carMake, model, location, latitude, longitude,
    pricePerDay, description, year, mileage, features,
    availableFrom, availableTo
  } = req.body;

  const businessId = req.business.id;
  // store only uploads/<filename>  →  keeps paths valid after re‑deploys
  const imageUrl = req.file
    ? 'uploads/' + path.basename(req.file.path).replace(/\\/g, '/')
    : '';

  try {
    const car = new Car({
      business   : businessId,
      carMake,
      model,
      location,
      latitude   : parseFloat(latitude),
      longitude  : parseFloat(longitude),
      pricePerDay,
      imageUrl,
      description,
      year,
      mileage,
      features   : features ? features.split(',').map(s => s.trim()) : [],
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      availableTo  : availableTo   ? new Date(availableTo)   : undefined
    });

    await car.save();
    await Business.findByIdAndUpdate(businessId, { $inc: { points: 10 } });

    res.status(201).json({ car });
  } catch (err) {
    console.error('Error uploading car:', err);
    res.status(500).json({ message: 'Server error while uploading car.' });
  }
};

// ─────────────────────── GET ALL CARS ────────────────────────────
exports.getCars = async (_req, res) => {
  try {
    const cars = await Car.find({}).populate('business', 'name email');
    res.json(cars);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ message: 'Server error while retrieving cars.' });
  }
};

// ─────────────── SINGLE‑COLLECTION CAR SEARCH ────────────────────
const searchCars = async (req, res) => {
  try {
    const { query, make, lat, lng, radius, price, vehicleType, year } = req.query;
    const filter = {};

    if (query?.trim()) {
      filter.$or = [
        { location: { $regex: query, $options: 'i' } },
        { address : { $regex: query, $options: 'i' } }
      ];
    }
    if (make?.trim())          filter.carMake = { $regex: make, $options: 'i' };
    if (lat && lng && radius) {
      const latN = parseFloat(lat);
      const lngN = parseFloat(lng);
      const r    = parseFloat(radius);
      filter.latitude  = { $gte: latN - r, $lte: latN + r };
      filter.longitude = { $gte: lngN - r, $lte: lngN + r };
    }
    if (price && parseFloat(price) > 0)
      filter.pricePerDay = { $lte: parseFloat(price) };
    if (year?.trim())          filter.year = parseInt(year, 10);
    if (vehicleType?.trim())   filter.model = { $regex: vehicleType, $options: 'i' };

    const cars = await Car.find(filter).populate('business', 'name email');
    res.json(cars);
  } catch (err) {
    console.error('Error searching cars:', err);
    res.status(500).json({ message: 'Server error while searching for cars.' });
  }
};
exports.searchCars = searchCars;   // <--  **THIS WAS MISSING**

// ───────────────────── SEARCH CARS + LISTINGS ────────────────────
exports.searchAll = async (req, res) => {
  try {
    const { query, make, lat, lng, radius, fromDate, untilDate,
            price, vehicleType, year } = req.query;

    /* ---------- build Car filter ---------- */
    const carFilter = {};
    if (query?.trim())          carFilter.$text = { $search: query };
    if (make?.trim())           carFilter.carMake = { $regex: make, $options: 'i' };
    if (lat && lng) {
      const latN = parseFloat(lat);
      const lngN = parseFloat(lng);
      const rDeg = (parseFloat(radius) || 50) / 111; // km→deg
      carFilter.latitude  = { $gte: latN - rDeg, $lte: latN + rDeg };
      carFilter.longitude = { $gte: lngN - rDeg, $lte: lngN + rDeg };
    }
    if (price && parseFloat(price) > 0)
      carFilter.pricePerDay = { $lte: parseFloat(price) };
    if (year?.trim())          carFilter.year = parseInt(year, 10);
    if (vehicleType?.trim())   carFilter.model = { $regex: vehicleType, $options: 'i' };

    /* ---------- build Listing filter ---------- */
    const listingFilter = {};
    if (query?.trim())         listingFilter.$text = { $search: query };
    if (make?.trim())          listingFilter.make = { $regex: make, $options: 'i' };
    if (price && parseFloat(price) > 0)
      listingFilter.pricePerDay = { $lte: parseFloat(price) };
    if (year?.trim())          listingFilter.year = parseInt(year, 10);
    if (vehicleType?.trim())   listingFilter.carType = { $regex: vehicleType, $options: 'i' };
    if (fromDate?.trim() && untilDate?.trim()) {
      const sFrom  = new Date(fromDate);
      const sUntil = new Date(untilDate);
      listingFilter.availableFrom = { $lte: sUntil };
      listingFilter.availableTo   = { $gte: sFrom  };
    }

    /* ---------- query DB ---------- */
    const [cars, listings] = await Promise.all([
      Car.find(carFilter).populate('business', 'name email'),
      Listing.find(listingFilter)
    ]);

    /* ---------- geocode missing coords & add priceLabel ---------- */
    const geocodeIfMissing = async (obj, addrField) => {
      if ((!obj.latitude || !obj.longitude) && obj[addrField]) {
        try {
          const geo = await geocoder.geocode(obj[addrField]);
          if (geo?.length) {
            obj.latitude  = geo[0].latitude;
            obj.longitude = geo[0].longitude;
          }
        } catch (e) {
          console.error('Geocode error:', e);
        }
      }
      obj.priceLabel = obj.pricePerDay ? `£${parseFloat(obj.pricePerDay).toFixed(0)}` : '£0';
      return obj;
    };

    const finalCars      = await Promise.all(cars.map(c  => geocodeIfMissing(c.toObject(),  'location')));
    const finalListings  = await Promise.all(listings.map(l => geocodeIfMissing(l.toObject(),'address')));

    res.json([
      ...finalCars.map(c  => ({ type: 'car',     data: c })),
      ...finalListings.map(l => ({ type: 'listing', data: l }))
    ]);
  } catch (err) {
    console.error('Error searching cars and listings:', err);
    res.status(500).json({ message: 'Server error while searching.' });
  }
};

// ─────────────────────── SINGLE CAR BY ID ────────────────────────
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('business', 'name email');
    if (!car) return res.status(404).json({ message: 'Car not found.' });
    res.json(car);
  } catch (err) {
    console.error('Error fetching car by ID:', err);
    res.status(500).json({ message: 'Server error while retrieving the car.' });
  }
};
