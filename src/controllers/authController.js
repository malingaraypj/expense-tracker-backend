const User = require("@/models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("@/config/env");
const AppError = require("@/utils/AppError");
const { authErrorMessages } = require("@/constants/errorMessages");
const { asyncHandler } = require("@/middlewares/errorMiddleware");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: "7d" });
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError(authErrorMessages.USER_EXISTS, 400));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      success: true,
    });
  } else {
    return next(new AppError("Invalid user data", 400));
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(authErrorMessages.INVALID_CREDENTIALS, 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError(authErrorMessages.INVALID_CREDENTIALS, 401));
  }

  res.json({
    success: true,
    token: generateToken(user._id),
  });
});

module.exports = { registerUser, loginUser };
