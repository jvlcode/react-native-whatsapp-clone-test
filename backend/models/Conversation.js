import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: [arr => arr.length === 2, "A conversation must have exactly 2 participants."]
    },
    lastMessage: {
      type:  mongoose.Schema.Types.ObjectId, ref: "Message" ,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}, // { userId: unreadCount }
    },
    openBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    }
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
