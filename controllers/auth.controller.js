const bcrypt = require("bcrypt");
const Roles = require("../utils/roles");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user.model");
const RefreshToken = require("../models/refreshTokenmodel");
const generateJWTTokens = require("../utils/generateJWTTokens");

exports.signUp = async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedpassword = await bcrypt.hash(req.body.password, 7);
    await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      age: req.body.age,
      gender: req.body.gender,
      password: hashedpassword,
      role: Roles.Admin,
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    throw error;
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const tokens = generateJWTTokens(user);

    await RefreshToken.create({
      userId: user._id,
      refreshToken: tokens.refreshToken,
    });

    return res
      .status(200)
      .json({ ...tokens, message: "Logged in successfully" });
  } catch (error) {
    throw error;
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    const isExpired = jwt.verify(refreshToken, process.env.ACCESS_TOKEN);
    if (!refreshToken || !isExpired) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const RT = await RefreshToken.findOne({ refreshToken: refreshToken });
    if (!RT) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ _id: RT.userId });

    const tokens = generateJWTTokens(user);

    return res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { returnTo } = req.query;
    const state = returnTo
      ? new Buffer.from(JSON.stringify({ returnTo })).toString("base64")
      : undefined;

    const authenticator = passport.authenticate("google", {
      scope: ["email", "profile"],
      state,
    });
    authenticator(req, res, next);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.googleRedirect = async (req, res) => {
  try {
    const { state } = req.query;
    const { returnTo } = JSON.parse(
      new Buffer.from(state, "base64").toString()
    );
    if (typeof returnTo === "string") {
      const tokens = generateJWTTokens(req.user);
      const user = await User.findOne(req.user._id);

      await RefreshToken.create({
        userId: user._id,
        refreshToken: tokens.refreshToken,
      });

      const encodedAccessToken = encodeURIComponent(tokens.accessToken);
      const encodedRefreshToken = encodeURIComponent(tokens.refreshToken);
      return res.redirect(
        `http://localhost:5000/quiz/${returnTo}?accessToken=${encodedAccessToken}&refreshToken=${encodedRefreshToken}`
      );
      // return res.redirect(
      //   `https://quiz-ph.netlify.app/quiz/${returnTo}?accessToken=${encodedAccessToken}&refreshToken=${encodedRefreshToken}`
      // );
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await RefreshToken.deleteOne({ userId: user._id });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.protected = async (req, res) => {
  return res.status(200).json({ message: "Protected route" });
};
