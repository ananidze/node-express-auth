require("dotenv").config();
const logger = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("./config/passport-setup");
const bodyParser = require("body-parser");
const authRouter = require("./routes/auth.routes");
const quizRouter = require("./routes/quiz.routes");
const superRouter = require("./routes/super.routes");
const resultRouter = require("./routes/result.routes");

const app = express();

mongoose
  .connect(process.env.DATABASE_TEST_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .catch((err) => console.log(err.message))
  .then(() => console.log("Connected To MongoDB"));

app.use(
  cors({
    // origin: "https://quiz-ph.netlify.app",
    origin: [
      "http://localhost:5000",
      "http://localhost:3002",
      "http://localhost:3000",
    ],
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    credentials: true,
  })
);
app.use(
  session({
    secret: "cats",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(compression());
app.use(bodyParser.json({ type: "application/json", limit: "10mb" }));
app.use(express.static("pdf"));
app.use(logger("dev"));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use("/api", authRouter);
app.use("/api", quizRouter);
app.use("/api", superRouter);
app.use("/api", resultRouter);
app.use("/api", require("./routes/pay.routes"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(res.status(404).json({ message: "404 Not Found" }));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
});

module.exports = app;
