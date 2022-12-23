const router = require("express").Router();
const { signUp, login, refreshToken, protected, googleLogin, googleRedirect, logout
} = require("../controllers/auth.controller");
const {
    validateSignUp,
    validateLogin,
    validateRefreshToken,
} = require("../middlewares/validator");
const passport = require("passport");
const isAuthenticated = require("../middlewares/isAuthenticated");
const roleMiddleware = require("../middlewares/role");

router.get(`/google`, googleLogin);
router.get(
    "/user",
    isAuthenticated,
    roleMiddleware(["User", "Admin"]),
    (req, res) => {
        res.json(req.user);
    }
);
router.delete("/logout", isAuthenticated, logout);
router.post("/login", validateLogin, login);
router.post("/sign-up", validateSignUp, signUp);
router.get("/protected", isAuthenticated, protected);
router.post("/refresh", validateRefreshToken, refreshToken);
router.get(
    "/google/redirect",
    passport.authenticate("google", { failureRedirect: "/login" }),
    googleRedirect
);

module.exports = router;