const { asyncHandler } = require("@/middlewares/errorMiddleware");
const Category = require("../models/Category");
const AppError = require("../utils/appError");

// @desc    Admin: Create a global default category (userId: null)
// @route   POST /api/categories/admin
// @access  Private/Admin
const createDefaultCategory = asyncHandler(async (req, res) => {
  const { name, type, color, icon } = req.body;

  // Check if a global default category with this name and type already exists
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-insensitive check
    type: type.toUpperCase(),
    userId: null, // Global category check
  });

  if (existingCategory) {
    throw new AppError(
      "A global default category with this name and type already exists",
      400,
    );
  }

  const category = await Category.create({
    name,
    type: type.toUpperCase(),
    userId: null, // Explicitly null for global/default categories
    color,
    icon,
  });

  res.status(201).json({
    success: true,
    message: "Global default category created successfully",
    data: category,
  });
});

module.exports = {
  createDefaultCategory,
};
