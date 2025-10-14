// // backend/src/controllers/authController.js
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// // @desc    Register new user
// // @route   POST /api/auth/register
// exports.registerUser = async (req, res, next) => {
//   try {
//     const { username, email, password } = req.body;

//     if (!username || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//     });

//     const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

//     res.status(201).json({
//       token,
//       user: { id: user._id, username: user.username, email: user.email },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc    Login user
// // @route   POST /api/auth/login
// exports.loginUser = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

//     res.json({
//       token,
//       user: { id: user._id, username: user.username, email: user.email },
//     });
//   } catch (err) {
//     next(err);
//   }
// };
