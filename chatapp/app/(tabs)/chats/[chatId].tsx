import {
  Feather,
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Entypo,
} from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { fetchMessages } from "@/utils/api";
import { useUserStore } from "@/stores/userStore";
import { useChatStore } from "@/stores/chatStore";
import { getSocket } from "@/utils/socket";

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams(); // optional for dynamic routing
  const [replyTo, setReplyTo] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [inputText, setInputText] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);  // Whether we are in selection mode
  const [selectedMessages, setSelectedMessages] = useState([]); // array to hold selected messages
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const conv = useChatStore((s) => s.conv);
 

  useEffect(() => {
    if(conv)
     setOtherParticipant(conv.participants.find(p => p._id !== user._id)     );
  }, [conv, user])

  const handleLongPress = (item) => {
    if (!selectionMode) {
      // First time long press, activate selection mode
      setSelectionMode(true);
      setSelectedMessages([item]);  // Select this message initially
    } else {
      // If already in selection mode, toggle selection of the message
      setSelectedMessages((prev) =>
        prev.some((msg) => msg._id === item._id)
          ? prev.filter((msg) => msg._id !== item._id)
          : [...prev, item]
      );
    }
  };

  const handleTapSelect = (item) => {
    if (selectionMode) {
      // If selection mode is on, toggle the selection of the tapped message
      setSelectedMessages((prev) =>
        prev.some((msg) => msg._id === item._id)
          ? prev.filter((msg) => msg._id !== item._id)
          : [...prev, item]
      );
    }
  };
  

  
  
    // Inside your component
    useEffect(() => {
      if (!user?._id) return;
      const loadMessages = async () => {
        const loadedMessages = await fetchMessages(chatId);
        
        setMessages(loadedMessages.map( msg => formatMessage(msg))); // assuming latest last
      };

      if (chatId) {
        loadMessages();
      }
  }, [chatId, user]);


  function formatMessage (message) {
 
    return {
      ...message,
      sender: message.senderId._id == user._id ? "me" :message.senderId["phone"],
      time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }

  const handleSend = () => {
    if (!inputText.trim()) return;
    const socket = getSocket();
    if (!user?._id || !socket) return;
  
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "delivered",
      replyTo: replyTo
        ? {
            id: replyTo._id,
            text: replyTo.text,
            sender: replyTo.sender,
          }
        : null,
    };

     // ✅ Emit to backend
     socket.emit("send-message", newMessage);
    
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setReplyTo(null);
  };
  
  const renderMessage = ({ item }) => {
    const isMe = item.sender === "me";
    return (
      <TouchableOpacity onLongPress={() => handleLongPress(item)} onPress={() => handleTapSelect(item)}>
      <View className="relative">
        <View className={`px-3 py-2 my-1 mx-2 rounded-xl ${isMe ? "bg-[#dcf8c6] self-end" : "bg-white self-start"}  max-w-[80%]`}>
          {item.replyTo && (
            <View className="border-l-4 border-green-500 pl-2 mb-1">
              <Text className="text-gray-500 text-xs font-medium">
                {item.replyTo.sender === "me" ? "You" :item.replyTo.sender}
              </Text>
              <Text className="text-gray-700 text-sm italic" numberOfLines={1}>
                {item.replyTo.text}
              </Text>
            </View>
          )}
          <Text className="text-[15px] text-black">{item.text}</Text>
          <View className="flex-row items-center justify-end mt-1">
            <Text className="text-[10px] text-gray-500 mr-1">{item.time}</Text>
            {isMe &&
              (item.status === "delivered" ? (
                <MaterialIcons name="done-all" size={14} color="#4fc3f7" />
              ) : (
                <MaterialIcons name="done" size={14} color="gray" />
              ))}
          </View>
        </View>
              {/* Transparent overlay if selected */}
        {selectedMessages.some((msg) => msg._id === item._id) && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-blue-500/20 " />
        )}
      </View>
    </TouchableOpacity>
    
    );
  };

  const resetSelection = () => {
    setSelectedMessages([]);
    setSelectionMode(false)
  }

  return (
    <>
      {/* Hide Tabs */}
      <Stack.Screen options={{ tabBarStyle: { display: "none" } }} />

      <View className="flex-1 bg-[#e5ddd5]">
        {/* Header */}
     {/* Default Header OR Action Bar */}
{selectedMessages.length > 0 ? (
  // Action Mode Header
  <View className="flex-row items-center px-3 py-2 bg-white">
    <TouchableOpacity onPress={resetSelection}>
      <Ionicons name="arrow-back" size={24} color="black" />
    </TouchableOpacity>
    <View className="flex-1 pl-4">
      <Text className="text-base font-semibold text-black">{selectedMessages.length} selected</Text>
    </View>
    {selectedMessages.length === 1 && (
  <TouchableOpacity
    className="mx-2"
    onPress={() => {
      setReplyTo(selectedMessages[0]);
      setSelectedMessages([]);  // Reset selected messages after replying
    }}
  >
    <Ionicons name="return-down-back" size={22} color="black" />
  </TouchableOpacity>
)}

<TouchableOpacity
  className="mx-2"
  onPress={() => {
    const selectedIds = selectedMessages.map((el) => el._id);
    setMessages((prev) => prev.filter((msg) => !selectedIds.includes(msg._id)));
    setSelectedMessages([]);
  }}
>
  <MaterialIcons name="delete" size={22} color="black" />
</TouchableOpacity>

    {/* Optional: Info icon */}
    {/* <TouchableOpacity className="mx-2">
      <Feather name="info" size={22} color="black" />
    </TouchableOpacity> */}
  </View>
) : (
  // Normal Chat Header
  <View className="flex-row items-center px-2 py-2 bg-white">
    <TouchableOpacity onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={24} color="black" />
    </TouchableOpacity>
    <Image
      source={{
        uri: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010",
      }}
      className="w-10 h-10 rounded-full mx-2"
    />
    <View className="flex-1">
      <Text className="text-black font-semibold text-[16px]">{otherParticipant && otherParticipant.phone}</Text>
      <Text className="text-gray-500 text-xs">online</Text>
    </View>
    <TouchableOpacity className="mx-1">
      <Ionicons name="videocam" size={22} color="black" />
    </TouchableOpacity>
    <TouchableOpacity className="mx-1">
      <Ionicons name="call" size={22} color="black" />
    </TouchableOpacity>
    <TouchableOpacity className="mx-1">
      <Feather name="more-vertical" size={22} color="black" />
    </TouchableOpacity>
  </View>
)}


        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-end', // Push messages to the bottom
            paddingBottom: 10, // Leave space for input
            paddingHorizontal: 10,
          }}
        />

      {replyTo && (
        <View className="flex-row items-center bg-white mx-4 px-3 py-2 rounded-t-xl border-l-4 border-green-600">
          <View className="flex-1">
            <Text className="text-xs text-gray-500">
              Replying to {replyTo.sender === "me" ? "You" : "Other"}
            </Text>
            <Text className="text-sm text-black" numberOfLines={1}>
              {replyTo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Ionicons name="close" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      )}

        {/* Message Input */}
        <View className="flex-row ">
          
          <View className="flex-1 justify-between flex-row bg-white items-center rounded-full my-3">
            <View className="flex-row flex-1 items-center p-2 gap-2">
              <TouchableOpacity >
                <Entypo name="emoji-happy" size={24} color="gray" />
              </TouchableOpacity>
              <TextInput
                placeholder="Message"
                placeholderTextColor="gray" 
                className="outline-none text-lg w-full"
                value={inputText}
                onChangeText={setInputText}
              />

            </View>
            <TouchableOpacity className="p-2">
              <Feather name="paperclip" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <Ionicons name="camera-outline" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center">
              {  !inputText.trim() ? <TouchableOpacity className="p-3 bg-green-600 rounded-full ml-1">
                <Ionicons name="mic" size={22} color="white" />
              </TouchableOpacity>
              :<TouchableOpacity className="p-3 bg-green-600 rounded-full ml-1" onPress={handleSend}>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>}
          </View>
        </View>
      </View>
    </>
  );
}
