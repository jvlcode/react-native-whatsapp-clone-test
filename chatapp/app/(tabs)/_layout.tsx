import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";

export default function TabLayout() {
  const unreadCount = useChatStore((state) =>
    Array.isArray(state.chats)
      ? state.chats.reduce((sum, chat) => sum + (chat.unread || 0), 0)
      : 0
  );
  const hasNewUpdates = true; // show dot if true

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarActiveTintColor: "#075E54",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#eee",
          height: 60,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName = "home";
          let IconComponent = Ionicons;

          switch (route.name) {
            case "chats":
              iconName = "chatbubble";
              break;
            case "updates":
              IconComponent = MaterialCommunityIcons;
              iconName = "update";
              break;
            case "communities":
              iconName = "people";
              break;
            case "calls":
              iconName = "call";
              break;
          }

          const iconColor = focused ? "#075E54" : color;

          return (
            <View className="relative items-center justify-center w-[48px] h-[48px]">
            <View
              className={`px-5 py-1.5 rounded-full ${
                focused ? "bg-green-200" : "bg-transparent"
              }`}
            >
              <IconComponent name={iconName} size={18} color={iconColor} />
            </View>
          
            {/* 🔢 Show badge number on chats */}
            {route.name === "chats" && unreadCount > 0 && (
              <View className="absolute top-2 -right-0.5 bg-green-600 rounded-full px-1.5 py-0.5 min-w-[16px] items-center justify-center">
                <Text className="text-white text-[8px] font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          
            {/* 🔘 Show small dot for updates */}
            {route.name === "updates" && hasNewUpdates && (
              <View className="absolute top-2 -right-0.5 bg-green-500 w-2 h-2 rounded-full" />
            )}
          </View>
          
          );
        },
      })}
    >
      <Tabs.Screen name="chats" options={{ title: "Chats" }} />
      <Tabs.Screen name="updates" options={{ title: "Updates" }} />
      <Tabs.Screen name="communities" options={{ title: "Communities" }} />
      <Tabs.Screen name="calls" options={{ title: "Calls" }} />
    </Tabs>
  );
}