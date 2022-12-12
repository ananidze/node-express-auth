const passport = require("passport");
const User = require("../models/user.model");
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy;


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3002/api/google/redirect",
  passReqToCallback: true,
},
function(request, accessToken, refreshToken, profile, done) {
  User.findOne({email: profile._json.email}, function(err, user) {
    return done(err, user)
  })
  // return done(null, profile)
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});