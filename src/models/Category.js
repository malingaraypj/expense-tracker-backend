const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
      required: [true, "Category type is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null means it's a global/default system category
    },
    color: {
      type: String,
      default: "#3b82f6", // Default blue color for frontend UI
      trim: true,
    },
    icon: {
      type: String,
      default: "tag", // Default icon identifier
      trim: true,
    },
  },
  { timestamps: true },
);

// Compound index to ensure a user doesn't create duplicate category names for the same type
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
