const router = require("express").Router();
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
const { jsPDF } = require("jspdf");

router.post("/quiz", validateCreateQuiz, async (req, res) => {
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
    await Quiz.create(quiz);
    res.status(201).json(quiz);
  } catch (error) {
    console.log(error.message);
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
      .select("title titleRu price")
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
      quiz = await Quiz.findById(req.params.id).populate(
        "results.descriptionId",
        "title"
      );
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

    quiz.results = quiz.results.map((arr) => {
      if (arr._id === "") arr._id = new ObjectId();
      return arr;
    });

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
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const email = req.query.email;
    const result = req.query.result;
    const sort = req.query.sort == "newest" ? -1 : 1;

    let filters = {};

    if (firstName)
      filters["user.firstName"] = { $regex: firstName, $options: "i" };
    if (lastName)
      filters["user.lastName"] = { $regex: lastName, $options: "i" };
    if (lastName)
      filters["user.lastName"] = { $regex: lastName, $options: "i" };
    if (email) filters["user.email"] = { $regex: email, $options: "i" };
    if (result) filters.result = { $regex: result, $options: "i" };

    const countResult = await SubmittedQuizzes.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: filters },
      { $sort: { createdAt: sort } },
      { $count: "total" },
    ]).exec();

    const totalQuizzes = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalQuizzes / pageSize);

    const quizzes = await SubmittedQuizzes.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: filters },
      { $sort: { createdAt: sort } },
      { $skip: skip },
      { $limit: pageSize },
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
    res.json({ quizzes, totalPages });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

router.get("/quiz/result/:quizId", async (req, res) => {
  try {
    const quiz = await SubmittedQuizzes.findById(req.params.quizId)
      .populate(
        "userId results.descriptionId",
        "_id firstName lastName email picture title"
      )
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
      let result = "";
      req.body.parameters.map((parameter) => {
        let highest = parameter[0];
        parameter.map((item) => item.value > highest.value && (highest = item));
        result += `${highest.shortText}, `;
      });
      result = result.slice(0, -2) + ".";
      await SubmittedQuizzes.create({ ...rest, userId: req.user._id, result });
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
    const { _id, result, attach } = req.body;
    const doc = new jsPDF("p", "pt", "a4", true);
    const mimeType = result.split(";")[0].split(":")[1];
    doc.addImage(
      result,
      mimeType,
      0,
      0,
      doc.internal.pageSize.getWidth(),
      0,
      undefined,
      "FAST"
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=result.pdf");
    res.send(Buffer.from(doc.output("arraybuffer")));
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
