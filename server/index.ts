import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import connectDB from "./config/database";
import passport from "./config/passport";

// Import routes
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import classRoutes from "./routes/classes";
import testRoutes from "./routes/test";

// Load environment variables
dotenv.config();

export function createServer() {
  const app = express();

  // Connect to MongoDB
  connectDB();

  // Middleware
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:8080",
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fitflow-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from FitFlow Express server!" });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Classes routes
  app.use("/api/classes", classRoutes);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  return app;
}
