const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const itemRoutes = require("./routes/itemRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();

// ── Security ────────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ── CORS ─────────────────────────────────────────────────────────────────────
const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://glyph-invoice.vercel.app",
    "https://lovable.dev"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Invoice Generator API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Root route ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/items", itemRoutes);
app.use("/api/invoices", invoiceRoutes);

// ── 404 + Error handlers ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
