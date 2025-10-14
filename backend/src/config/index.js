const dotenv = require("dotenv");
const path = require("path");

// Load .env file if it exists (for local dev)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Export config variables
module.exports = {
  port: process.env.PORT || 8080,
  mongoURL: process.env.MONGO_URL || "mongodb://127.0.0.1:27017/rippletalk",
};
