const AppError = require("@/utils/AppError");

const admin = (req, res, next) => {
  if (req.user && req.isAdmin) {
    next();
  } else {
    throw new AppError("Not authorized as an admin", 403);
  }
};

module.exports = { admin };
