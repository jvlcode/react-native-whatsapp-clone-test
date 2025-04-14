import { getUser } from "@/utils/storage";
import { create } from "zustand";

interface User {
  _id: string;
  phone: number;
  name: string;
  profileImage: string;
  // ... other fields
}

interface UserState {
  user: User|null;
  setUser: (user:User) => void;
  loadUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,

  setUser: (user) => set({user}),

  loadUser: async () => {
    console.log("TEST")
    const storedUser = await getUser();
    if (storedUser) {
      set({ user: storedUser });
    }
  },

})
);
