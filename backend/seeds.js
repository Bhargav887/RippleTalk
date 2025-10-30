require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Post = require("./models/post");
const Ripple = require("./models/ripple");

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

    console.log("👤 Users created");
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
