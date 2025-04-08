import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    media: {
      url: {
        type: String,
        default: null,
      },
      type: {
        type: String, // "image", "video", "audio", "document", etc.
        enum: ["image", "video", "audio", "document", "other"],
        default: null,
      },
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // references another message
      default: null,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default mongoose.model("Message", messageSchema);
