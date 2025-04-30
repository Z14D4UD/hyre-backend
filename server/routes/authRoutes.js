// server/routes/authRoutes.js

const express = require('express');
const router  = express.Router();
const passport = require('passport');
const {
  signup,
  login,
  confirmEmail,
  forgotPassword,
  resetPassword,
  googleCallback
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login',   login);
router.get('/confirm/:token', confirmEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/google/callback',
  passport.authenticate('google',{ failureRedirect:'/login' }),
  googleCallback
);

module.exports = router;
