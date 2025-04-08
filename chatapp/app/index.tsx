import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          router.replace("/chats"); // ✅ Redirect to home if user exists
        }
      } catch (error) {
        console.error("Error reading AsyncStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="green" className="flex-1 justify-center" />;

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      
      {/* WhatsApp Logo */}
      <View style={{ width: 100, height: 100, marginBottom: 40 }}>
  <Image
    source={require("../assets/images/WhatsApp_Logo_green.svg.png")}
    style={{ width: "100%", height: "100%", objectFit: "contain" }}
    resizeMode="contain"
  />
</View>


      {/* Welcome Text */}
      <Text className="text-3xl font-bold text-gray-900 mb-4 text-center">Welcome to WhatsApp</Text>

      {/* Privacy & Terms Notice */}
      <Text className="text-gray-500 text-lg text-center mb-8">
        Read our <Text className="text-blue-500">Privacy Policy</Text>. Tap "Agree & Continue" to accept the{" "}
        <Text className="text-blue-500">Terms of Service</Text>.
      </Text>

      {/* Agree & Continue Button */}
      <TouchableOpacity className="bg-green-500 px-6 py-4 rounded-full w-full" onPress={() => router.push("/login")}>
        <Text className="text-white text-center font-bold text-lg">Agree & Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
