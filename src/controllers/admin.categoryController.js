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

// @desc    Admin: Update a global default category (userId: null)
// @route   PUT /api/categories/admin/:id
// @access  Private/Admin
const updateDefaultCategory = asyncHandler(async (req, res) => {
  let category = await Category.findOne({
    _id: req.params.id,
    userId: null, // Ensures it's a global default category
  });

  if (!category) {
    throw new AppError("Global default category not found", 404);
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Global default category updated successfully",
    data: category,
  });
});

// @desc    Admin: Delete a global default category (userId: null)
// @route   DELETE /api/categories/admin/:id
// @access  Private/Admin
const deleteDefaultCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    userId: null, // Ensures it's a global default category
  });

  if (!category) {
    throw new AppError("Global default category not found", 404);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Global default category removed successfully",
  });
});

module.exports = {
  createDefaultCategory,
  updateDefaultCategory,
  deleteDefaultCategory,
};
