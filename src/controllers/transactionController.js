const Transaction = require("@/models/Transaction");
const AppError = require("@/utils/AppError");
const { asyncHandler } = require("@/middlewares/errorMiddleware");

// @desc    Get all transactions for logged-in user (with optional filters)
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const { type, category, startDate, endDate } = req.query;

  // Build dynamic filter query
  const filter = { userId: req.user };

  if (type) filter.type = type.toUpperCase();
  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(filter).sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions,
  });
});

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user,
  });

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, category, date, description } = req.body;

  const transaction = await Transaction.create({
    userId: req.user,
    type,
    amount,
    category,
    date,
    description,
  });

  res.status(201).json({
    success: true,
    data: transaction,
  });
});

// @desc    Update an existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = asyncHandler(async (req, res) => {
  let transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user,
  });

  if (!transaction) {
    throw new AppError("Transaction not found or unauthorized", 404);
  }

  transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user,
  });

  if (!transaction) {
    throw new AppError("Transaction not found or unauthorized", 404);
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    message: "Transaction removed successfully",
  });
});

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
