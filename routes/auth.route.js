const router = require('express').Router();
const { signUp, login,  refreshToken, protected, googleLogin, googleRedirect, clearSession } = require('../controllers/auth.controller');
const  isLoggedIn  = require('../middlewares/isLoggedIn');
const { validateSignUp, validateLogin, validateRefreshToken } = require('../middlewares/validator');
const passport = require('passport');
const roleMiddleware = require('../middlewares/role');


router.get(`/google`, googleLogin);
router.get('/user', isLoggedIn, roleMiddleware(['User']), (req, res) => { res.json(req.user) });
router.get("/logout", clearSession);
router.post("/login", validateLogin, login);
router.post("/sign-up", validateSignUp, signUp);
router.get('/protected',  isLoggedIn, protected);
router.post('/refresh', validateRefreshToken, refreshToken);
router.get('/google/redirect', passport.authenticate('google', { failureRedirect: '/login' }), googleRedirect )

module.exports = router;