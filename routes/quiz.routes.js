const router = require('express').Router();

const Quiz = require('../models/quiz.model');

router.post('/quiz', async (req, res) => {
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
        const quiz = await Quiz.findByIdAndUpdate({ _id: req.params.id }, req.body)
        res.status(201).json(quiz);
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ error: error.message });
    }
})

module.exports = router;
