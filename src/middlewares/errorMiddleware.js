const AppError = require("@/utils/AppError");

// 1. Handle Invalid Mongoose ObjectIDs / Cast Errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// 2. Handle MongoDB Duplicate Key Errors (Unique constraint violations)
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value '${value}' for field '${field}'. Please use another value.`;
  return new AppError(message, 400);
};

// 3. Handle Mongoose Schema Validation Errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// 4. Handle Mongoose Strict Mode Errors (Unknown fields in body)
const handleStrictModeErrorDB = (err) => {
  const message = `Field not allowed by schema: ${err.message}`;
  return new AppError(message, 400);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Central Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Transform Mongoose specific database errors into operational AppErrors
  if (err.name === "CastError") error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.name === "StrictModeError") error = handleStrictModeErrorDB(err);

  if (process.env.NODE_ENV === "development") {
    res.status(error.statusCode || 500).json({
      success: false,
      status: error.status || "error",
      message: error.message,
      stack: error.stack,
    });
  } else {
    // Production mode
    if (error.isOperational) {
      res.status(error.statusCode).json({
        success: false,
        status: error.status,
        message: error.message,
      });
    } else {
      // Programming or unknown errors: don't leak details
      console.error("ERROR 💥", err);
      res.status(500).json({
        success: false,
        status: "error",
        message: "Something went very wrong!",
      });
    }
  }
};

const notFound = (req, res, next) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

module.exports = { asyncHandler, errorHandler, notFound };
