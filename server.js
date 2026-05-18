import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import patientRoutes from "./routes/patients.js";
import appointmentRoutes from "./routes/appointments.js";
import prescriptionRoutes from "./routes/prescriptions.js";
import diagnosisRoutes from "./routes/diagnosis.js";
import aiRoutes from "./routes/ai.js";
import analyticsRoutes from "./routes/analytics.js";
import errorHandler from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

connectDB();

const corsOptions = {
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.use("/api", generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/diagnosis", diagnosisRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
    message: "AI Clinic Management API is running",
  });
});

app.use("*", (req, res) =>
  res.status(404).json({ success: false, error: "Route not found" })
);

app.use(errorHandler);

const DEFAULT_PORT = Number(process.env.PORT) || 5000;
let server;

const startServer = (port, attempt = 0) => {
  const maxAttempts = 5;
  server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < maxAttempts) {
      const nextPort = port + 1;
      console.warn(
        `Port ${port} in use, trying port ${nextPort} (attempt ${attempt + 1})`
      );
      // give a short delay before retrying
      setTimeout(() => startServer(nextPort, attempt + 1), 300);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
};

startServer(DEFAULT_PORT);

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  if (server && server.close) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
