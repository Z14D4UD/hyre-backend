// server/controllers/bookingController.js

const Booking       = require('../models/Booking');
const Listing       = require('../models/Listing');
const Business      = require('../models/Business');
const Affiliate     = require('../models/Affiliate');
const Conversation  = require('../models/Conversation');
const Message       = require('../models/Message');
const PDFDocument   = require('pdfkit');
const {
  sendBookingApprovalEmail,
  sendBookingRejectionEmail
} = require('../utils/mailer');

exports.createBooking = async (req, res) => {
  const {
    carId,
    listingId,
    customerName,
    startDate,
    endDate,
    basePrice,
    currency,
    affiliateCode
  } = req.body;

  try {
    const lookupId = listingId || carId;
    const listing  = await Listing.findById(lookupId);
    if (!listing) return res.status(404).json({ msg: 'Listing not found' });

    const businessId  = listing.business;
    const bookingFee  = basePrice * 0.05;
    const serviceFee  = basePrice * 0.05;
    const totalAmount = basePrice + bookingFee;
    const payout      = basePrice - serviceFee;

    const bookingData = {
      car:          lookupId,
      business:     businessId,
      customerName,
      startDate,
      endDate,
      basePrice,
      bookingFee,
      serviceFee,
      totalAmount,
      payout,
      currency:     currency || 'usd',
      status:       'Pending',
    };

    if (affiliateCode) {
      const aff = await Affiliate.findOne({ affiliateCode: affiliateCode.toUpperCase() });
      if (!aff) return res.status(400).json({ msg: 'Invalid affiliate code' });
      bookingData.affiliate = aff._id;
      const commission      = basePrice * 0.10;
      aff.earnings         += commission;
      await aff.save();
    }

    const booking = new Booking(bookingData);
    await booking.save();

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
    const biz = await Business.findById(businessId);
    if (!biz) return res.status(404).json({ msg: 'Business not found' });
    const payoutAmount = biz.balance;
    biz.balance = 0;
    await biz.save();
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
      .populate('business', 'name email')
      .populate('customer', 'name email');
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
      .populate('business', 'name email')
      .populate('customer', 'name email');
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
      .populate('business', 'name email')
      .populate('customer', 'name email');
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
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice_${booking._id}.pdf`
    );
    doc.pipe(res);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Booking ID: ${booking._id}`);
    doc.text(`Customer Name: ${booking.customerName}`);
    doc.text(
      `Car: ${booking.car.make} ${booking.car.model}`
    );
    doc.text(
      `Booking Dates: ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(
        booking.endDate
      ).toLocaleDateString()}`
    );
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

/**
 * PATCH /api/bookings/:id/status
 * Body: { status: 'Pending' | 'Active' | 'Cancelled' }
 */
exports.updateBookingStatus = async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  try {
    // Fetch booking + business + customer
    const booking = await Booking.findById(bookingId)
      .populate('business', 'name email')
      .populate('customer', 'name email');

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Update status
    booking.status = status;
    await booking.save();

    // Prepare email data safely
    const emailData = {
      customerEmail: booking.customer?.email,
      customerName:  booking.customer?.name || booking.customerName,
      bookingId:     booking._id,
      startDate:     booking.startDate,
      endDate:       booking.endDate
    };

    // Only send if we have an email address
    if (emailData.customerEmail) {
      if (status === 'Active') {
        await sendBookingApprovalEmail(emailData);
      } else if (status === 'Cancelled') {
        await sendBookingRejectionEmail(emailData);
      }
    } else {
      console.warn(`Skipping email send: no customer email for booking ${booking._id}`);
    }

    // In-app chat notification
    let convo = await Conversation.findOne({ bookingId: booking._id });
    if (!convo) {
      convo = await Conversation.create({
        bookingId:   booking._id,
        participants:[booking.customer?._id].filter(Boolean)
      });
    }

    const msgText = `Your booking ${booking._id} has been ${status.toLowerCase()}.`;
    const msg = await Message.create({
      conversation: convo._id,
      sender:       booking.business._id,
      senderModel:  'Business',
      text:         msgText,
      readBy:       [booking.business._id]
    });

    convo.lastMessage = msg.text;
    convo.updatedAt   = Date.now();
    await convo.save();

    return res.json({ booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ msg: 'Server error while updating status' });
  }
};
