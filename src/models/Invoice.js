const mongoose = require("mongoose");

/* ───────────────── CUSTOMER ───────────────── */
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
  },
  { _id: false }
);

/* ───────────────── ITEMS ───────────────── */
const invoiceItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    quantity: {
      type: Number,
      required: true,
      min: [0.01, "Quantity must be greater than 0"],
    },

    unitPrice: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },

    gstRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },

    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    // computed fields
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },
  { _id: true }
);

/* ───────────────── MAIN SCHEMA ───────────────── */
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true, // ✅ IMPORTANT (manual number dena padega)
      unique: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    customer: {
      type: customerSchema,
      required: true,
    },

    items: {
      type: [invoiceItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "At least 1 item required",
      },
    },

    subtotal: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    totalGST: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
    },
  },
  { timestamps: true }
);

/* ───────────────── CALCULATIONS ───────────────── */
invoiceSchema.pre("save", function () {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalGST = 0;

  this.items = this.items.map((item) => {
    const lineSubtotal = item.quantity * item.unitPrice;

    let discountAmount =
      item.discountType === "percentage"
        ? (lineSubtotal * item.discountValue) / 100
        : item.discountValue;

    discountAmount = Math.min(discountAmount, lineSubtotal);

    const taxableAmount = lineSubtotal - discountAmount;
    const gstAmount = (taxableAmount * item.gstRate) / 100;
    const totalAmount = taxableAmount + gstAmount;

    item.discountAmount = Number(discountAmount.toFixed(2));
    item.taxableAmount = Number(taxableAmount.toFixed(2));
    item.gstAmount = Number(gstAmount.toFixed(2));
    item.totalAmount = Number(totalAmount.toFixed(2));

    subtotal += lineSubtotal;
    totalDiscount += discountAmount;
    totalGST += gstAmount;

    return item;
  });

  this.subtotal = Number(subtotal.toFixed(2));
  this.totalDiscount = Number(totalDiscount.toFixed(2));
  this.taxableAmount = Number((subtotal - totalDiscount).toFixed(2));
  this.totalGST = Number(totalGST.toFixed(2));
  this.grandTotal = Number((this.taxableAmount + totalGST).toFixed(2));
  this.balanceDue = Number((this.grandTotal - this.amountPaid).toFixed(2));
});

/* ───────────────── INDEXES ───────────────── */
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ "customer.email": 1 });
invoiceSchema.index({ createdAt: -1 });

/* ───────────────── EXPORT ───────────────── */
module.exports = mongoose.model("Invoice", invoiceSchema);