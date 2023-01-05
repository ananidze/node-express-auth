const passport = require("passport");
const User = require("../models/user.model");
const ROLES = require("../utils/roles");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/google/redirect",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      User.findOne(
        { email: profile._json.email },
        "-createdAt -updatedAt",
        async function (err, user) {
          if (!user) {
            user = await User.create({
              email: profile._json.email,
              firstName: profile._json.given_name,
              lastName: profile._json.family_name,
              picture: profile._json.picture,
              role: ROLES.User,
            });
          }
          return done(err, user, accessToken, refreshToken);
        }
      );
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN,
    },
    function (jwtPayload, done) {
      return User.findById(jwtPayload._id, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);
        return done(null, {
          _id: user._id,
          role: user.role,
          email: user.email,
          picture: user.picture,
          lastName: user.lastName,
          firstName: user.firstName,
        });
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
