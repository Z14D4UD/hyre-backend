/* eslint-disable no-console */
const path    = require('path');
const Listing = require('../models/Listing');
const Review  = require('../models/Review');

/** helper: convert multer file paths into public URLs */
const relPaths = (files = []) =>
  files.map(f => 'uploads/' + path.basename(f.path).replace(/\\/g, '/'));

exports.createListing = async (req, res) => {
  try {
    if (!req.business) return res.status(403).json({ msg: 'Forbidden' });
    const listing = await Listing.create({
      business:           req.business.id,
      title:              req.body.title,
      description:        req.body.description,
      carType:            req.body.carType,
      make:               req.body.make,
      model:              req.body.model,
      year:               req.body.year,
      mileage:            req.body.mileage,
      fuelType:           req.body.fuelType,
      engineSize:         req.body.engineSize,
      transmission:       req.body.transmission,
      licensePlate:       req.body.licensePlate,
      pricePerDay:        req.body.pricePerDay,
      terms:              req.body.terms,
      address:            req.body.address,
      availableFrom:      req.body.availableFrom ? new Date(req.body.availableFrom) : null,
      availableTo:        req.body.availableTo   ? new Date(req.body.availableTo)   : null,
      gps:                req.body.gps === 'true',
      bluetooth:          req.body.bluetooth === 'true',
      heatedSeats:        req.body.heatedSeats === 'true',
      parkingSensors:     req.body.parkingSensors === 'true',
      backupCamera:       req.body.backupCamera === 'true',
      appleCarPlay:       req.body.appleCarPlay === 'true',
      androidAuto:        req.body.androidAuto === 'true',
      keylessEntry:       req.body.keylessEntry === 'true',
      childSeat:          req.body.childSeat === 'true',
      leatherSeats:       req.body.leatherSeats === 'true',
      tintedWindows:      req.body.tintedWindows === 'true',
      convertible:        req.body.convertible === 'true',
      roofRack:           req.body.roofRack === 'true',
      petFriendly:        req.body.petFriendly === 'true',
      smokeFree:          req.body.smokeFree === 'true',
      seatCovers:         req.body.seatCovers === 'true',
      dashCam:            req.body.dashCam === 'true',
      images:             relPaths(req.files),
      cancellationPolicy: req.body.cancellationPolicy,       // ← new
    });
    res.status(201).json(listing);
  } catch (err) {
    console.error('CREATE listing err:', err);
    res.status(500).json({ msg: 'Server error creating listing' });
  }
};

exports.getBusinessListings = async (req, res) => {
  try {
    if (!req.business) return res.status(403).json({ msg: 'Forbidden' });
    const listings = await Listing.find({ business: req.business.id });
    res.json(listings);
  } catch (err) {
    console.error('FETCH business listings err:', err);
    res.status(500).json({ msg: 'Server error fetching listings' });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ msg: 'Not found' });
    res.json(listing);
  } catch (err) {
    console.error('FETCH listing (auth) err:', err);
    res.status(500).json({ msg: 'Server error fetching listing' });
  }
};

exports.getListingPublic = async (req, res) => {
  try {
    const listing = await Listing
      .findById(req.params.id)
      .populate('business', 'name createdAt avatarUrl')
      .lean();
    if (!listing) return res.status(404).json({ msg: 'Not found' });

    const reviews = await Review
      .find({ listing: listing._id })
      .populate('client', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ ...listing, reviews });
  } catch (err) {
    console.error('PUBLIC listing err:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ← NEW: returns all listings for public GET /api/listings
exports.getAllListings = async (_req, res) => {
  try {
    const listings = await Listing.find({});
    res.json(listings);
  } catch (err) {
    console.error('Error fetching all listings:', err);
    res.status(500).json({ msg: 'Server error fetching listings' });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const update = {
      title:              req.body.title,
      description:        req.body.description,
      carType:            req.body.carType,
      make:               req.body.make,
      model:              req.body.model,
      year:               req.body.year,
      mileage:            req.body.mileage,
      fuelType:           req.body.fuelType,
      engineSize:         req.body.engineSize,
      transmission:       req.body.transmission,
      licensePlate:       req.body.licensePlate,
      pricePerDay:        req.body.pricePerDay,
      terms:              req.body.terms,
      address:            req.body.address,
      availableFrom:      req.body.availableFrom ? new Date(req.body.availableFrom) : null,
      availableTo:        req.body.availableTo   ? new Date(req.body.availableTo)   : null,
      gps:                req.body.gps === 'true',
      bluetooth:          req.body.bluetooth === 'true',
      heatedSeats:        req.body.heatedSeats === 'true',
      parkingSensors:     req.body.parkingSensors === 'true',
      backupCamera:       req.body.backupCamera === 'true',
      appleCarPlay:       req.body.appleCarPlay === 'true',
      androidAuto:        req.body.androidAuto === 'true',
      keylessEntry:       req.body.keylessEntry === 'true',
      childSeat:          req.body.childSeat === 'true',
      leatherSeats:       req.body.leatherSeats === 'true',
      tintedWindows:      req.body.tintedWindows === 'true',
      convertible:        req.body.convertible === 'true',
      roofRack:           req.body.roofRack === 'true',
      petFriendly:        req.body.petFriendly === 'true',
      smokeFree:          req.body.smokeFree === 'true',
      seatCovers:         req.body.seatCovers === 'true',
      dashCam:            req.body.dashCam === 'true',
      cancellationPolicy: req.body.cancellationPolicy,  // ← new
    };
    if (req.files && req.files.length) update.images = relPaths(req.files);

    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error('UPDATE listing err:', err);
    res.status(500).json({ msg: 'Server error updating listing' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const del = await Listing.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Listing deleted successfully' });
  } catch (err) {
    console.error('DELETE listing err:', err);
    res.status(500).json({ msg: 'Server error deleting listing' });
  }
};
