const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoiceController");

// 🔥 DEBUG
console.log("Controller:", invoiceController);

// ✅ routes
router.get("/pdf/:id", invoiceController.downloadInvoicePDF);
router.get("/", invoiceController.getInvoices);
router.post("/", invoiceController.createInvoice);
router.get("/:id", invoiceController.getInvoiceById);
router.patch("/:id/status", invoiceController.updateInvoiceStatus);

// ❗ temporarily remove stats (to avoid crash)
/// router.get("/stats", invoiceController.getInvoiceStats);

module.exports = router;