const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("@/controllers/categoryController");
const { protect } = require("@/middlewares/authMiddleware");

// All category routes require authentication
router.use(protect);

router.route("/").get(getCategories).post(createCategory);

router.route("/:id").put(updateCategory).delete(deleteCategory);

module.exports = router;
