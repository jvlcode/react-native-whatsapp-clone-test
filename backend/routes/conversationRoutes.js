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


router.post("/focus", async (req, res) => {
  const { userId, conversationId, focused } = req.body;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.unreadCounts.set(userId, 0);

    await conversation.save();

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error updating focus state:", err);
    res.status(500).json({ error: "Server error" });
  }
});



export default router;
