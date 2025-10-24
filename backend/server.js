const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const Post = require("./models/post");
const Ripple = require("./models/ripple");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(express.json());

require("dotenv").config();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is listening port: ${PORT}`);
  // console.log(process.env.ATLAS_URL);
});

const start = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URL);
    console.log("Successfully Database is connected!");
  } catch (err) {
    console.error("Database connection failed !", err.message);
  }
};
start();

//  verify token middelware
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}

// user routes

//  register new user
app.post("/register", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
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

//  user login
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email " });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password " });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
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

// get profile
app.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // hide password
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// post routes
// user all post
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

//get post
app.get("/posts/:id", async (req, res) => {
  let { id } = req.params;
  const post = await Post.findById(id);
  res.json(post);
});

// new post
app.post("/posts", verifyToken, async (req, res) => {
  try {
    let { mood, content } = req.body; // here, you need to add current user id
    if (!mood || !content) {
      return res.status(400).json({ message: "Mood and content are required" });
    }

    const newPost = new Post({
      user: req.user.id,
      mood,
      content,
    });
    await newPost.save();
    // Add to user's post list
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

// delete post
app.delete("/posts/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only allow owner to delete
    if (post.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user.id, { $pull: { posts: post._id } });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ripple routes

// get all posts
app.get("/ripple", async (req, res) => {
  const ripple = await Post.find({});
  res.json(ripple);
});
