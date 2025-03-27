import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import path from "path";

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/users", userRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
