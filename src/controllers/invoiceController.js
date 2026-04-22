const Invoice = require("../models/Invoice");
const { generateInvoicePDF } = require("../utils/pdfGenerator");

// CREATE
const createInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.create(req.body);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL
const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find();
    res.json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
};

// GET ONE
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

// UPDATE STATUS
const updateInvoiceStatus = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

// 🔥 FINAL WORKING PDF DOWNLOAD
const downloadInvoicePDF = async (req, res, next) => {
  try {
    console.log("🔥 PDF ROUTE HIT");

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    );

    // ❗ NO await here
    const doc = generateInvoicePDF(invoice);

    // pipe first
    doc.pipe(res);

    // end after pipe
    doc.end();

    console.log("✅ PDF sent");
  } catch (err) {
    console.error("❌ PDF ERROR:", err);
    next(err);
  }
};

// STATS
const getInvoiceStats = async (req, res, next) => {
  try {
    const count = await Invoice.countDocuments();

    res.json({
      success: true,
      totalInvoices: count,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  downloadInvoicePDF,
  getInvoiceStats,
};