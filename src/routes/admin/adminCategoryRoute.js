const express = require("express");
const {
  createDefaultCategory,
  updateDefaultCategory,
  deleteDefaultCategory,
} = require("../../controllers/admin.categoryController");

const router = express.Router();

router.route("/categories").post(createDefaultCategory);

router
  .route("/categories/:id")
  .put(updateDefaultCategory)
  .delete(deleteDefaultCategory);

module.exports = router;
