const router = require('express').Router();

const isLoggedIn = require('../middlewares/isLoggedIn');
const sendMail = require('../utils/mailer')
const { validateCreateQuiz, validateSubmitQuiz } = require('../middlewares/validator');
const Quiz = require('../models/quiz.model');
const User = require('../models/user.model');
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


router.post('/quiz/send-email', async (req, res) => {
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
            `

        sendMail(user.email, 'Quiz Results', html);

        res.status(201).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})


module.exports = router;
