// backend/src/routes/communityRoutes.js
const express = require("express");
const router = express.Router();
const {
  createCommunity,
  joinCommunity,
  getCommunities,
} = require("../controllers/communityController");
const { requireAuth } = require("../middleware/authMiddleware");

// @route   POST /api/communities
router.post("/", requireAuth, createCommunity);

// @route   POST /api/communities/:id/join
router.post("/:id/join", requireAuth, joinCommunity);

// @route   GET /api/communities
router.get("/", getCommunities);

module.exports = router;
