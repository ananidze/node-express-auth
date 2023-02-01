const router = require("express").Router();
const puppeteer = require("puppeteer");
const fs = require("fs");
const isAuthenticated = require("../middlewares/isAuthenticated");
const sendMail = require("../utils/mailer");
const {
  validateCreateQuiz,
  validateSubmitQuiz,
} = require("../middlewares/validator");
const { Quiz, SubmittedQuizzes, TempQuiz } = require("../models/quiz.model");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/user.model");
const generateHTML = require("../utils/generateHTML");

router.post("/quiz", validateCreateQuiz, async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/quiz/user/paginate/:page", async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;
    const quiz = await Quiz.find()
      .skip(skip)
      .limit(limit)
      .select("title titleRu")
      .exec();

    const totalQuizzes = await Quiz.countDocuments().exec();
    const totalPages = Math.ceil(totalQuizzes / limit);

    res.status(200).json({ quiz, totalPages });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/quiz/:id", isAuthenticated, async (req, res) => {
  try {
    let quiz = await TempQuiz.findOne({ userId: req.user._id });
    if (!quiz) {
      quiz = await Quiz.findById(req.params.id);
    }

    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/quiz/:id", async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/quiz/:id", validateCreateQuiz, async (req, res) => {
  try {
    const quiz = req.body;
    quiz.parameters = quiz.parameters.map((arr) =>
      arr.map((obj) => {
        if (obj._id === "") obj._id = new ObjectId();
        return obj;
      })
    );

    quiz.questions = quiz.questions.map((arr) =>
      arr.map((obj) => {
        if (obj._id === "") obj._id = new ObjectId();
        obj.answerOptions.forEach((opt) => {
          if (opt._id === "") opt._id = new ObjectId();
        });
        return obj;
      })
    );

    await Quiz.findByIdAndUpdate(req.params.id, quiz);
    res.json({ message: "Quiz updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

router.get("/quiz/paginate/:page", async (req, res) => {
  try {
    const pageSize = 10;
    const page = parseInt(req.params.page);

    const skip = (page - 1) * pageSize;
    const quizzes = await SubmittedQuizzes.aggregate([
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          firstName: "$user.firstName",
          lastName: "$user.lastName",
          email: "$user.email",
          createdAt: 1,
          _id: 1,
        },
      },
    ]).exec();

    const totalQuizzes = await SubmittedQuizzes.countDocuments().exec();
    const totalPages = Math.ceil(totalQuizzes / pageSize);

    res.json({ quizzes, totalPages });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

router.get("/quiz/result/:quizId", async (req, res) => {
  try {
    const quiz = await SubmittedQuizzes.findById(req.params.quizId)
      .populate("userId", "_id firstName lastName email picture")
      .lean();
    if (!quiz) {
      res.status(404).json({ message: "Information Not found" });
    }

    const { userId, ...rest } = quiz;

    res.json({ user: userId, rest });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post(
  "/quiz/submit",
  validateSubmitQuiz,
  isAuthenticated,
  async (req, res) => {
    try {
      const { _id, ...rest } = req.body;
      await TempQuiz.findOneAndDelete({ userId: req.user._id });
      await SubmittedQuizzes.create({ ...rest, userId: req.user._id });
      res.status(201).json({
        message:
          "Your test is done! Thanks for participating. Our representative will contact you soon.",
      });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

router.post(
  "/quiz/temp",
  validateSubmitQuiz,
  isAuthenticated,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const quiz = req.body;

      quiz.userId = userId;

      await TempQuiz.findOneAndUpdate({ userId }, quiz, { upsert: true });

      res.send(200);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Something Went Wrong" });
    }
  }
);

router.post("/quiz/send-email", async (req, res) => {
  try {
    const quiz = await SubmittedQuizzes.findById(req.body._id);
    const user = await User.findById(quiz.userId);
    const html = generateHTML(req.body.result, true);

    sendMail(user.email, "Quiz Results", html, req.body.result);

    res.status(201).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/quiz/pdf", async (req, res) => {
  try {
    const { _id, result } = req.body;
    // const quiz = await SubmittedQuizzes.findById(_id);
    // const user = await User.findById(quiz.userId);
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--headless",
        "--disable-gpu",
        "--full-memory-crash-report",
        "--unlimited-storage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    const page = await browser.newPage();
    const html = generateHTML(result, false);
    await page.setContent(html);
    const pdf = await page.pdf({ format: "A4" });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=result.pdf");
    res.send(pdf);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
