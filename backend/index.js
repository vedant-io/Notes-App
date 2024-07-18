require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");
const Note = require("./models/notes.model");

const express = require("express");
const app = express();
const cors = require("cors");

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json());

app.use(
  cors({
    origin: "*",
  }),
);

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

//Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full Name is required" });
  }

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Account created successfully",
  });
});

//Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;

  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    res.sendStatus(401);
  }

  return res.json({
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
      createdOn: isUser.createdOn,
    },
    message: "",
  });
});

//Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const userInfo = await User.findOne({
    email: email,
  });

  if (!userInfo) {
    return res.status(400).json({ error: true, message: "User not found" });
  }

  if (userInfo.email === email && userInfo.password === password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });
    return res.json({
      error: false,
      user,
      accessToken,
      message: "Login successful",
    });
  } else {
    return res
      .status(400)
      .json({ error: true, message: "Invalid credentials" });
  }
});

//Add Notes
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({
      error: true,
      message: "Title is required",
    });
  }

  if (!content) {
    return res.status(400).json({
      error: true,
      message: "Content is required",
    });
  }

  try {
    const note = new Note({
      title,
      content,
      tags,
      userId: user._id,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (err) {
    return res.status(400).json({
      error: true,
      message: "Error adding note",
    });
  }
});

//Edit Note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;
  const { noteId } = req.params;

  if (!title && !content && !tags) {
    return res.status(400).json({
      error: true,
      message: "Please provide title, content or tags to update",
    });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(400).json({
        error: true,
        message: "Note not found",
      });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (err) {
    return res.status(400).json({
      error: true,
      message: "Error updating note",
    });
  }
});

//Get Notes
app.get("/get-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
    });
  } catch (err) {
    return res.status(400).json({
      error: true,
      message: "Error fetching notes",
    });
  }
});

//Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { noteId } = req.params;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(400).json({
        error: true,
        message: "Note not Found",
      });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });
    return res.json({
      error: false,
      message: "Note Deleted Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//Update isPinned value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
  const { isPinned } = req.body;
  const { user } = req.user;
  const { noteId } = req.params;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(400).json({
        error: true,
        message: "Note not found",
      });
    }

    if (isPinned) note.isPinned = isPinned || false;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note Pinned",
    });
  } catch (err) {
    return res.status(400).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.listen(8000);

module.exports = app;
