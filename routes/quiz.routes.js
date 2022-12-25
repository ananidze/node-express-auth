const router = require("express").Router();
const pdf = require("html-pdf");

const isAuthenticated = require("../middlewares/isAuthenticated");
const sendMail = require("../utils/mailer");
const {
  validateCreateQuiz,
  validateSubmitQuiz,
} = require("../middlewares/validator");
const Quiz = require("../models/quiz.model");
const User = require("../models/user.model");
const puppeteer = require("puppeteer");
const SubmittedQuizzes = require("../models/submittedQuizzes.model");

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

router.put("/quiz/:id", validateCreateQuiz, async (req, res) => {
  try {
    // Quiz.findByIdAndUpdate(
    //   req.params.id,
    //   req.body,
    //   { new: true },
    //   function (err, updatedObject) {
    //     if (err) return res.json({ message: err.message });
    //     res.status(201).json({ message: "Quiz updated successfully" });
    //     // res.send(updatedObject);
    //   }
    // );
    const updatedObject = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.send(updatedObject);
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
  } catch (error) {}
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
    const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Document</title>
                <style>
                    body { font-family: monospace;}
                    .main-box { background-color: #d7d4fa; padding: 20px 0;}
                    .box-header { padding-left: 20px; }
                    .box-titles { padding-left: 20px; }
                    .user-results-item{ padding-left: 20px;}
                    .box-footer{padding-left: 20px;}
                </style>
            </head>
            <body>
                <div class="main-box">
                <div class="box-header">
                    <h1>${user.firstName} ${user.lastName}s results</h1>
                </div>
                <hr />
                <div class="user-information">
                    <div class="box-titles">
                    <h2>User information</h2>
                    </div>
                    <ul>
                        <li><b>First name: </b> ${user.firstName}</li>
                        <li><b>Last name: </b> ${user.lastName}</li>
                        <li><b>Mail: </b> ${user.email}</li>
                    </ul>
                    <hr />
                </div>
                <div class="user-results">
                    <div class="box-titles">
                    <h2>Results</h2>
                    </div>
                    <div class="user-results-item"><b>The test showed us that you: </b>${req.body.result}</div class="user-results-item">
                    <hr />
                </div>
                <div class="box-footer">
                    <h3>Quiz</h3>
                </div>
                </div>
            </body>
            </html>
            `;

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
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            body { font-family: monospace;}
            .main-box { background-color: #d7d4fa; padding: 20px 0;}
            .box-header { padding-left: 20px; }
            .box-titles { padding-left: 20px; }
            .user-results-item{ padding-left: 20px;}
            .box-footer{padding-left: 20px;}
        </style>
    </head>
    <body>
        <div class="main-box">
        <div class="box-header">
            <h1>${user.firstName} ${user.lastName}s results</h1>
        </div>
        <hr />
        <div class="user-information">
            <div class="box-titles">
            <h2>User information</h2>
            </div>
            <ul>
                <li><b>First name: </b> ${user.firstName}</li>
                <li><b>Last name: </b> ${user.lastName}</li>
                <li><b>Mail: </b> ${user.email}</li>
            </ul>
            <hr />
        </div>
        <div class="user-results">
            <div class="box-titles">
            <h2>Results</h2>
            </div>
            <div class="user-results-item"><b>The test showed us that you: </b>${result}</div class="user-results-item">
            <hr />
        </div>
        <div class="box-footer">
            <h3>Quiz</h3>
        </div>
        </div>
    </body>
    </html>`;

  const filePathToWrite = "pdf/my-pdf.pdf";
  const filePath = "my-pdf.pdf";

  pdf.create(html).toFile(filePathToWrite, (err) => {
    if (err) {
      res.send(err);
    } else {
      res.json({ filePath });
    }
  });
});

module.exports = router;
