// server/controllers/listingController.js
const Listing = require('../models/Listing');

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    const businessId = req.business.id;
    // Create an array of image paths (assuming multer saves them to "uploads/")
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    // Build the listing data from the request body and files
    const newListing = new Listing({
      business: businessId,
      title: req.body.title,
      description: req.body.description,
      carType: req.body.carType,
      make: req.body.make,
      model: req.body.model,
      year: req.body.year,
      mileage: req.body.mileage,
      fuelType: req.body.fuelType,
      engineSize: req.body.engineSize,
      transmission: req.body.transmission,
      licensePlate: req.body.licensePlate, // now stored in model
      pricePerDay: req.body.pricePerDay,
      terms: req.body.terms,
      address: req.body.address,
      availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : null,
      availableTo: req.body.availableTo ? new Date(req.body.availableTo) : null,
      // Feature flags – convert string "true" to boolean if needed
      gps: req.body.gps === 'true' || req.body.gps === true,
      bluetooth: req.body.bluetooth === 'true' || req.body.bluetooth === true,
      heatedSeats: req.body.heatedSeats === 'true' || req.body.heatedSeats === true,
      parkingSensors: req.body.parkingSensors === 'true' || req.body.parkingSensors === true,
      backupCamera: req.body.backupCamera === 'true' || req.body.backupCamera === true,
      appleCarPlay: req.body.appleCarPlay === 'true' || req.body.appleCarPlay === true,
      androidAuto: req.body.androidAuto === 'true' || req.body.androidAuto === true,
      keylessEntry: req.body.keylessEntry === 'true' || req.body.keylessEntry === true,
      childSeat: req.body.childSeat === 'true' || req.body.childSeat === true,
      leatherSeats: req.body.leatherSeats === 'true' || req.body.leatherSeats === true,
      tintedWindows: req.body.tintedWindows === 'true' || req.body.tintedWindows === true,
      convertible: req.body.convertible === 'true' || req.body.convertible === true,
      roofRack: req.body.roofRack === 'true' || req.body.roofRack === true,
      petFriendly: req.body.petFriendly === 'true' || req.body.petFriendly === true,
      smokeFree: req.body.smokeFree === 'true' || req.body.smokeFree === true,
      seatCovers: req.body.seatCovers === 'true' || req.body.seatCovers === true,
      dashCam: req.body.dashCam === 'true' || req.body.dashCam === true,
      images: imagePaths,
    });

    const savedListing = await newListing.save();
    res.json(savedListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ msg: 'Server error creating listing' });
  }
};

// Get all listings for the logged-in business
exports.getBusinessListings = async (req, res) => {
  try {
    const businessId = req.business.id;
    const listings = await Listing.find({ business: businessId });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching business listings:', error);
    res.status(500).json({ msg: 'Server error fetching listings' });
  }
};

// Get a single listing by ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ msg: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing by id:', error);
    res.status(500).json({ msg: 'Server error fetching listing' });
  }
};

// Update a listing
exports.updateListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    // Build an update object with fields from req.body
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      carType: req.body.carType,
      make: req.body.make,
      model: req.body.model,
      year: req.body.year,
      mileage: req.body.mileage,
      fuelType: req.body.fuelType,
      engineSize: req.body.engineSize,
      transmission: req.body.transmission,
      licensePlate: req.body.licensePlate,
      pricePerDay: req.body.pricePerDay,
      terms: req.body.terms,
      address: req.body.address,
      availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : null,
      availableTo: req.body.availableTo ? new Date(req.body.availableTo) : null,
      gps: req.body.gps === 'true' || req.body.gps === true,
      bluetooth: req.body.bluetooth === 'true' || req.body.bluetooth === true,
      heatedSeats: req.body.heatedSeats === 'true' || req.body.heatedSeats === true,
      parkingSensors: req.body.parkingSensors === 'true' || req.body.parkingSensors === true,
      backupCamera: req.body.backupCamera === 'true' || req.body.backupCamera === true,
      appleCarPlay: req.body.appleCarPlay === 'true' || req.body.appleCarPlay === true,
      androidAuto: req.body.androidAuto === 'true' || req.body.androidAuto === true,
      keylessEntry: req.body.keylessEntry === 'true' || req.body.keylessEntry === true,
      childSeat: req.body.childSeat === 'true' || req.body.childSeat === true,
      leatherSeats: req.body.leatherSeats === 'true' || req.body.leatherSeats === true,
      tintedWindows: req.body.tintedWindows === 'true' || req.body.tintedWindows === true,
      convertible: req.body.convertible === 'true' || req.body.convertible === true,
      roofRack: req.body.roofRack === 'true' || req.body.roofRack === true,
      petFriendly: req.body.petFriendly === 'true' || req.body.petFriendly === true,
      smokeFree: req.body.smokeFree === 'true' || req.body.smokeFree === true,
      seatCovers: req.body.seatCovers === 'true' || req.body.seatCovers === true,
      dashCam: req.body.dashCam === 'true' || req.body.dashCam === true,
    };

    // If new images are uploaded, replace the images array
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ msg: 'Listing not found' });
    }

    res.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ msg: 'Server error updating listing' });
  }
};

// Delete a listing
exports.deleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const deletedListing = await Listing.findByIdAndDelete(listingId);
    if (!deletedListing) {
      return res.status(404).json({ msg: 'Listing not found' });
    }
    res.json({ msg: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ msg: 'Server error deleting listing' });
  }
};
