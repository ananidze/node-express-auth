const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    refreshToken: String,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
