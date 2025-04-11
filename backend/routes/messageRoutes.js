import express from "express";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { io } from "../server.js"; // ✅ import Socket.IO instance

const router = express.Router();

// 📌 GET All Messages in a Conversation
router.get("/:conversationId", async (req, res) => {
	try {
	  const messages = await Message.find({
		conversationId: req.params.conversationId,
	  })
		.sort({ createdAt: 1 }) // oldest to newest
		.populate("senderId", "name phone profileImage")
		.populate("replyTo", "text media senderId"); // for replying to messages
  
	  res.json(messages);
	} catch (error) {
	  console.error("❌ Error fetching messages:", error);
	  res.status(500).json({ error: error.message });
	}
  });
  
// 📩 Send a message (creates conversation if it doesn't exist)
router.post("/", async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  try {
    // 🧠 Find or create conversation (always populated)
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("participants", "name phone profileImage");

    let isNew = false;

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });

      await conversation.save();
      isNew = true;

      // ✅ Populate after saving new conversation
      await conversation.populate("participants", "name phone profileImage");
    }

    // ✅ Update unread count
    const currentUnread = conversation.unreadCounts.get(receiverId.toString()) || 0;
    conversation.unreadCounts.set(receiverId.toString(), currentUnread + 1);

    // ✉️ Save the message
    const message = new Message({
      conversationId: conversation._id,
      senderId,
      text,
    });

    await message.save();

    // ⏱️ Update last activity
    conversation.lastMessage = message;
    conversation.updatedAt = new Date();
    await conversation.save();

    // 🔔 Emit real-time message
    io.to(receiverId).emit("message", {
      message,
      conversation,
      isNew,
    });

    res.status(201).json({ conversation, message, isNew });
  } catch (error) {
    console.error("💥 Error sending message:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
