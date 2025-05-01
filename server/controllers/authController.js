// server/controllers/authController.js
/* eslint-disable no-console */

const Business  = require('../models/Business');
const Customer  = require('../models/Customer');
const Affiliate = require('../models/Affiliate');
const Admin     = require('../models/Admin');
const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcryptjs');
const crypto    = require('crypto');
const sendEmail = require('../utils/sendEmail');

/* ────────────────────────────────────────────────────────────── */
/*  HELPERS                                                      */
/* ────────────────────────────────────────────────────────────── */
const generateToken = () => crypto.randomBytes(20).toString('hex');

/* ────────────────────────────────────────────────────────────── */
/*  SIGN-UP                                                      */
/* ────────────────────────────────────────────────────────────── */
const signup = async (req, res) => {
  const { name, email, password, accountType } = req.body;

  try {
    /* ───────────── BUSINESS ───────────── */
    if (accountType === 'business') {
      let business = await Business.findOne({ email });
      if (business) return res.status(400).json({ msg: 'Business already exists' });

      const salt            = await bcrypt.genSalt(10);
      const hashedPassword  = await bcrypt.hash(password, salt);
      const emailToken      = generateToken();

      business = new Business({
        name,
        email,
        password: hashedPassword,
        emailConfirmationToken: emailToken
      });
      await business.save();

      /* send confirmation e-mail (async fire-and-forget) */
      const confirmUrl = `${process.env.FRONTEND_URL}/confirm/${emailToken}`;
      sendEmail({
        email:   business.email,
        subject: 'Hyre Account Confirmation',
        message: `Please confirm your email by clicking this link: ${confirmUrl}`
      }).catch(console.error);

      const token = jwt.sign(
        { id: business._id, accountType: 'business' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({
        token,
        business,
        msg: 'Signup successful. Please check your email to confirm your account.',
        redirectUrl: '/dashboard/business'
      });
    }

    /* ───────────── CUSTOMER ───────────── */
    if (accountType === 'customer') {
      let customer = await Customer.findOne({ email });
      if (customer) return res.status(400).json({ msg: 'Customer already exists' });

      const salt           = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      customer = new Customer({ name, email, password: hashedPassword });
      await customer.save();

      const token = jwt.sign(
        { id: customer._id, accountType: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({
        token,
        customer,
        msg: 'Customer signup successful.',
        redirectUrl: '/account'              // ← changed
      });
    }

    /* ───────────── AFFILIATE ───────────── */
    if (accountType === 'affiliate') {
      let affiliate = await Affiliate.findOne({ email });
      if (affiliate) return res.status(400).json({ msg: 'Affiliate already exists' });

      const salt           = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const affiliateCode  = crypto.randomBytes(4).toString('hex').toUpperCase();

      affiliate = new Affiliate({
        name,
        email,
        password: hashedPassword,
        affiliateCode
      });
      await affiliate.save();

      const token = jwt.sign(
        { id: affiliate._id, accountType: 'affiliate' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({
        token,
        affiliate,
        msg: 'Affiliate signup successful.',
        redirectUrl: '/dashboard/affiliate'
      });
    }

    return res.status(400).json({ msg: 'Invalid account type' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

/* ────────────────────────────────────────────────────────────── */
/*  LOGIN                                                        */
/* ────────────────────────────────────────────────────────────── */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user         = null;
    let accountType  = '';

    /* 1) Admin */
    user = await Admin.findOne({ email });
    if (user) accountType = 'admin';

    /* 2) Business */
    if (!user) {
      user        = await Business.findOne({ email });
      if (user) accountType = 'business';
    }

    /* 3) Customer */
    if (!user) {
      user        = await Customer.findOne({ email });
      if (user) accountType = 'customer';
    }

    /* 4) Affiliate */
    if (!user) {
      user        = await Affiliate.findOne({ email });
      if (user) accountType = 'affiliate';
    }

    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, accountType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    /* Decide destination */
    let redirectUrl = '/dashboard';
    if (accountType === 'admin')      redirectUrl = '/dashboard/admin';
    else if (accountType === 'business')   redirectUrl = '/dashboard/business';
    else if (accountType === 'customer')   redirectUrl = '/';          // ← changed
    else if (accountType === 'affiliate')  redirectUrl = '/dashboard/affiliate';

    return res.json({ token, user, accountType, redirectUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

/* ────────────────────────────────────────────────────────────── */
/*  CONFIRM-EMAIL                                                */
/* ────────────────────────────────────────────────────────────── */
const confirmEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const business = await Business.findOne({ emailConfirmationToken: token });
    if (!business) return res.status(400).send('Invalid or expired token.');

    business.verified = true;
    business.emailConfirmationToken = undefined;
    await business.save();

    return res.send(`
      <html>
        <head>
          <title>Hyre – Email Confirmed</title>
          <style>
            body{font-family:Arial;background:#f5f5f5;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
            .box{background:#fff;padding:2rem;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);text-align:center}
            h1{color:#38b6ff;margin:0 0 1rem}
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Thank you for signing up to Hyre!</h1>
            <p>Your email has been successfully confirmed.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

/* ────────────────────────────────────────────────────────────── */
/*  PLACE-HOLDERS (not yet implemented)                          */
/* ────────────────────────────────────────────────────────────── */
const forgotPassword = async (_req, res) => res.json({ msg: 'forgotPassword not implemented yet.' });
const resetPassword  = async (_req, res) => res.json({ msg: 'resetPassword not implemented yet.' });
const googleCallback = (_req, res) =>    res.json({ msg: 'googleCallback not implemented yet.' });

module.exports = {
  signup,
  login,
  confirmEmail,
  forgotPassword,
  resetPassword,
  googleCallback
};
