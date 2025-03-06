const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Business = require('../models/Business');

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let business = await Business.findOne({ googleId: profile.id });
        if (business) return done(null, business);
        business = new Business({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          verified: true
        });
        await business.save();
        return done(null, business);
      } catch (error) {
        return done(error, null);
      }
    }
  ));

  passport.serializeUser((business, done) => done(null, business.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const business = await Business.findById(id);
      done(null, business);
    } catch (err) {
      done(err, null);
    }
  });
};
