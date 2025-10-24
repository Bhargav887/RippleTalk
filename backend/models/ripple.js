const mongoose = require("mongoose");
const { Schema } = mongoose;

const rippleSchema = new Schema(
  {
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ripple", rippleSchema);
