const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      enum: ["high", "low"],
      required: true,
    },
    content: {
      type: String,
      maxlength: 287,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
