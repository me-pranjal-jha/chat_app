import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import cors from "cors";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import connectDB from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

if (!fs.existsSync(frontendDistPath)) {
  console.error("❌ Frontend dist not found at:", frontendDistPath);
} else {
  console.log("✅ Serving frontend from:", frontendDistPath);
  console.log("📁 Dist contents:", fs.readdirSync(frontendDistPath));
}

const PORT = ENV.PORT || 3000;

const allowedOrigins = ["http://localhost:5173", ENV.CLIENT_URL].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Temporary debug logging
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

app.use(express.static(frontendDistPath));

app.get("*", (req, res) => {
  console.log(`🔴 Catch-all hit for: ${req.url}`);
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});