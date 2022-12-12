const router = require('express').Router();
const { signUp, login, logout, refreshToken, protected } = require('../controllers/auth.controller');
const { validateSignUp, validateLogin, validateRefreshToken } = require('../middlewares/validator');
const isAuthenticated = require('../middlewares/isAuthenticated');
const passport = require('passport');

function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
  }

router.post("/sign-up", validateSignUp, signUp);
router.post("/login", validateLogin, login);
router.get('/google',
  passport.authenticate('google', { scope:
      [ 'profile', 'email' ] }
));

router.get('/google/redirect',
passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('/api/protected');
  });
router.get('/protected',  isLoggedIn, protected);
router.post('/refresh', validateRefreshToken, refreshToken);
router.delete('/logout', isAuthenticated, logout);

module.exports = router;
