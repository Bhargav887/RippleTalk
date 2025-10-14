require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const User = require("./models/User");
const Post = require("./models/Post");
const Community = require("./models/Community");

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/rippletalk";

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to RippleTalk API 🌊" });
});

app.post("/posts/:communityId/:userId", async (req, res, next) => {
  try {
    const { communityId, userId } = req.params;
    const { mood, content } = req.body;

    if (!mood || !content)
      return res.status(400).json({ error: "Mood and content are required." });

    const [community, user] = await Promise.all([
      Community.findById(communityId),
      User.findById(userId),
    ]);
    if (!community)
      return res.status(404).json({ error: "Community not found." });
    if (!user) return res.status(404).json({ error: "User not found." });

    const post = await Post.create({
      user: userId,
      community: communityId,
      mood,
      content,
    });
    await Promise.all([
      community.updateOne({ $push: { posts: post._id } }),
      user.updateOne({ $push: { posts: post._id } }),
    ]);

    res.status(201).json({ message: "Post created successfully.", post });
  } catch (err) {
    next(err);
  }
});

app.delete("/posts/:communityId/:userId/:postId", async (req, res, next) => {
  try {
    const { communityId, userId, postId } = req.params;

    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) return res.status(404).json({ error: "Post not found." });

    await Promise.all([
      Community.findByIdAndUpdate(communityId, { $pull: { posts: postId } }),
      User.findByIdAndUpdate(userId, { $pull: { posts: postId } }),
    ]);

    res.json({ message: "Post deleted successfully.", deletedPost });
  } catch (err) {
    next(err);
  }
});

app.get("/community/:communityId/posts", async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId).populate({
      path: "posts",
      populate: { path: "user", select: "username email" },
    });
    if (!community)
      return res.status(404).json({ error: "Community not found." });
    res.json({
      message: "Posts fetched successfully.",
      total: community.posts.length,
      posts: community.posts,
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
