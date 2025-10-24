require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user");
const Post = require("./src/models/post");
const Ripple = require("./src/models/ripple");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URL);
    console.log("✅ MongoDB connected!");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // 1️⃣ Clear old data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Ripple.deleteMany({});

    console.log("🧹 Old data cleared");

    // 2️⃣ Create sample users
    const users = await User.insertMany([
      { username: "Alice", email: "alice@example.com", password: "password1" },
      { username: "Bob", email: "bob@example.com", password: "password2" },
      {
        username: "Charlie",
        email: "charlie@example.com",
        password: "password3",
      },
      { username: "Diana", email: "diana@example.com", password: "password4" },
      { username: "Ethan", email: "ethan@example.com", password: "password5" },
    ]);

    console.log("👤 Users created");

    // 3️⃣ Create posts (each linked to a user)
    const posts = [];
    for (let user of users) {
      const newPost = await Post.create({
        user: user._id,
        mood: Math.random() > 0.5 ? "high" : "low",
        content: `This is ${user.username}'s mood post.`,
      });

      user.posts.push(newPost._id);
      await user.save();
      posts.push(newPost);
    }

    console.log("📝 Posts created");

    // 4️⃣ Create one Ripple that references all posts
    const ripple = await Ripple.create({
      posts: posts.map((p) => p._id),
    });

    console.log("🌊 Ripple created:", ripple._id);

    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

// Run seeding
(async () => {
  await connectDB();
  await seedData();
})();
