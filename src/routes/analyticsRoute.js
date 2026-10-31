const express = require("express");
const router = express.Router();
const {
  getCategoryBreakdown,
  getMonthlyTrend,
} = require("@/controllers/analyticsController");
const { protect } = require("@/middlewares/authMiddleware");

// All analytics routes require authentication
router.use(protect);

router.get("/category-breakdown", getCategoryBreakdown);
router.get("/monthly-trend", getMonthlyTrend);

module.exports = router;
