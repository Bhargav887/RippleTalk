const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    mood: {
      type: String,
      enum: ["high", "low"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 278,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
