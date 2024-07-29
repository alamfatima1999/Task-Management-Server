// routes/auth.js
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const router = express.Router();
const client = new OAuth2Client(process.env.REACT_APP_CLIENT_ID);

router.post("/google", async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.REACT_APP_CLIENT_ID,
        });

        const { sub, email, name, picture } = ticket.getPayload();
        let user = await User.findOne({ googleId: sub });

        if (!user) {
            user = new User({ googleId: sub, email, name, picture });
            await user.save();
        }

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
});

router.post("/validate-token", async (req, res) => {
    const { token, type } = req.body;

    try {
        if (type === "google") {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.REACT_APP_CLIENT_ID,
            });

            const { sub } = ticket.getPayload();
            const user = await User.findOne({ googleId: sub });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({ user });
        } else if (type === "jwt") {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({ user });
        } else {
            res.status(400).json({ message: "Invalid token type" });
        }
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
});

// Route for username and password authentication
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser = new User({ firstName, lastName, email, password });
        await newUser.save();
        console.log(newUser)
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/google-register', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.REACT_APP_CLIENT_ID,
        });

        const { sub, email, name, picture } = ticket.getPayload();
        let user = await User.findOne({ googleId: sub });

        if (!user) {
            user = new User({ googleId: sub, email, name, picture });
            await user.save();
        }
        res.status(201).json(user);

    } catch (error) {
        res.status(500).json({ message: "Google registration failed" });
    }
});

module.exports = router;
