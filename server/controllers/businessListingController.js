// server/controllers/businessListingController.js

const Listing = require('../models/Listing');

// POST /api/business/listings
exports.createListing = async (req, res) => {
  try {
    if (!req.business) {
      return res.status(403).json({ msg: 'Forbidden: Not a business user' });
    }
    const businessId = req.business.id;

    const {
      title, description, make, model, year, mileage,
      fuelType, engineSize, transmission, pricePerDay,
      availability, address, terms,
      gps, bluetooth, heatedSeats,
      parkingSensors, backupCamera,
      appleCarPlay, androidAuto
    } = req.body;

    // build relative paths array: e.g. ['uploads/1623456-car1.jpg', 'uploads/…']
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `uploads/${file.filename}`);
    }

    const newListing = new Listing({
      business,
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
      gps:           gps === 'true' || gps === true,
      bluetooth:     bluetooth === 'true' || bluetooth === true,
      heatedSeats:   heatedSeats === 'true' || heatedSeats === true,
      parkingSensors: parkingSensors === 'true' || parkingSensors === true,
      backupCamera:  backupCamera === 'true' || backupCamera === true,
      appleCarPlay:  appleCarPlay === 'true' || appleCarPlay === true,
      androidAuto:   androidAuto === 'true' || androidAuto === true,
      images:        imagePaths
    });

    await newListing.save();
    res.status(201).json({
      msg: 'Listing created successfully',
      listing: newListing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ msg: 'Server error while creating listing' });
  }
};
