//  server/controllers/listingController.js
const path     = require('path');
const Listing  = require('../models/Listing');

/* ───────────────────────── helpers ── */
const relPaths = (files = []) =>
  files.map(f => 'uploads/' + path.basename(f.path).replace(/\\/g, '/'));

/* ───────────────────────── CRUD (auth required) ── */
exports.createListing = async (req, res) => {
  try {
    if (!req.business) return res.status(403).json({ msg: 'Forbidden' });

    const listing = new Listing({
      business:      req.business.id,
      title:         req.body.title,
      description:   req.body.description,
      carType:       req.body.carType,
      make:          req.body.make,
      model:         req.body.model,
      year:          req.body.year,
      mileage:       req.body.mileage,
      fuelType:      req.body.fuelType,
      engineSize:    req.body.engineSize,
      transmission:  req.body.transmission,
      licensePlate:  req.body.licensePlate,
      pricePerDay:   req.body.pricePerDay,
      terms:         req.body.terms,
      address:       req.body.address,
      availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : null,
      availableTo:   req.body.availableTo   ? new Date(req.body.availableTo)   : null,

      /* feature flags (checkboxes come as "true"/undefined) */
      gps:            req.body.gps === 'true',
      bluetooth:      req.body.bluetooth === 'true',
      heatedSeats:    req.body.heatedSeats === 'true',
      parkingSensors: req.body.parkingSensors === 'true',
      backupCamera:   req.body.backupCamera === 'true',
      appleCarPlay:   req.body.appleCarPlay === 'true',
      androidAuto:    req.body.androidAuto === 'true',
      keylessEntry:   req.body.keylessEntry === 'true',
      childSeat:      req.body.childSeat === 'true',
      leatherSeats:   req.body.leatherSeats === 'true',
      tintedWindows:  req.body.tintedWindows === 'true',
      convertible:    req.body.convertible === 'true',
      roofRack:       req.body.roofRack === 'true',
      petFriendly:    req.body.petFriendly === 'true',
      smokeFree:      req.body.smokeFree === 'true',
      seatCovers:     req.body.seatCovers === 'true',
      dashCam:        req.body.dashCam === 'true',

      images: relPaths(req.files),
    });

    const saved = await listing.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ msg: 'Server error creating listing' });
  }
};

exports.getBusinessListings = async (req, res) => {
  try {
    if (!req.business) return res.status(403).json({ msg: 'Forbidden' });
    const listings = await Listing.find({ business: req.business.id });
    res.json(listings);
  } catch (err) {
    console.error('Error fetching business listings:', err);
    res.status(500).json({ msg: 'Server error fetching listings' });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing
      .findById(req.params.id)
      .populate('business', 'name email avatar rating createdAt');
    if (!listing) return res.status(404).json({ msg: 'Not found' });
    res.json(listing);
  } catch (err) {
    console.error('Error fetching listing by id:', err);
    res.status(500).json({ msg: 'Server error fetching listing' });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.files?.length) update.images = relPaths(req.files);

    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ msg: 'Server error updating listing' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const deleted = await Listing.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ msg: 'Server error deleting listing' });
  }
};

/* ───────────────────────── PUBLIC READ‑ONLY ── */
exports.getListingPublic = async (req, res) => {
  try {
    const listing = await Listing
      .findById(req.params.id)
      .populate('business', 'name avatar rating createdAt');
    if (!listing) return res.status(404).json({ msg: 'Not found' });
    res.json(listing);
  } catch (err) {
    console.error('Error fetching public listing:', err);
    res.status(500).json({ msg: 'Server error fetching listing' });
  }
};
