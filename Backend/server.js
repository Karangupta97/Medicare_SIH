import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB, { connectAllDatabases } from "./DB/db.js";
import authRoutes from "./routes/User/auth.routes.js";
import reportsRoutes from "./routes/User/reports.routes.js";
import storageRoutes from "./routes/User/storage.routes.js";
import notificationsRoutes from "./routes/User/notifications.routes.js";
import medicalInfoRoutes from "./routes/User/medicalInfo.routes.js";
import connectedDeviceRoutes from "./routes/User/connectedDevice.routes.js";
import hospitalRoutes from "./routes/Hospital/hospital.routes.js";
import userRoutes from "./routes/User/user.routes.js";
import founderRoutes from "./routes/Founder/founder.routes.js";
import staffRoutes from "./routes/Admin/Staff/staffManagement.routes.js";
import staffAuthRoutes from "./routes/Admin/Staff/staffAuth.routes.js";
import teamRoutes from "./routes/Admin/Team/team.routes.js";
import doctorRoutes from "./routes/Doctor/doctor.routes.js";
import doctorVerificationRoutes from "./routes/Admin/Staff/StaffWorks/doctorVerification.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./utils/socket.js";
import status from "express-status-monitor";
import os from "os";
import { sendNotificationToUser } from "./utils/notifications.js";
import cookieParser from "cookie-parser";
import reviewRoutes from "./routes/review.routes.js";
import pincodeRoutes from "./routes/User/pincode.routes.js";
import emergencyRoutes from "./routes/User/emergency.routes.js";
import reportSharingRoutes from "./routes/User/reportSharing.routes.js";
import familyVaultRoutes from "./routes/User/familyVault.routes.js";
import paymentRoutes from "./routes/User/payment.routes.js";
import mailjetTestRoutes from "./routes/test-mailjet.routes.js";

// Define a simple logger
const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`),
  debug: (message) => console.debug(`[DEBUG] ${message}`),
};

// Global variables accessible across workers
let io;
let connectedUsers = new Map();
let app;

// Cluster mode is risky on container platforms (multiple workers + DB connects can
// slow readiness or crash-loop). Keep single-process by default and allow opt-in.
const enableCluster = String(process.env.CLUSTER_MODE || "").toLowerCase() === "true";
const totalCPUs = os.cpus().length;
const desiredWorkers = Number.parseInt(process.env.WEB_CONCURRENCY || "", 10);
const workerCount = Number.isFinite(desiredWorkers) && desiredWorkers > 0
  ? desiredWorkers
  : 1;

if (enableCluster && workerCount > 1) {
  const { default: cluster } = await import("node:cluster");
  const isDevelopment = process.env.NODE_ENV === "development";

  if (cluster.isPrimary && !isDevelopment) {
    console.log(`Medicare API Server - Cluster Mode Enabled`);
    console.log(`Primary process ${process.pid} is running`);
    console.log(`Using ${Math.min(workerCount, totalCPUs)} workers out of ${totalCPUs} available CPU cores`);

    for (let i = 0; i < Math.min(workerCount, totalCPUs); i++) cluster.fork();

    cluster.on("exit", (worker, code, signal) => {
      logger.error(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`);
      logger.info("Starting a new worker...");
      cluster.fork();
    });
  } else {
    console.log(`Worker ${process.pid} started`);
    await startServer();
  }
} else {
  console.log(`Medicare API Server - Single Process Mode`);
  console.log(`Process ${process.pid} started`);
  await startServer();
}

async function startServer() {
  // Get directory path for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Load environment variables with absolute path (does not override injected vars)
  dotenv.config({ path: path.resolve(__dirname, ".env") });

  const port = process.env.PORT || 4000;
  app = express();

  // Middleware
  app.use(status({ path: "/status" }));
  // Dynamic CORS configuration
  const configuredClients = (process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);

  const defaultOrigins = [
    "https://medicares.in",
    "https://www.medicares.in",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://192.168.0.106:3000",
    "http://192.168.0.107:3000",
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredClients]));

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  app.use(express.json());
  app.use(cookieParser()); // Add cookie parser for handling HTTP-only cookies

  // Request logging middleware - simplified to reduce log clutter
  app.use((req, res, next) => {
    // Only log certain requests, exclude status checks, options requests, etc.
    if (req.method !== "OPTIONS" && !req.url.includes("/status")) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
    next();
  });

  // Register API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/storage", storageRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/medical-info", medicalInfoRoutes);
  app.use("/api/connected-devices", connectedDeviceRoutes);
  app.use("/api/hospital", hospitalRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/founder", founderRoutes); // Add founder routes
  app.use("/api/staff", staffRoutes); // Add staff routes
  app.use("/api/staff-auth", staffAuthRoutes); // Add staff auth routes
  app.use("/api/teams", teamRoutes); // Add team routes
  app.use("/api/doctor", doctorRoutes); // Add doctor routes
  app.use("/api/doctor-verification", doctorVerificationRoutes); // Move doctor verification to a separate path
  app.use("/api/reviews", reviewRoutes); // Add review routes
  app.use("/api/pincode", pincodeRoutes);
  app.use("/api/emergency", emergencyRoutes); // Public Emergency Folder by UMID (QR scan)
  app.use("/api/report-sharing", reportSharingRoutes); // Patient report sharing with doctors
  app.use("/api/family-vault", familyVaultRoutes); // Family Vault management
  app.use("/api/payment", paymentRoutes); // Razorpay payment gateway
  if (process.env.NODE_ENV !== "production") {
    app.use("/test-mailjet-email", mailjetTestRoutes); // Test-only Mailjet route
  }

  // Root route
  app.get("/", (req, res) => {
    res.json({
      message: `Hello from Medicare API Server! ${process.pid}`,
      status: "Medicare API Server is ready"
    });
  });

  // Lightweight health endpoints for platform checks
  let dbReady = false;
  app.get("/health", (req, res) => res.status(200).send("ok"));
  app.get("/ready", (req, res) => {
    if (dbReady) return res.status(200).json({ ok: true });
    return res.status(503).json({ ok: false, reason: "db_not_ready" });
  });

  // Health check route for WebSocket testing
  app.get("/socket-health", (req, res) => {
    const wsStatus = io
      ? "WebSocket server initialized"
      : "WebSocket server not initialized";
    const connectedClientsCount = io ? io.engine.clientsCount : 0;

    res.json({
      status: "success",
      message: wsStatus,
      socketPath: "/socket.io",
      activeConnections: connectedClientsCount,
      transports: ["polling", "websocket"],
      timestamp: new Date().toISOString(),
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize WebSocket server
  io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = [
          "https://medicares.in",
          "https://www.medicares.in",
          "http://localhost:5173", // Vite's default port for development
          "http://localhost:3000", // Additional development port
          "http://192.168.0.106:3000", // For Mobile test
        ];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log(`CORS: Origin '${origin}' not allowed`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    path: "/socket.io",
    transports: ["polling", "websocket"],
    allowUpgrades: true,
    pingTimeout: 30000,
    pingInterval: 25000,
    cookie: false,
  });

  // Initialize Socket.IO
  initSocket(io);

  // Start listening immediately so the platform can reach the container.
  // DB connects in background; /ready reflects DB readiness.
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server ${process.pid} listening on 0.0.0.0:${port}`);
  });

  const connectWithRetry = async () => {
    const baseDelayMs = 1000;
    const maxDelayMs = 15000;
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      attempt += 1;
      try {
        await connectAllDatabases();
        dbReady = true;
        console.log("✅ Databases connected; readiness is OK");
        return;
      } catch (error) {
        dbReady = false;
        const delay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, Math.min(6, attempt - 1)));
        console.error(`MongoDB connection error (attempt ${attempt}). Retrying in ${delay}ms.`);
        console.error(error?.message || error);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  };

  void connectWithRetry();

  // ── Auto-expire time-limited report shares (every 15 minutes) ─────────
  setInterval(async () => {
    try {
      const { ReportShare } = await import("./models/User/ReportShare.model.js");
      const ShareModel = ReportShare();
      const result = await ShareModel.updateMany(
        {
          status: "active",
          expiresAt: { $ne: null, $lte: new Date() },
        },
        { $set: { status: "expired" } }
      );
      if (result.modifiedCount > 0) {
        console.log(`⏰ Auto-expired ${result.modifiedCount} report share(s)`);
      }
    } catch (err) {
      // Silently ignore if DB is not ready yet
      if (!err.message?.includes("not connected")) {
        console.error("Error auto-expiring shares:", err.message);
      }
    }
  }, 15 * 60 * 1000); // 15 minutes
}

// Helper function to send notification to a specific user
const sendUserNotification = async (
  userId,
  title,
  message,
  type = "info",
  link = null
) => {
  return await sendNotificationToUser(
    io,
    connectedUsers,
    userId,
    title,
    message,
    type,
    link
  );
};

export default app;
export { io, sendUserNotification };
