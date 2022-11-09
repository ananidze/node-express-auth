const { check, validationResult } = require("express-validator");

exports.validateSignUp = [
  check("firstName")
    .isLength({ min: 3 })
    .withMessage("minimum 3 characters")
    .trim(),
  check("lastName")
    .isLength({ min: 3 })
    .withMessage("minimum 3 characters")
    .trim(),
  check("email").isEmail().withMessage("invalid email format"),
  check("age").isInt({ min: 0, max: 100 }).withMessage("invalid age"),
  check("gender").isIn(["male", "female"]).withMessage("invalid gender"),
  check("password").isLength({ min: 6 }).withMessage("minimum 6 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];

exports.validateLogin = [
  check("email").isEmail().withMessage("invalid email format"),
  check("password").isLength({ min: 6 }).withMessage("minimum 6 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
]

exports.validateRefreshToken = [
  check("refreshToken").isLength({ min: 10 }).withMessage("invalid refresh token"),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
]