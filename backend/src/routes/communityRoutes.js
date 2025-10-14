const express = require("express");
const router = express.Router();
const Community = require("../models/Community");

// Get all posts for a community
router.get("/:communityId/posts", async (req, res, next) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId).populate({
      path: "posts",
      populate: { path: "user", select: "username email" },
    });

    if (!community)
      return res.status(404).json({ error: "Community not found" });

    res.json({
      message: "Posts fetched",
      total: community.posts.length,
      posts: community.posts,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
