import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { io } from "../server.js"; // ✅ import Socket.IO instance

const router = express.Router();

// 📌 GET All Conversations for a User
router.get("/:userId", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.params.userId,
    })
      .populate("participants", "name phone profileImage")
		  .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default router;
