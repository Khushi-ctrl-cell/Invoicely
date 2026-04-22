require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Invoice Generator API running`);
    console.log(`   ► Local:    http://localhost:${PORT}`);
    console.log(`   ► Health:   http://localhost:${PORT}/health`);
    console.log(`   ► Env:      ${process.env.NODE_ENV || "development"}\n`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const mongoose = require("mongoose");
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason);
    shutdown("UnhandledRejection");
  });
};

startServer();
