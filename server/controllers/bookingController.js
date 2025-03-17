// server/controllers/bookingController.js
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Business = require('../models/Business');
const Affiliate = require('../models/Affiliate');
const PDFDocument = require('pdfkit');

exports.createBooking = async (req, res) => {
  const { carId, customerName, startDate, endDate, basePrice, currency, affiliateCode } = req.body;
  try {
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ msg: 'Car not found' });
    
    const businessId = car.business;
    const bookingFee = basePrice * 0.05;
    const serviceFee = basePrice * 0.05;
    const totalAmount = basePrice + bookingFee;
    const payout = basePrice - serviceFee;
    
    const bookingData = {
      car: carId,
      business: businessId,
      customerName,
      startDate,
      endDate,
      basePrice,
      bookingFee,
      serviceFee,
      totalAmount,
      payout,
      currency: currency || 'usd'
    };
    
    if (affiliateCode) {
      const affiliate = await Affiliate.findOne({ affiliateCode: affiliateCode.toUpperCase() });
      if (!affiliate) {
        return res.status(400).json({ msg: 'Invalid affiliate code' });
      }
      bookingData.affiliate = affiliate._id;
      const commission = basePrice * 0.10; // 10% commission
      affiliate.earnings += commission;
      await affiliate.save();
    }
    
    const booking = new Booking(bookingData);
    await booking.save();
    
    // Update business balance (if applicable)
    if (businessId) {
      await Business.findByIdAndUpdate(businessId, { $inc: { balance: payout } });
    }
    
    res.json({ booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).send('Server error');
  }
};

exports.requestPayout = async (req, res) => {
  if (!req.business) return res.status(401).json({ msg: 'Unauthorized' });
  const businessId = req.business.id;
  try {
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ msg: 'Business not found' });
    const payoutAmount = business.balance;
    business.balance = 0;
    await business.save();
    res.json({ msg: `Payout of $${payoutAmount.toFixed(2)} processed successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('car', 'make model')
      .populate('business', 'name email');
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    let query = {};
    if (req.accountType === 'business' && req.business) {
      query.business = req.business.id;
    } else if (req.accountType === 'customer' && req.customer) {
      query.customer = req.customer.id;
    } else if (req.accountType === 'affiliate' && req.affiliate) {
      query.affiliate = req.affiliate.id;
    } else {
      return res.status(400).json({ msg: 'Invalid account type for booking retrieval' });
    }
    const bookings = await Booking.find(query)
      .populate('car', 'make model')
      .populate('business', 'name email');
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    if (!req.customer) return res.status(401).json({ msg: 'Unauthorized' });
    const bookings = await Booking.find({ customer: req.customer.id })
      .populate('car', 'make model')
      .populate('business', 'name email');
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'make model')
      .populate('business', 'name email');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${booking._id}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Booking ID: ${booking._id}`);
    doc.text(`Customer Name: ${booking.customerName}`);
    doc.text(`Car: ${booking.car.make} ${booking.car.model}`);
    doc.text(`Booking Dates: ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`);
    doc.text(`Base Price: $${booking.basePrice}`);
    doc.text(`Booking Fee (5%): $${booking.bookingFee}`);
    doc.text(`Service Fee (5%): $${booking.serviceFee}`);
    doc.text(`Total Amount: $${booking.totalAmount}`);
    doc.text(`Amount to Payout: $${booking.payout}`);
    doc.text(`Currency: ${booking.currency.toUpperCase()}`);
    doc.moveDown();
    doc.text('Thank you for booking with Hyre!', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
