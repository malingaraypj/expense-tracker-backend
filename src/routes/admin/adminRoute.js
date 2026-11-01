const express = require("express");
const { admin } = require("../../middlewares/adminMiddleware");
const adminCategoryRoute = require("./adminCategoryRoute");
const { protect } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(admin);

router.use("/", adminCategoryRoute);

module.exports = router;
