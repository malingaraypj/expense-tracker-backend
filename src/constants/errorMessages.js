const authErrorMessages = {
  USER_EXISTS: "User already exists with this email",
  INVALID_CREDENTIALS: "Invalid email or password",
  SERVER_ERROR: "Internal server error",
  UNAUTHORIZED: "Not authorized, token failed",
  NO_TOKEN: "Not authorized, no token provided",
};

module.exports = { authErrorMessages };
