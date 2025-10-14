// // backend/src/controllers/communityController.js
// const Community = require("../models/Community");

// // @desc    Create new community
// // @route   POST /api/communities
// exports.createCommunity = async (req, res, next) => {
//   try {
//     const { name, description } = req.body;

//     if (!name) {
//       return res.status(400).json({ message: "Name is required" });
//     }

//     const exists = await Community.findOne({ name });
//     if (exists) {
//       return res.status(400).json({ message: "Community already exists" });
//     }

//     const community = await Community.create({
//       name,
//       description,
//       members: [req.user.id], // creator auto-joins
//     });

//     res.status(201).json(community);
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc    Join a community
// // @route   POST /api/communities/:id/join
// exports.joinCommunity = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const community = await Community.findById(id);
//     if (!community) {
//       return res.status(404).json({ message: "Community not found" });
//     }

//     if (!community.members.includes(req.user.id)) {
//       community.members.push(req.user.id);
//       await community.save();
//     }

//     res.json({ message: "Joined community", community });
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc    Get all communities
// // @route   GET /api/communities
// exports.getCommunities = async (req, res, next) => {
//   try {
//     const communities = await Community.find().populate("members", "username");
//     res.json(communities);
//   } catch (err) {
//     next(err);
//   }
// };
