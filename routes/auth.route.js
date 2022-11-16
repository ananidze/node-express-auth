const router = require('express').Router();
const { signUp, login, logout, refreshToken, protected } = require('../controllers/auth.controller');
const { validateSignUp, validateLogin, validateRefreshToken } = require('../middlewares/validator');
const isAuthenticated = require('../middlewares/isAuthenticated');


router.post("/sign-up", validateSignUp, signUp);
router.post("/login", validateLogin, login);
router.post('/protected', isAuthenticated, protected);
router.post('/refresh', validateRefreshToken, refreshToken);
router.delete('/logout', isAuthenticated, logout);

module.exports = router;
