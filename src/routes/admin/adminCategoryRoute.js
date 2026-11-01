const express = require("express");
const {
  createDefaultCategory,
} = require("../../controllers/admin.categoryController");

const router = express.Router();

router.route("/categories").post(createDefaultCategory);

module.exports = router;
