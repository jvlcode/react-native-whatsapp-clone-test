import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import http from "http"; // ✅ required for socket.io
import { Server } from "socket.io"; // ✅ socket.io

// Routes
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const app = express();

// 🔌 Middleware
app.use(express.json());
app.use(cors());

// 🖼️ Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🛠️ Routes
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(5000, () => console.log("Server running on port 5000"));

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Change to your frontend origin in production
    methods: ["GET", "POST"],
  },
});

// ✅ Export io so routes can use it
export { io };

// ✅ Setup socket connection
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // Join user's room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👥 User ${userId} joined their personal room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});


// 📦 Connect MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
