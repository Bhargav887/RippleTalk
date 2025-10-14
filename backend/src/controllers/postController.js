// // backend/src/controllers/postController.js
// const Post = require("../models/Post");
// const Community = require("../models/Community");

// // @desc    Create new post
// // @route   POST /api/posts
// exports.createPost = async (req, res, next) => {
//   try {
//     const { content, communityId } = req.body;

//     if (!content || !communityId) {
//       return res
//         .status(400)
//         .json({ message: "Content and community required" });
//     }

//     const community = await Community.findById(communityId);
//     if (!community) {
//       return res.status(404).json({ message: "Community not found" });
//     }

//     const post = await Post.create({
//       content,
//       author: req.user.id, // from authMiddleware
//       community: communityId,
//     });

//     res.status(201).json(post);
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc    Get posts by community
// // @route   GET /api/posts/:communityId
// exports.getPostsByCommunity = async (req, res, next) => {
//   try {
//     const { communityId } = req.params;

//     const posts = await Post.find({ community: communityId })
//       .populate("author", "username email")
//       .populate("community", "name");

//     res.json(posts);
//   } catch (err) {
//     next(err);
//   }
// };
