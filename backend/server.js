import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import initSocket from "./socket/socket.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const startServer = async () => {
  try {
    // Wait for MongoDB before starting the API and Socket.IO.
    await connectDB();

    const app = express();

    // Socket.IO needs the Node HTTP server.
    const httpServer = http.createServer(app);

    const io = initSocket(httpServer);

    // Make Socket.IO available to REST controllers.
    app.set("io", io);

    // Middleware
    app.use(
      cors({
        origin: process.env.CLIENT_URL || "*",
        credentials: true,
      })
    );

    app.use(express.json());

    // Health check
    app.get("/", (req, res) => {
      res.json({
        status: "Revly API is running",
      });
    });

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/stats", statsRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/conversations", conversationRoutes);
    app.use("/api/notifications", notificationRoutes);

    // Error handlers must be last.
    app.use(notFound);
    app.use(errorHandler);

    const PORT = process.env.PORT || 5001;

    httpServer.listen(PORT, () => {
      console.log(
        `Revly API listening on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Revly server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();