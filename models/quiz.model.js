const mongoose = require("mongoose");

const parameterOption = new mongoose.Schema({
  name: { type: String, required: true },
  nameRu: { type: String, default: "" },
  value: { type: Number, required: true },
  shortText: { type: String, required: true },
});

const answerOptions = new mongoose.Schema({
  target: { type: String, required: true },
  weight: { type: Number, required: true },
  answerText: { type: String, required: true },
  answerTextRu: { type: String, default: "" },
});

const QuestionsSchema = new mongoose.Schema({
  question: { type: String, required: true },
  questionRu: { type: String, default: "" },
  answerOptions: [answerOptions],
});

const ExtendedQuestionSchema = QuestionsSchema.add({
  answerOptions: [
    answerOptions.add({ choosen: { type: Boolean, default: false } }),
  ],
});

const QuizSchema = new mongoose.Schema(
  {
    questions: [[QuestionsSchema]],
    parameters: [[parameterOption]],
    title: { type: String, required: true },
    titleRu: { type: String, default: "" },
  },
  { versionKey: false }
);

const Quiz = mongoose.model("Quiz", QuizSchema);
const SubmittedQuizzes = mongoose.model(
  "SubmittedQuizzes",
  QuizSchema.add({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    questions: [[ExtendedQuestionSchema]],
  })
);

const TempQuiz = mongoose.model(
  "TempQuizzes",
  QuizSchema.add({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    questions: [[ExtendedQuestionSchema]],
  })
);
module.exports = {
  Quiz,
  TempQuiz,
  SubmittedQuizzes,
};
