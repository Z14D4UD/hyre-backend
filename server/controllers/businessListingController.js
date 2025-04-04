// server/controllers/businessListingController.js
const Listing = require('../models/Listing');

exports.createListing = async (req, res) => {
  try {
    // Ensure the user is a business user
    if (!req.business) {
      return res.status(403).json({ msg: 'Forbidden: Not a business user' });
    }

    // Get business ID
    const businessId = req.business.id;

    // Extract fields from the request body
    const {
      title,
      description,
      make,
      model,
      year,
      mileage,
      fuelType,
      engineSize,
      transmission,
      pricePerDay,
      availability,
      address,
      terms,
      gps,
      bluetooth,
      heatedSeats,
      parkingSensors,
      backupCamera,
      appleCarPlay,
      androidAuto
    } = req.body;

    // Process uploaded images (multiple files)
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => file.path); // e.g., "uploads/1616161616-filename.jpg"
    }

    // Create a new Listing object
    const newListing = new Listing({
      business: businessId,
      title,
      description,
      make,
      model,
      year,
      mileage,
      fuelType,
      engineSize,
      transmission,
      pricePerDay,
      availability,
      address,
      terms,
      gps: gps === 'true' || gps === true,
      bluetooth: bluetooth === 'true' || bluetooth === true,
      heatedSeats: heatedSeats === 'true' || heatedSeats === true,
      parkingSensors: parkingSensors === 'true' || parkingSensors === true,
      backupCamera: backupCamera === 'true' || backupCamera === true,
      appleCarPlay: appleCarPlay === 'true' || appleCarPlay === true,
      androidAuto: androidAuto === 'true' || androidAuto === true,
      images: imagePaths,
    });

    await newListing.save();

    res.status(201).json({ msg: 'Listing created successfully', listing: newListing });
  } catch (error) {
    console.error('Error creating listing:', error.stack);
    res.status(500).json({ msg: 'Server error while creating listing' });
  }
};
