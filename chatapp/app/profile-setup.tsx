import { useState, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, ActivityIndicator, Alert,BackHandler  } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || "http://192.168.180.155:5000/api";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch user profile from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log(`${API_BASE_URL}/users/${phone}`);
        const response = await axios.get(`${API_BASE_URL}/users/${phone}`);

        if (response.data) {
          setUserId(response.data._id);
          setName(response.data.name || "");
          setProfileImage(response.data.profileImage || null);
        }
      } catch (error) {
        console.log("No existing user found. Proceeding with profile creation.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [phone]);

  // Pick an image from the gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

// Redirect user to welcome screen if they try to go back
useEffect(() => {
  const handleBackPress = () => {
    router.replace("/"); // Force redirect to Welcome
    return true; // Prevent default back action
  };

  // Listen for Android back button
  BackHandler.addEventListener("hardwareBackPress", handleBackPress);

  return () => {
    BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  };
}, []);

  // Save or Update Profile
  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your name before proceeding.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("name", name);

      if (profileImage && profileImage.startsWith("file://")) {
        formData.append("profileImage", {
          uri: profileImage,
          type: "image/jpeg",
          name: "profile.jpg",
        });
      }

      let response;
      if (userId) {
        response = await axios.put(`${API_BASE_URL}/users/${userId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axios.post(`${API_BASE_URL}/users`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data) {
        await AsyncStorage.setItem("user", JSON.stringify(response.data));
        router.replace("/chats");
      } else {
        Alert.alert("Error", "Something went wrong while saving your profile.");
      }
    } catch (error) {
      console.error("Error saving profile:", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="green" className="flex-1 justify-center" />;

  return (
    <View className="flex-1 bg-white p-6 items-center">
      <Text className="text-3xl font-bold mb-4">Set Up Your Profile</Text>

      {/* Profile Image */}
      <TouchableOpacity onPress={pickImage} className="mb-6">
        {profileImage ? (
          <Image source={{ uri: profileImage }} className="w-32 h-32 rounded-full border-2 border-gray-300" />
        ) : (
          <View className="w-32 h-32 bg-gray-200 rounded-full justify-center items-center border-2 border-gray-400">
            <Text className="text-gray-500">Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Name Input */}
      <TextInput
        className="border border-gray-300 rounded-lg p-4 w-full text-lg mb-4"
        placeholder="Enter Your Name"
        value={name}
        onChangeText={setName}
      />

      {/* Save Button */}
      <TouchableOpacity
        className={`p-4 w-full rounded-full ${saving ? "bg-gray-300" : "bg-green-500"}`}
        onPress={saveProfile}
        disabled={saving}
      >
        <Text className="text-white text-center font-bold text-lg">{saving ? "Saving..." : "Save & Continue"}</Text>
      </TouchableOpacity>
    </View>
  );
}

