const passport = require("passport");
const RefreshToken = require("../models/refreshTokenmodel");

module.exports = async function (req, res, next) {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (!user) {
      return res.sendStatus(401);
    }
    req.user = user;
    next();
  })(req, res, next);
};
