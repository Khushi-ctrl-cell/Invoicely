const PDFDocument = require("pdfkit");

const formatCurrency = (num) =>
  "₹ " + Number(num || 0).toLocaleString("en-IN");

// ❗ REMOVE async here
const generateInvoicePDF = (invoice) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(18).text("INVOICE", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text("Invoice Details", { underline: true });
  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .text(`Invoice Number: ${invoice.invoiceNumber}`)
    .text(`Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`)
    .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);

  doc.moveDown();

  doc.fontSize(12).text("Billed To:", { underline: true });
  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .text(`Customer Name: ${invoice.customer.name}`)
    .text(`Phone Number: ${invoice.customer.phone || "-"}`)
    .text(`Email ID: ${invoice.customer.email}`)
    .text(`Billing Address: ${invoice.customer.address?.country || "-"}`);

  doc.moveDown();

  const tableTop = doc.y;

  doc
    .fontSize(10)
    .text("Item Name", 50, tableTop)
    .text("Description", 140, tableTop)
    .text("Qty", 250, tableTop)
    .text("Price", 290, tableTop)
    .text("GST%", 350, tableTop)
    .text("Discount", 400, tableTop)
    .text("Total", 480, tableTop);

  let y = tableTop + 20;

  invoice.items.forEach((item) => {
    doc
      .text(item.name, 50, y)
      .text(item.description || "-", 140, y)
      .text(item.quantity, 250, y)
      .text(formatCurrency(item.unitPrice), 290, y)
      .text(`${item.gstRate}%`, 350, y)
      .text(
        item.discountType === "percentage"
          ? `${item.discountValue}%`
          : formatCurrency(item.discountValue),
        400,
        y
      )
      .text(formatCurrency(item.totalAmount), 480, y);

    y += 20;
  });

  doc.moveDown(2);

  doc.fontSize(12).text("Calculation Summary", { underline: true });
  doc.moveDown();

  doc
    .fontSize(10)
    .text(`Subtotal: ${formatCurrency(invoice.subtotal)}`)
    .text(`Total Discount: - ${formatCurrency(invoice.totalDiscount)}`)
    .text(`Total GST: + ${formatCurrency(invoice.totalGST)}`)
    .fontSize(12)
    .text(`GRAND TOTAL: ${formatCurrency(invoice.grandTotal)}`);

  doc.moveDown();

  doc.fontSize(12).text("Terms & Conditions", { underline: true });
  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .text("1. Payment due within 15 days.")
    .text("2. Late fee applicable.")
    .text("3. Jurisdiction: Bengaluru.");

  return doc;
};

module.exports = { generateInvoicePDF };