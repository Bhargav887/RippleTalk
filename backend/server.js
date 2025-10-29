require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const User = require("./models/user");
const Post = require("./models/post");
const Ripple = require("./models/ripple");

const app = express();
app.use(express.json());

// ✅ CORS: allow your frontend and local dev
app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-frontend-domain.com"],
    credentials: true,
  })
);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ✅ Database connection
const start = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Database connected!");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
};
start();

// ✅ Verify token middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

/* ---------------------- AUTH ROUTES ---------------------- */

// ✅ Register
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Profile
app.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------- POST ROUTES ---------------------- */

// ✅ Get all posts of current user
app.get("/my-posts", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get single post
app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: "Invalid post ID" });
  }
});

// ✅ Create post
app.post("/posts", verifyToken, async (req, res) => {
  try {
    const { mood, content } = req.body;
    if (!mood || !content)
      return res.status(400).json({ message: "Mood and content are required" });

    const newPost = new Post({
      user: req.user.id,
      mood,
      content,
    });

    await newPost.save();

    // add post to user's list
    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: newPost._id },
    });

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete post
app.delete("/posts/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });

    await Post.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user.id, { $pull: { posts: post._id } });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------- RIPPLE ROUTES ---------------------- */

// ✅ Get all ripples (or posts if you prefer)
app.get("/ripple", async (req, res) => {
  try {
    const ripples = await Ripple.find({});
    res.json(ripples);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
