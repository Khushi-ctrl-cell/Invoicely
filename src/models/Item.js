const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Variant name is required"],
      trim: true,
    },
    additionalPrice: {
      type: Number,
      default: 0,
      min: [0, "Additional price cannot be negative"],
    },
    sku: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [200, "Item name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Base price cannot be negative"],
    },
    unit: {
      type: String,
      default: "pcs",
      trim: true,
    },
    hsnCode: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for search
itemSchema.index({ name: "text", description: "text" });
itemSchema.index({ isActive: 1 });

module.exports = mongoose.model("Item", itemSchema);
