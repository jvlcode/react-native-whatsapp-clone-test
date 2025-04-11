// utils/socket.ts
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://192.168.1.5:5000"; // ✅ Use your LAN IP

let socket: Socket | null = null;

export const connectSocket = (userId: string, onConnect?: () => void) => {
    console.log('connecting')
  if (socket && socket.connected) {
    console.log("🟢 Already connected");
    return;
  }

  socket = io(SERVER_URL, {
    auth: {userId},
    transports: ["websocket"], // important for React Native
    forceNew: true, // ensures fresh connection
    reconnection: true, // auto reconnect
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    socket?.emit("join", userId); // Join user's personal room
    onConnect?.(); // optional callback
  });

  socket.on("connect_error", (err) => {
    console.error("🚨 Socket connection error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });
};

export const getSocket = (): Socket | null => socket;
