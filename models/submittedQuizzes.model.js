const mongoose = require('mongoose');

const parameterOption = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, required: true },
    shortText: { type: String, required: true },
})

const answerOptions = new mongoose.Schema({
    target: { type: String, required: true },
    weight: { type: Number, required: true },
    choosen: { type: Boolean, required: true },
    answerText: { type: String, required: true },
})

const QuestionsSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answerOptions: [answerOptions],
})

const QuizSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    questions: [[QuestionsSchema]],
    parameters: [[parameterOption]],
    title: { type: String, required: true },
}, { versionKey: false })


module.exports = mongoose.model('SubmittedQuizzes', QuizSchema);