const Car = require('../models/Car');
const Business = require('../models/Business');

exports.uploadCar = async (req, res) => {
  const { make, model, year, type, features, lat, lng, price_per_day } = req.body;
  const businessId = req.business.id;
  const imagePath = req.file ? req.file.path : '';
  try {
    const car = new Car({
      business: businessId,
      make,
      model,
      year,
      image: imagePath,
      type,
      features: features ? features.split(',') : [],
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      availableFrom: req.body.availableFrom,
      availableTo: req.body.availableTo,
      price_per_day
    });
    await car.save();
    await Business.findByIdAndUpdate(businessId, { $inc: { points: 10 } });
    res.json({ car });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.getCars = async (req, res) => {
  try {
    const cars = await Car.find({}).populate('business', 'name email');
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.searchCars = async (req, res) => {
  try {
    const { type, features, lat, lng, radius } = req.query;
    let query = {};
    if (type) query.type = type;
    if (features) {
      const featureArray = features.split(',');
      query.features = { $all: featureArray };
    }
    if (lat && lng && radius) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius)
        }
      };
    }
    const cars = await Car.find(query).populate('business', 'name email');
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('business', 'name email');
    res.json(car);
  } catch (error) {
    res.status(500).send('Server error');
  }
};
