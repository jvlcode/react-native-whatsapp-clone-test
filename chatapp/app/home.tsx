import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import "../assets/global.css"
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const router = useRouter();
  const logout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/");
  };
  return (
    <View className="flex-1 bg-white items-center justify-center p-5">
        
      <TouchableOpacity onPress={logout} className="bg-red-500 p-4 rounded-lg">
        <Text className="text-white text-center font-bold text-lg">Logout</Text>
        </TouchableOpacity>
    </View>
  );
}
