const router = require("express").Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
const sendMail = require("../utils/mailer");
const {
  validateCreateQuiz,
  validateSubmitQuiz,
} = require("../middlewares/validator");
const Quiz = require("../models/quiz.model");
const User = require("../models/user.model");
const puppeteer = require('puppeteer');
const SubmittedQuizzes = require("../models/submittedQuizzes.model");

router.post("/quiz", validateCreateQuiz, async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/quiz", async (req, res) => {
  try {
    const quiz = await Quiz.find().select("title");
    res.status(200).json(quiz);
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

router.put("/quiz/:id", async (req, res) => {
  try {
    await Quiz.findByIdAndUpdate({ _id: req.params.id }, req.body);
    res.status(201).json({ message: "Quiz updated successfully" });
  } catch (error) {
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
      console.log(rest);
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

router.get('/quiz/pdf/:id', async (req, res) => {
    const quiz = await SubmittedQuizzes.findById(req.params.id);
    const user = await User.findById(quiz.userId);
    const browser = await puppeteer.launch({args: ["--no-sandbox", "--disable-setuid-sandbox"]});
    const page = await browser.newPage();
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
            <div class="user-results-item"><b>The test showed us that you: </b>S E</div class="user-results-item">
            <hr />
        </div>
        <div class="box-footer">
            <h3>Quiz</h3>
        </div>
        </div>
    </body>
    </html>`;
  
    await page.setContent(html);
    await page.emulateMediaType("print");
  
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });
  
    await browser.close();
    res.setHeader('Content-Disposition', 'attachment; filename="my-pdf.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  });

module.exports = router;
