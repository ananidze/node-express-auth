const logger = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRouter = require("./routes/auth.route");

require("dotenv").config();

const app = express();

mongoose
  .connect(process.env.DB_HOST, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .catch((err) => console.log(err))
  .then(() => console.log("Connected To MongoDB"));

app.use(cors())
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", authRouter);

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
