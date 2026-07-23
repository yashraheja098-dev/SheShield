import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import historicalIncidentRoutes from "./routes/historicalIncidentRoutes.js";
import safePointRoutes from "./routes/safePointRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import heatmapRoutes from "./routes/heatmapRoutes.js";
import journeyRoutes from "./routes/journeyRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// Middleware imports
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Routes ───────────────────────────────────────────────────────────────────

// 1. Authentication
app.use("/api/auth", authRoutes);

// 2. Trusted Contacts
app.use("/api/contacts", contactRoutes);
app.use("/contacts", contactRoutes);

// 3. Community Incident Reports
app.use("/api/incidents", incidentRoutes);
app.use("/incidents", incidentRoutes);

// 4. Historical Crime Data
app.use("/api/historical-incidents", historicalIncidentRoutes);

// 5. Safe Points
app.use("/api/safe-points", safePointRoutes);
app.use("/safe-points", safePointRoutes);

// 6. Route Analysis (Core USP)
app.use("/api/routes", routeRoutes);

// 7. Heatmap
app.use("/api/heatmap", heatmapRoutes);
app.use("/heatmap", heatmapRoutes);

// 8. Journey Tracking
app.use("/api/journey", journeyRoutes);
app.use("/journey", journeyRoutes);

// 9. SOS
app.use("/api/sos", sosRoutes);
app.use("/sos", sosRoutes);

// 10. Notifications
app.use("/api/notifications", notificationRoutes);

// 11. Safety Rooms & Chat
app.use("/api/rooms", roomRoutes);
app.use("/api", messageRoutes);

// 12. AI Assistant
app.use("/api/ai", aiRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SheShield Backend Server is healthy.",
    timestamp: new Date().toISOString()
  });
});

// ── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorMiddleware);

export default app;
