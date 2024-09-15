require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utils");

app.use(express.json());

app.use(
    cors({
        origin: '*',
    })
);

app.get("/", (req, res) => {
    res.json({data: "Hello World"});
})

// Create Account
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName) {
        return res.status(400).json({ error:true, message: "Please enter your full name" });
    }
    if (!email) {
        return res.status(400).json({ error: true, message: "Please enter a valid email address" });
    }

    if(!password) {
        return res.status(400).json({ error: true, message: "Please enter password" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: true, message: "Password must be at least 6 characters" });
    }

    const isUser = await User.findOne({ email });

    if (isUser) {
        return res.status(400).json({ error: true, message: "User already exists" });
    }

    const user = new User({
        fullName,
        email,
        password
    });

    await user.save();

    const accessToken = jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "3600m"
    });

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Succesful"
    })
});

// login into Account
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: true, message: "Please enter a valid email address" });
    }

    if (!password) {
        return res.status(400).json({ error: true, message: "Please enter password" });
    }

    const userInfo = await User.findOne({ email });
    if (!userInfo) {
        return res.status(400).json({ error: true, message: "User does not exist" });
    }

    if (userInfo.email == email && userInfo.password == password) {
        const accessToken = jwt.sign({ userInfo }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "3600m"
        });
        return res.json({
            error: false,
            userInfo,
            accessToken,
            message: "Login Successful"
        })
    } else {
        return res.status(400).json({ error: true, message: "Invalid Credentials" });
    }
});

app.listen(8000);

module.exports = app;