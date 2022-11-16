const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const User = require("../models/user.model");

exports.signUp = async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedpassword = await bcrypt.hash(req.body.password, 7);
        await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            age: req.body.age,
            gender: req.body.gender,
            password: hashedpassword,
        })

        return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        throw error;
    }
};

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.ACCESS_TOKEN, {
            expiresIn: "2m",
        });
        const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.REFRESH_TOKEN, {
            expiresIn: "10m",
        });

        await user.updateOne({ refreshToken: refreshToken });

        return res.status(200).json({ accessToken, refreshToken });

    } catch (error) {
        throw error;
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findOne({ refreshToken: refreshToken });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.ACCESS_TOKEN, {
            expiresIn: "2m",
        });
        const newRefreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.REFRESH_TOKEN, {
            expiresIn: "10m",
        })

        await user.updateOne({ refreshToken: newRefreshToken });
        return res.status(200).json({ accessToken, refreshToken });

    } catch (error) {
        throw error;
    }
}

exports.logout = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        await user.update({ refreshToken: null });
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        throw error;
    }
};

exports.protected = async (req, res) => {
    return res.status(200).json({ message: "Protected route" });
}