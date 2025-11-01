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

// ✅ CORS (open for all origins)
app.use(
  cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

// ✅ JWT verification middleware
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

/* ---------------------- ACHIEVEMENTS ROUTE ---------------------- */
app.patch("/achievements", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Count all posts for this user
    const postCount = await Post.countDocuments({ user: userId });

    // ✅ Calculate total points (10 per post)
    const totalPoints = postCount * 10;

    // ✅ Update user stats
    user.entries = postCount.toString();
    user.points = totalPoints.toString();

    await user.save();

    res.json({
      message: "🏆 Achievements updated successfully!",
      updatedStats: {
        username: user.username,
        entries: postCount,
        points: totalPoints,
      },
    });
  } catch (err) {
    console.error("Error updating achievements:", err);
    res.status(500).json({ message: "Failed to update achievements" });
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

// ✅ Get all posts (with user info populated)
app.get("/ripple", async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("user", "username email") // include only username & email
      .sort({ createdAt: -1 }); // newest first
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------- USER MOOD TRENDS ---------------------- */
app.get("/mood-trends", verifyToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const trend = await Post.aggregate([
      // Match only posts from the logged-in user
      { $match: { user: userId } },

      // Group by date + mood
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            mood: "$mood",
          },
          count: { $sum: 1 },
        },
      },

      // Re-group by date to combine moods
      {
        $group: {
          _id: "$_id.date",
          moods: { $push: { mood: "$_id.mood", count: "$count" } },
          total: { $sum: "$count" },
        },
      },

      { $sort: { _id: 1 } },
    ]);

    // Format the result for frontend
    const formatted = trend.map((day) => {
      const high = day.moods.find((m) => m.mood === "high")?.count || 0;
      const low = day.moods.find((m) => m.mood === "low")?.count || 0;
      return { date: day._id, high, low, total: day.total };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching user mood trends:", err);
    res.status(500).json({ message: "Failed to fetch mood trends" });
  }
});
