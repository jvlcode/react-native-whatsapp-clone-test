    import Conversation from "./models/Conversation.js";

    export default function registerSocketHandlers(io) {
        console.log("📞 registerSocketHandlers called"); 
        io.on("connection", (socket) => {
        
        const userId = socket.handshake.auth.userId;;
        if (!userId) return;

        // After connecting, emit `join`
        socket.on("connect", () => {
            console.log("✅ Socket connected", socket.id);
            socket.emit("join", userId); // ✅ this triggers your backend log!
        });

        // Join user's room
        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`👥 User ${userId} joined their personal room`);
        });

        // ✅ When user focuses a conversation
        socket.on("focus-conversation", async (conversationId) => {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
            }
            conversation.unreadCounts.set(userId, 0);
        
            await conversation.save();
        
        } catch (err) {
            console.error("❌ focus-conversation error:", err.message);
        }
        });

        socket.on("focus-conversation", async (conversationId) => {
            try {
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                return res.status(404).json({ error: "Conversation not found" });
                }
                conversation.unreadCounts.set(userId, 0);
            
                await conversation.save();
            
            } catch (err) {
                console.error("❌ focus-conversation error:", err.message);
            }
        });

        // 🧹 Optional: Cleanup on disconnect
        socket.on("disconnect", async () => {
        try {
            await Conversation.updateMany(
            { openBy: userId },
            { $pull: { openBy: userId } }
            );
        } catch (err) {
            console.error("❌ disconnect cleanup error:", err.message);
        }
        });
    });
    }
