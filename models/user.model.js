const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    age: Number,
    gender: String,
    password: String,
    refreshToken: String,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
