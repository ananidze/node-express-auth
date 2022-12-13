const passport = require("passport");
const User = require("../models/user.model");
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy;


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/google/redirect",
  passReqToCallback: true,
},
function(request, accessToken, refreshToken, profile, done) {
  User.findOne({email: profile._json.email}, async function(err, user) {
    if(!user) {
      user = await User.create({
        email: profile._json.email,
        firstName: profile._json.given_name,
        lastName: profile._json.family_name,
        picture: profile._json.picture,
      })
    }
    return done(err, user, accessToken, refreshToken)
  })
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});