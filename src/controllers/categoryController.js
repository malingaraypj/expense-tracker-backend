const Category = require("@/models/Category");
const AppError = require("@/utils/AppError");
const { asyncHandler } = require("@/middlewares/errorMiddleware");

// @desc    Get all categories (Global default categories + Logged-in user's custom categories)
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;

  // Query to fetch global categories (userId: null) OR user's custom categories
  const filter = {
    $or: [{ userId: null }, { userId: req.user }],
  };

  if (type) {
    filter.type = type.toUpperCase();
  }

  const categories = await Category.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Create a custom category for the logged-in user
// @route   POST /api/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const { name, type, color, icon } = req.body;

  // Check if category already exists for this user
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-insensitive check
    type: type.toUpperCase(),
    userId: req.user,
  });

  if (existingCategory) {
    throw new AppError(
      "You already have a category with this name and type",
      400,
    );
  }

  const category = await Category.create({
    name,
    type: type.toUpperCase(),
    userId: req.user,
    color,
    icon,
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Update a custom category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findOne({
    _id: req.params.id,
    userId: req.user, // Users can only update their own custom categories, not global ones
  });

  if (!category) {
    throw new AppError(
      "Category not found or you do not have permission to edit it",
      404,
    );
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Delete a custom category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    userId: req.user, // Users can only delete their own custom categories
  });

  if (!category) {
    throw new AppError(
      "Category not found or you do not have permission to delete it",
      404,
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category removed successfully",
  });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
