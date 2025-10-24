const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const Post = require("./models/post");
const Ripple = require("./models/ripple");
const dotenv = require("dotenv");

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

// user routes
// get user
app.get("/users/:id", async (req, res) => {
  let { id } = req.params;
  const user = await User.findById(id);
  res.json(user);
});

//  new user
app.post("/users", async (req, res) => {
  let { username, email, password } = req.body;

  const newUser = new User({ username, email, password });
  await newUser.save();
});

// post routes
// user all post
app.get("/users/:id/posts", async (req, res) => {
  let { id } = req.params;
  const allPost = await Post.find({ user: id });
  res.json(allPost);
});

//get post
app.get("/posts/:id", async (req, res) => {
  let { id } = req.params;
  const post = await Post.findById(id);
  res.json(post);
});

// new post
app.post("/posts", async (req, res) => {
  let { mood, content } = req.body; // here, you need to add current user id
  const newPost = new Post({ mood, content });
  await newPost.save();
});

// delete post
app.delete("/posts/:id", async (req, res) => {
  let { id } = req.params;
  const post = await Post.findByIdAndDelete(id);
  await User.updateMany({ posts: id }, { $pull: { posts: id } });
  await Ripple.updateMany({ posts: id }, { $pull: { posts: id } });

  res.json({ message: "post deleted successfully" });
});

// ripple routes

// get all posts
app.get("/ripple", async (req, res) => {
  const ripple = await Post.find({});
  res.json(ripple);
});
