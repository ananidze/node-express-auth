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
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];

exports.validateRefreshToken = [
  check("refreshToken").isString().withMessage("Unauthorized"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(401).json({ errors: errors.array() });
    next();
  },
];

exports.validateCreateQuiz = [
  check("title").isString().isLength({ min: 1 }),
  check("titleRu").isString().optional({ nullable: true }),
  check("questions").isArray(),
  check("questions.*.*.question").isString().isLength({ min: 1 }),
  check("questions.*.*.questionRu").isString().optional({ nullable: true }),
  check("questions.*.*.answerOptions").isArray(),
  check("questions.*.*.answerOptions.*.target").isString().isLength({ min: 1 }),
  check("questions.*.*.answerOptions.*.weight").isNumeric(),
  check("questions.*.*.answerOptions.*.answerText").isString(),
  check("questions.*.*.answerOptions.*.answerTextRu")
    .isString()
    .optional({ nullable: true }),
  check("parameters").isArray(),
  check("parameters.*.*.name").isString().isLength({ min: 1 }),
  check("parameters.*.*.nameRu").isString().optional({ nullable: true }),
  check("parameters.*.*.value").isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateSubmitQuiz = [
  check("title").isString().isLength({ min: 1 }),
  check("titleRu").isString().isLength({ min: 1 }).optional({ nullable: true }),
  check("questions").isArray(),
  check("questions.*.*.question").isString().isLength({ min: 1 }),
  check("questions.*.*.questionRu")
    .isString()
    .isLength({ min: 1 })
    .optional({ nullable: true }),
  check("questions.*.*.answerOptions").isArray(),
  check("questions.*.*.answerOptions.*.target").isString().isLength({ min: 1 }),
  check("questions.*.*.answerOptions.*.weight").isNumeric(),
  check("questions.*.*.answerOptions.*.choosen").isBoolean(),
  check("questions.*.*.answerOptions.*.answerText")
    .isString()
    .isLength({ min: 1 }),
  check("questions.*.*.answerOptions.*.answerTextRu")
    .isString()
    .isLength({ min: 1 })
    .optional({ nullable: true }),
  check("parameters").isArray(),
  check("parameters.*.*.name").isString().isLength({ min: 1 }),
  check("parameters.*.*.nameRu")
    .isString()
    .isLength({ min: 1 })
    .optional({ nullable: true }),
  check("parameters.*.*.value").isNumeric(),
  check("parameters.*.*.shortText").isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
