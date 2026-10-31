const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
};

// Optional: Validate required config variables on startup
if (!config.mongoUri) {
  throw new Error("MONGO_URI is missing in environment variables.");
}

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET is missing in environment variables.");
}

module.exports = config;
