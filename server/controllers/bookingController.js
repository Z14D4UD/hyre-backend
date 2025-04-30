// server/controllers/bookingController.js
const Booking      = require('../models/Booking');
const Listing      = require('../models/Listing');
const Business     = require('../models/Business');
const Affiliate    = require('../models/Affiliate');
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const Customer     = require('../models/Customer');
const PDFDocument  = require('pdfkit');
const {
  sendBookingApprovalEmail,
  sendBookingRejectionEmail,
  sendBookingReceivedEmail            // ← NEW helper
} = require('../utils/mailer');

/* ────────────────────────────────────────────────────────────── */
/*  CREATE BOOKING – runs right after Stripe / PayPal success    */
/* ────────────────────────────────────────────────────────────── */
exports.createBooking = async (req, res) => {
  if (!req.customer) {
    return res.status(401).json({ msg: 'Authentication required' });
  }

  const {
    carId,
    listingId,
    startDate,
    endDate,
    basePrice,
    currency,
    affiliateCode
  } = req.body;

  try {
    const lookupId  = listingId || carId;
    const listing   = await Listing.findById(lookupId);
    if (!listing) return res.status(404).json({ msg: 'Listing not found' });

    /* ── fetch customer name once so it is always present ── */
    const cust     = await Customer.findById(req.customer.id);
    const custName = cust?.name || 'Unknown';

    const businessId  = listing.business;
    const bookingFee  = basePrice * 0.05;
    const serviceFee  = basePrice * 0.05;
    const totalAmount = basePrice + bookingFee;
    const payout      = basePrice - serviceFee;

    const bookingData = {
      car:          lookupId,
      business:     businessId,
      customer:     req.customer.id,
      customerName: custName,
      startDate,
      endDate,
      basePrice,
      bookingFee,
      serviceFee,
      totalAmount,
      payout,
      currency:     currency || 'usd',
      status:       'Pending'
    };

    /* ── affiliate commission (unchanged) ── */
    if (affiliateCode) {
      const aff = await Affiliate.findOne({ affiliateCode: affiliateCode.toUpperCase() });
      if (!aff) return res.status(400).json({ msg: 'Invalid affiliate code' });
      bookingData.affiliate = aff._id;
      const commission      = basePrice * 0.10;
      aff.earnings         += commission;
      await aff.save();
    }

    /* ── create the booking ── */
    const booking = new Booking(bookingData);
    await booking.save();

    /* put funds in pendingBalance (unchanged) */
    if (businessId) {
      await Business.findByIdAndUpdate(businessId, {
        $inc: { pendingBalance: payout }
      });
    }

    /* ── immediate e-mail confirmation to customer (non-blocking) ── */
    try {
      await sendBookingReceivedEmail({
        customerEmail: cust.email,
        customerName:  custName,
        bookingId:     booking._id,
        startDate,
        endDate
      });
    } catch (mailErr) {
      console.warn('✉️  booking-received mail failed (ignored):', mailErr.message);
    }

    /* ─────────────────────────────────────────────── */
    /*  🔔 AUTOMATED CHAT CONVERSATION + MESSAGE       */
    /* ─────────────────────────────────────────────── */
    let convo = await Conversation.findOne({ bookingId: booking._id });
    if (!convo) {
      convo = await Conversation.create({
        bookingId:    booking._id,
        participants: [booking.customer, businessId].filter(Boolean),
        lastMessage:  ''
      });
    }

    const msgText =
      `🎉 Booking request received!\n\n` +
      `• Car: ${listing.make} ${listing.model}\n` +
      `• Dates: ${new Date(startDate).toLocaleDateString()} – ` +
                `${new Date(endDate).toLocaleDateString()}\n` +
      `• Status: Pending approval by host.`;

    const msg = await Message.create({
      conversation: convo._id,
      sender:       businessId,
      senderModel:  'Business',
      text:         msgText,
      readBy:       [businessId]           // customer sees it as UNREAD
    });

    convo.lastMessage = msg.text;
    convo.updatedAt   = Date.now();
    await convo.save();
    /* ─────────────────────────────────────────────── */

    return res.json({ booking });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).send('Server error');
  }
};

/* ────────────────────────────────────────────────────────────── */
/*  UPDATE BOOKING STATUS – business clicks Approve / Reject     */
/* ────────────────────────────────────────────────────────────── */
exports.updateBookingStatus = async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  try {
    const booking = await Booking.findById(bookingId)
      .populate('business', 'name email')
      .populate('customer', 'name email');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    booking.status = status;
    await booking.save();

    /* ── optional e-mail notification (ignored if fails) ── */
    const emailData = {
      customerEmail: booking.customer?.email,
      customerName:  booking.customer?.name || booking.customerName,
      bookingId:     booking._id,
      startDate:     booking.startDate,
      endDate:       booking.endDate
    };
    try {
      if (emailData.customerEmail) {
        if (status === 'Active')         await sendBookingApprovalEmail(emailData);
        else if (status === 'Cancelled') await sendBookingRejectionEmail(emailData);
      }
    } catch (mailErr) {
      console.warn('✉️  email failed (ignored):', mailErr.message);
    }

    /* ─────────────────────────────────────────────── */
    /*  send automated chat message                    */
    /* ─────────────────────────────────────────────── */
    let convo = await Conversation.findOne({ bookingId: booking._id });
    if (!convo) {
      convo = await Conversation.create({
        bookingId:    booking._id,
        participants: [booking.customer?._id, booking.business?._id].filter(Boolean),
        lastMessage:  ''
      });
    }

    const msgText =
      status === 'Active'
        ? `✅ Your booking ${booking._id} has been *approved*.\n\n` +
          `See you on ${new Date(booking.startDate).toLocaleDateString()}!`
        : `❌ Unfortunately, your booking ${booking._id} has been *rejected*.\n\n` +
          `Feel free to reply here if you have any questions.`;

    const msg = await Message.create({
      conversation: convo._id,
      sender:       booking.business._id,
      senderModel:  'Business',
      text:         msgText,
      readBy:       [booking.business._id]   // customer sees UNREAD badge
    });

    convo.lastMessage = msg.text;
    convo.updatedAt   = Date.now();
    await convo.save();
    /* ─────────────────────────────────────────────── */

    return res.json({ booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ msg: 'Server error while updating status' });
  }
};

/* ────────────────────────────────────────────────────────────── */
/*  PAYOUT REQUEST – business withdraws their available balance  */
/* ────────────────────────────────────────────────────────────── */
exports.requestPayout = async (req, res) => {
  if (!req.business) return res.status(401).json({ msg: 'Unauthorized' });
  const businessId = req.business.id;
  try {
    const biz = await Business.findById(businessId);
    if (!biz) return res.status(404).json({ msg: 'Business not found' });
    const payoutAmount = biz.balance;
    biz.balance = 0;
    await biz.save();
    return res.json({ msg: `Payout of $${payoutAmount.toFixed(2)} processed successfully.` });
  } catch (error) {
    console.error('Payout error:', error);
    return res.status(500).json({ msg: 'Server error processing payout' });
  }
};

/* ────────────────────────────────────────────────────────────── */
/*  PUBLIC: LIST ALL BOOKINGS                                    */
/* ────────────────────────────────────────────────────────────── */
exports.getBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('car', 'make model')
      .populate('business', 'name email')
      .populate('customer', 'name email');
    return res.json(bookings);
  } catch (error) {
    console.error('Error listing bookings:', error);
    return res.status(500).send('Server error');
  }
};

/* ────────────────────────────────────────────────────────────── */
/*  MY BOOKINGS (by role)                                        */
/* ────────────────────────────────────────────────────────────── */
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
    return res.json(bookings);
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    return res.status(500).send('Server error');
  }
};

/* ────────────────────────────────────────────────────────────── */
/*  CUSTOMER’S BOOKINGS                                          */
/* ────────────────────────────────────────────────────────────── */
exports.getCustomerBookings = async (req, res) => {
  try {
    if (!req.customer) return res.status(401).json({ msg: 'Unauthorized' });
    const bookings = await Booking.find({ customer: req.customer.id })
      .populate('car', 'make model images')     // include first image
      .populate('business', 'name email')       // host name
      .populate('customer', 'name email');
    return res.json(bookings);
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return res.status(500).send('Server error');
  }
};

/* ────────────────────────────────────────────────────────────── */
/*  SINGLE BOOKING – for payment success page                    */
/* ────────────────────────────────────────────────────────────── */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'make model')
      .populate('business', 'name email')
      .populate('customer', 'name email');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    return res.json(booking);
  } catch (err) {
    console.error('Error fetching booking:', err);
    return res.status(500).json({ msg: 'Server error fetching booking' });
  }
};

/* ────────────────────────────────────────────────────────────── */
/*  GENERATE PDF INVOICE                                         */
/* ────────────────────────────────────────────────────────────── */
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
    doc.text(`Car: ${booking.car.make} ${booking.car.model}`);
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
    console.error('Error generating invoice:', error);
    return res.status(500).send('Server error');
  }
};
