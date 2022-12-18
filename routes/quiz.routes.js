const router = require('express').Router();

const isLoggedIn = require('../middlewares/isLoggedIn');
const { validateCreateQuiz, validateSubmitQuiz } = require('../middlewares/validator');
const Quiz = require('../models/quiz.model');
const SubmittedQuizzes = require('../models/submittedQuizzes.model');

router.post('/quiz', validateCreateQuiz, async (req, res) => {
    try {
        const quiz = await Quiz.create(req.body);
        res.status(201).json(quiz);
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ error: error.message });
    }
})

router.get('/quiz', async (req, res) => {
    try {
        const quiz = await Quiz.find().select('title');
        res.status(200).json(quiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/quiz/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id });
        res.status(201).json(quiz);
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ error: error.message });
    }
})

router.put('/quiz/:id', async (req, res) => {
    try {
        await Quiz.findByIdAndUpdate({ _id: req.params.id }, req.body)
        res.status(201).json({ message: 'Quiz updated successfully' });
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ error: error.message });
    }
})

router.post('/quiz/submit', validateSubmitQuiz, isLoggedIn,  async (req, res) => {
    try {
        await SubmittedQuizzes.create({ ...req.body, user: req.user._id });
        res.status(201).json({ message: 'Quiz submitted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

module.exports = router;
