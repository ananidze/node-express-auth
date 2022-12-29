const router = require("express").Router();
const puppeteer = require("puppeteer");
const fs = require("fs");
const isAuthenticated = require("../middlewares/isAuthenticated");
const sendMail = require("../utils/mailer");
const { validateCreateQuiz, validateSubmitQuiz } = require("../middlewares/validator");
const Quiz = require("../models/quiz.model");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/user.model");
const SubmittedQuizzes = require("../models/submittedQuizzes.model");
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
      .select("title")
      .exec();

    const totalQuizzes = await Quiz.countDocuments().exec();
    const totalPages = Math.floor(totalQuizzes / limit + 1);

    res.status(200).json({ quiz, totalPages });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/quiz/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id });
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
})

router.put("/quiz/:id", validateCreateQuiz, async (req, res) => {
  try {
    const quiz = req.body;
    quiz.parameters = quiz.parameters.map(arr =>
      arr.map(obj => {
        if (obj._id === "") obj._id = new ObjectId();
        return obj;
      })
    );

    quiz.questions = quiz.questions.map(arr =>
      arr.map(obj => {
        if (obj._id === "") obj._id = new ObjectId();
        obj.answerOptions.forEach(opt => {
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

    const quizzes = await SubmittedQuizzes.find()
      .skip(skip)
      .limit(pageSize)
      .populate("userId", "firstName lastName email")
      .exec();

    const formattedQuizzes = quizzes.map((quiz) => {
      return {
        firstName: quiz.userId.firstName,
        lastName: quiz.userId.lastName,
        email: quiz.userId.email,
        _id: quiz._id,
      };
    });

    const totalQuizzes = await SubmittedQuizzes.countDocuments().exec();
    const totalPages = Math.floor(totalQuizzes / pageSize + 1);

    res.json({ quizzes: formattedQuizzes, totalPages });
  } catch (error) { }
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
      await SubmittedQuizzes.create({ ...rest, userId: req.user._id });
      res.status(201).json({ message: "Quiz submitted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.post("/quiz/send-email", async (req, res) => {
  try {
    const quiz = await SubmittedQuizzes.findById(req.body._id);
    const user = await User.findById(quiz.userId);
    const html = generateHTML(user.firstName, user.lastName, user.email, req.body.result);

    sendMail(user.email, "Quiz Results", html);

    res.status(201).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/quiz/pdf", async (req, res) => {
  const { _id, result } = req.body;
  const quiz = await SubmittedQuizzes.findById(_id);
  const user = await User.findById(quiz.userId);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  const html = generateHTML(user.firstName, user.lastName, user.email, result);
  await page.setContent(html)
  const pdf = await page.pdf({ format: 'A4' })
  await browser.close()

  const filePathToWrite = "pdf/my-pdf.pdf";
  const filePath = "my-pdf.pdf";
  
  fs.writeFileSync(filePathToWrite, pdf)

  res.status(201).json({ filePath });
});

module.exports = router;
