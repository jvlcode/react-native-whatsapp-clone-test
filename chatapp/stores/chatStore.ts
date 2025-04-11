import { create } from "zustand";

interface Chat {
  _id: string;
  unread: number;
  // ... other fields
}

interface ChatState {
  chats: Chat[];
  setChats: (chats: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  updateChat: (chat: Chat) => void;
  getUnreadCount: () => number;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],

  setChats: (chats) => set({ chats }),

  updateChat: (updatedChat) => {
    const chats = get().chats;
    const index = chats.findIndex((c) => c._id === updatedChat._id);
    if (index !== -1) {
      chats[index] = updatedChat;
      set({ chats: [...chats] });
    } else {
      set({ chats: [updatedChat, ...chats] });
    }
  },

  getUnreadCount: () => get().chats.filter((c) => c.unread > 0).length,
}));
