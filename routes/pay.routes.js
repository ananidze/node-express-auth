const paypal = require("paypal-rest-sdk");
const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const PaymentDetails = require("../models/paymentdetails.model");
const { SubmittedQuizzes } = require("../models/quiz.model");
const jwt = require("jsonwebtoken");

router.get("/paymentDetails", isAuthenticated, async (req, res) => {
  const paymentDetails = await PaymentDetails.findOne({
    userID: req.user._id,
  }).sort({ _id: -1 });

  res.json({ _id: paymentDetails._id });
});

router.get("/payToken/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const paymentDetails = await PaymentDetails.findById(_id);

    if (!paymentDetails) {
      return res.status(404).json({ message: "Payment Details not found" });
    }

    res.json({
      userID: paymentDetails.userID,
      price: paymentDetails.price,
      quizID: paymentDetails.quizID,
      valid: paymentDetails.validUntil > Date.now(),
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/payment/success", async (req, res) => {
  try {
    const { quizID, price } = req.body;
    const quiz = await SubmittedQuizzes.findById(quizID);
    if (!quiz) {
      return res.status(404).json({ message: "Information not found" });
    }

    quiz.paidAmount = price;
    quiz.isPaid = true;
    quiz.save();

    res.json({ message: "Payment Successful" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/pay", async (req, res) => {});

module.exports = router;
