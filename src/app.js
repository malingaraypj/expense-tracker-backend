const express = require("express");
const cors = require("cors");
const { errorHandler, notFound } = require("@/middlewares/errorMiddleware");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/admin", require("@/routes/admin/adminRoute"));
app.use("/api/auth", require("@/routes/authRoute"));
app.use("/api/categories", require("@/routes/categoryRoute"));
app.use("/api/transactions", require("@/routes/transactionRoute"));
app.use("/api/analytics", require("@/routes/analyticsRoute"));

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
