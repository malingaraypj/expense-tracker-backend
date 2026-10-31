const Transaction = require("@/models/Transaction");
const { asyncHandler } = require("@/middlewares/errorMiddleware");
const mongoose = require("mongoose");

// @desc    Get category-wise breakdown for Pie/Doughnut charts
// @route   GET /api/analytics/category-breakdown
// @access  Private
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;

  const matchStage = { userId: new mongoose.Types.ObjectId(req.user) };

  if (type) matchStage.type = type.toUpperCase();
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  const breakdown = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        totalAmount: 1,
        count: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: breakdown,
  });
});

// @desc    Get monthly spending/income trend for Line/Bar charts
// @route   GET /api/analytics/monthly-trend
// @access  Private
const getMonthlyTrend = asyncHandler(async (req, res) => {
  const { type } = req.query;

  const matchStage = { userId: new mongoose.Types.ObjectId(req.user) };
  if (type) matchStage.type = type.toUpperCase();

  const trend = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        totalAmount: 1,
        count: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: trend,
  });
});

module.exports = {
  getCategoryBreakdown,
  getMonthlyTrend,
};
