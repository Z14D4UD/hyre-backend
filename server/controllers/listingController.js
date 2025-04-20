// server/controllers/listingController.js
const Listing = require('../models/Listing');
const path    = require('path');

// helper: strip absolute path → store only "uploads/xxx.jpg"
function relPaths(files) {
  return files.map(f =>
    // use forward‑slashes and only the uploads/<filename> portion
    'uploads/' + path.basename(f.path).replace(/\\/g, '/')
  );
}

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    if (!req.business) return res.status(403).json({ msg: 'Forbidden' });

    const imagePaths = req.files ? relPaths(req.files) : [];
    const newListing = new Listing({
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
      gps:           req.body.gps === 'true',
      bluetooth:     req.body.bluetooth === 'true',
      heatedSeats:   req.body.heatedSeats === 'true',
      parkingSensors:req.body.parkingSensors === 'true',
      backupCamera:  req.body.backupCamera === 'true',
      appleCarPlay:  req.body.appleCarPlay === 'true',
      androidAuto:   req.body.androidAuto === 'true',
      keylessEntry:  req.body.keylessEntry === 'true',
      childSeat:     req.body.childSeat === 'true',
      leatherSeats:  req.body.leatherSeats === 'true',
      tintedWindows: req.body.tintedWindows === 'true',
      convertible:   req.body.convertible === 'true',
      roofRack:      req.body.roofRack === 'true',
      petFriendly:   req.body.petFriendly === 'true',
      smokeFree:     req.body.smokeFree === 'true',
      seatCovers:    req.body.seatCovers === 'true',
      dashCam:       req.body.dashCam === 'true',
      images:        imagePaths,
    });

    const saved = await newListing.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ msg: 'Server error creating listing' });
  }
};



// Get all listings for the logged-in business
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

// Get a single listing by ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ msg: 'Not found' });
    res.json(listing);
  } catch (err) {
    console.error('Error fetching listing by id:', err);
    res.status(500).json({ msg: 'Server error fetching listing' });
  }
};

// Update a listing, optionally appending new images
exports.updateListing = async (req, res) => {
  try {
    const update = {
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
      gps:           req.body.gps === 'true',
      bluetooth:     req.body.bluetooth === 'true',
      heatedSeats:   req.body.heatedSeats === 'true',
      parkingSensors:req.body.parkingSensors === 'true',
      backupCamera:  req.body.backupCamera === 'true',
      appleCarPlay:  req.body.appleCarPlay === 'true',
      androidAuto:   req.body.androidAuto === 'true',
      keylessEntry:  req.body.keylessEntry === 'true',
      childSeat:     req.body.childSeat === 'true',
      leatherSeats:  req.body.leatherSeats === 'true',
      tintedWindows: req.body.tintedWindows === 'true',
      convertible:   req.body.convertible === 'true',
      roofRack:      req.body.roofRack === 'true',
      petFriendly:   req.body.petFriendly === 'true',
      smokeFree:     req.body.smokeFree === 'true',
      seatCovers:    req.body.seatCovers === 'true',
      dashCam:       req.body.dashCam === 'true',
    };

    // replace old images entirely if new files provided
    if (req.files && req.files.length > 0) {
      update.images = relPaths(req.files);
    }

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

// Delete a listing
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
