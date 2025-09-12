// backend/src/routes/postRoutes.js
const express = require("express");
const router = express.Router();
const {
  createPost,
  getPostsByCommunity,
} = require("../controllers/postController");
const { requireAuth } = require("../middleware/authMiddleware");

// @route   POST /api/posts
router.post("/", requireAuth, createPost);

// @route   GET /api/posts/:communityId
router.get("/:communityId", getPostsByCommunity);

module.exports = router;
