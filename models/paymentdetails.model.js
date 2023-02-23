const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema({
  quizID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubmittedQuiz",
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  price: {
    type: Number,
  },
  validUntil: {
    type: Date,
    default: Date.now() + 24 * 60 * 60 * 1000,
  },
});

module.exports = mongoose.model("PaymentDetails", paymentDetailsSchema);
