const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  // Default to 500 server error if status code isn't set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // Production mode: Don't leak stack traces for operational errors
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
      });
    } else {
      // Programming or unknown errors: don't leak details to the client
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
  const AppError = require("@/utils/AppError");
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

module.exports = { asyncHandler, errorHandler, notFound };
