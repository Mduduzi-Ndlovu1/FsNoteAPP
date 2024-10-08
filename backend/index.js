require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");
const Note = require("./models/note.model");

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

    // Generate token with just userId
    const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "3600m"
    });

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Successful"
    });
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

    // Check password (ideally use bcrypt for hashing)
    if (userInfo.password === password) {
        const accessToken = jwt.sign({ _id: userInfo._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "3600m"
        });
        return res.json({
            error: false,
            _id: userInfo._id,
            accessToken,
            message: "Login Successful"
        });
    } else {
        return res.status(400).json({ error: true, message: "Invalid Credentials" });
    }
});

// Get All users
app.get("/get-all-users", authenticateToken, async (req, res) => {
    const userId = req.user._id || req.user.userInfo._id;
    
    const isUser = await User.findOne({ _id: userId });

    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        userId: {
            fullName: isUser.fullName,
            email: isUser.email,
            "_id": isUser._id,
            "createdOn": isUser.createOn
        },
        message: "",
    });
});


// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    const userId = req.user._id || req.user.userInfo._id;

    if (!title) {
        return res.status(400).json({ error: true, message: "Please enter title" });
    }

    if (!content) {
        return res.status(400).json({ error: true, message: "Please enter content" });
    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId,
        });

        await note.save();
        
        return res.json({
            error: false,
            note,
            message: "Note added successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

//Edit Note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const { title, content, tags, isPinned } = req.body;
    const noteId = req.params.noteId;
    const userId = req.user._id || req.user.userInfo._id;

    

    if(!title && !content && !tags) {
        return res
        .status(400)
        .json({error: true, message: "No Changes Provided"})
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId });
        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) note.isPinned = isPinned;

        await note.save();

        return res.json ({
            error: false,
            note,
            message: "Note updated successfully",
        })
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

//Get All Notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
    const userId = req.user._id || req.user.userInfo._id;
    try {
        const notes = await Note.find({ userId }).sort({isPinned: -1});

        return res.json({
            error: false,
            notes,
            message: "All Notes Retrieved Successfully",
        })
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const userId = req.user._id || req.user.userInfo._id;
    try {
        const note = await Note.findOneAndDelete({ _id: noteId, userId });
        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        await Note.deleteOne({ _id: noteId, userId: userId });

        return res.json({
            error: false,
            message: "Note deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Update isPinned Value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const { isPinned } = req.body;
    const noteId = req.params.noteId;
    const userId = req.user._id || req.user.userInfo._id;

    try {
        const note = await Note.findOne({ _id: noteId, userId });
        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        note.isPinned = isPinned;

        await note.save();

        return res.json ({
            error: false,
            note,
            message: "Note updated successfully",
        })
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Search Notes
app.get("/search-notes", authenticateToken, async (req, res) => {
    const { query } = req.query;
    const userId = req.user._id || req.user.userInfo._id;

    if (!query) {
        return res.status(400).json({ error: true, message: "Query is required" });
    }

    try {
        const matchedNotes = await Note.find({
            userId,
            $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
            ],
        });

        return res.json({
            error: false,
            notes: matchedNotes,
            message: "Notes retrieved successfully",
        })
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

app.listen(8000);

module.exports = app;