const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("@/controllers/transactionController");

const { protect } = require("@/middlewares/authMiddleware");

// Apply protection middleware to all transaction routes
router.use(protect);

router.route("/").get(getTransactions).post(createTransaction);

router
  .route("/:id")
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
