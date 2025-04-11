import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "@/utils/socket";
import Constants from "expo-constants";
import { getUser } from "@/utils/storage"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useChatStore } from "@/stores/chatStore";

const categories = ["All", "Unread", "Favorites", "Groups"];
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function ChatsScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const chats = useChatStore((state) => state.chats);
  const [user, setUser] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  

  useEffect(() => {
    if (!user?._id) return;

    const fetchChats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/conversations/${user._id}`);
        const data = await res.json();
        const formattedChats = data.map((conv) => formatChat(conv));

        formattedChats.sort((a, b) => {
          const timeA = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
          const timeB = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
          return timeB - timeA;
        });

        // setChats(formattedChats);
        useChatStore.getState().setChats(formattedChats);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    };

    fetchUser();
  }, []);

  function formatChat(conversation) {
    const otherParticipant = conversation.participants?.find(
      (p) => p._id !== user._id
    );

    const lastMessage = conversation?.lastMessage;

    return {
      ...conversation,
      name: otherParticipant?.phone || "Unknown",
      message: lastMessage?.text || "No messages yet",
      createdAt: new Date(
        lastMessage?.createdAt || conversation.updatedAt
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      unread: conversation?.unreadCounts?.[user._id] || 0,
      avatar:
        otherParticipant?.profileImage ||
        "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
    };
  }

  useEffect( () => {
    if (!user?._id) return;
    if (getSocket()?.connected) return;

    connectSocket(user._id, () => {
      const socket = getSocket();
      if (!socket) return;

      socket.on("message", ({ message, conversation, isNew }) => {
        const prevChats = useChatStore.getState().chats || [];
        const exists = prevChats.some((c) => c._id === conversation._id);

        const updatedChats = exists
          ? prevChats.map((chat) =>
              chat._id === conversation._id
                ? formatChat({ ...conversation })
                : chat
            )
          : [formatChat(conversation), ...prevChats];

        const sortedChats = updatedChats.sort((a, b) => {
          const timeA = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
          const timeB = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
          return timeB - timeA;
        });

        useChatStore.getState().setChats(sortedChats);
      });
      
    return () => {
      getSocket()?.disconnect();
    };
  });
  }, [user]);

  useEffect(() => {
    const applyFilters = () => {
      if (!user?._id) return;

      let filtered = Array.isArray(chats) ? [...chats] : [];

      if (activeCategory === "Unread") {
        filtered = filtered.filter((chat) => chat.unread > 0);
      } else if (activeCategory === "Favorites") {
        filtered = filtered.filter((chat) => chat.isFavorite);
      } else if (activeCategory === "Groups") {
        filtered = filtered.filter((chat) => chat.isGroup);
      }

      setFilteredChats(filtered);
    };

    applyFilters();
  }, [activeCategory, chats, user]);

  const focusConversation = async (conversationId: string, focused: boolean) => {
    const socket = getSocket();
    if (!user?._id || !socket) return;
  
    if (focused) {
      socket.emit("focus-conversation", conversationId);
      const prevChats = useChatStore.getState().chats || [];
      const updateChats = prevChats.map((chat) =>
          chat._id === conversationId ? { ...chat, unread: 0 } : chat
        )
      
      useChatStore.getState().setChats(updateChats)
    } else {
      socket.emit("unfocus-conversation", conversationId);
    }
  };

  return (
    <View className="flex-1 bg-white pt-10 relative">
      {isSearchActive ? (
        <SearchBar
          onCancel={() => setIsSearchActive(false)}
          onSearch={(text) => {}}
        />
      ) : (<>
        <View className="px-4 flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-green-700">WhatsApp</Text>
          <View className="flex-row space-x-5">
            <TouchableOpacity>
              <Ionicons name="qr-code-outline" size={24} color="#075E54" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Feather name="more-vertical" size={24} color="#075E54" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mx-4 mb-3 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            onFocus={() => setIsSearchActive(true)}
            placeholder="Ask Meta AI or search"
            className="ml-2 flex-1 text-sm"
            placeholderTextColor="gray"
          />
        </View>
      </>)}

      <View className="flex-row px-4 mb-3 space-x-2">
        {categories.map((item) => {
          const isActive = activeCategory === item;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => setActiveCategory(item)}
              className={`px-3 py-1 rounded-full ${isActive ? "bg-green-200" : "bg-gray-200"
                }`}
            >
              <Text
                className={`text-sm ${isActive ? "text-green-900 font-semibold" : "text-gray-700"
                  }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredChats.length > 0 ? <FlatList
        data={filteredChats}
        keyExtractor={(item) => item._id}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => (
          <View className="h-[0.5px] bg-gray-200 mx-4" />
        )}
        ListFooterComponent={() => (
          <View className="py-6 items-center justify-center">
            <MaterialCommunityIcons
              name="lock-outline"
              size={16}
              color="gray"
            />
            <Text className="text-gray-500 text-xs mt-1">
              Your personal messages are end-to-end encrypted
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              focusConversation(item._id, true);
            }}
            className="flex-row items-center px-4 py-3"
          >
            <Image
              source={{ uri: item.avatar }}
              className="w-12 h-12 rounded-full"
            />
            <View className="flex-1 ml-4">
              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-black">
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500">{item.createdAt}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text
                  numberOfLines={1}
                  className="text-sm text-gray-600 flex-1"
                >
                  {item.message}
                </Text>
                {item.unread > 0 && (
                  <View className="bg-green-600 rounded-full px-2 ml-2 min-w-[20px] items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {item.unread}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      /> : <EmptyChats />}
    </View>
  );
}

function SearchBar({ onSearch, onCancel }) {
  const [query, setQuery] = useState("");

  return (
    <View className="flex-row items-center bg-gray-200 rounded-full px-4 py-2 mx-4 my-3">
      <TouchableOpacity onPress={onCancel}>
        <Ionicons name="arrow-back" size={24} color="gray" />
      </TouchableOpacity>
      <TextInput
        autoFocus
        value={query}
        onChangeText={setQuery}
        placeholder="Search..."
        selectionColor="#075E54"
        placeholderTextColor="gray"
        className="ml-3 flex-1 text-base text-black outline-none"
      />
      <TouchableOpacity className="focus:outline-none" onPress={() => onSearch(query)}>
        <Feather name="send" size={20} color="#075E54" />
      </TouchableOpacity>
    </View>
  );
}

function EmptyChats() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <MaterialIcons name="chat-bubble-outline" size={100} color="#ccc" />
      <Text className="text-xl font-semibold mt-6">Start chatting on WhatsApp</Text>
      <Text className="text-center text-gray-500 mt-2">
        Tap the message icon below to start a new conversation
      </Text>
      <TouchableOpacity className="absolute bottom-6 right-6 bg-green-500 p-4 rounded-full shadow-lg">
        <MaterialIcons name="message" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
