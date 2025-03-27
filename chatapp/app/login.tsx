import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("+91"); // Default country code
  const router = useRouter();

  // WhatsApp-style phone number validation
  const isValidNumber = /^\+\d{1,3}\s?\d{10}$/.test(phoneNumber);

  const handleNext = () => {
    if (!isValidNumber) {
      Alert.alert("Invalid Number", "Enter a valid phone number.");
      return;
    }
    router.push({ pathname: "/otp", params: { phone: phoneNumber } });
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      
      {/* Heading */}
      <Text className="text-3xl font-bold text-gray-900 mb-4">Enter Your Phone Number</Text>

      {/* Description */}
      <Text className="text-gray-500 text-lg text-center mb-6">
        WhatsApp will send an SMS to verify your number.
      </Text>

      {/* Phone Number Input */}
      <TextInput
        className="border border-gray-300 p-4 text-lg rounded-lg w-full text-center"
        placeholder="+91 9876543210"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      {/* Next Button */}
      <TouchableOpacity
        className={`p-4 w-full rounded-full mt-6 ${isValidNumber ? "bg-green-500" : "bg-gray-300"}`}
        disabled={!isValidNumber}
        onPress={handleNext}
      >
        <Text className="text-white text-center font-bold text-lg">Next</Text>
      </TouchableOpacity>
    </View>
  );
}
