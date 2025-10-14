require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const postRoutes = require("./routes/postRoutes");
const communityRoutes = require("./routes/communityRoutes");

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/rippletalk";

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// DB Connection
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  });

// Routes
app.get("/", (req, res) => res.json({ message: "RippleTalk API 🌊" }));
app.use("/posts", postRoutes);
app.use("/community", communityRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
