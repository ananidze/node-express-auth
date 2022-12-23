require("dotenv").config();
const logger = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("./config/passport-setup");
const bodyParser = require('body-parser')
const authRouter = require("./routes/auth.route");
const quizRouter = require("./routes/quiz.routes");


const app = express();

mongoose
  .connect(process.env.DATABASE_TEST_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .catch((err) => console.log(err.message))
  .then(() => console.log("Connected To MongoDB"));

app.use(cors({
    origin: "http://localhost:5000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true, cookie: { secure: false } }));
app.use(bodyParser.json({type:"application/json"}))
app.use(logger("dev"));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session())
app.use(express.urlencoded({ extended: false }));

app.use("/api", authRouter);
app.use('/api', quizRouter)

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
