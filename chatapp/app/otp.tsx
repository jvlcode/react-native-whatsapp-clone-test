import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams(); // Get phone number from login screen
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [generatedOtp, setGeneratedOtp] = useState("");

  // 🔹 Generate OTP (6-digit random)
  const generateRandomOTP = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    console.log("Generated OTP:", randomOtp); // Debugging
  };

  // ⏳ Generate OTP & Start Timer on Screen Load
  useEffect(() => {
    generateRandomOTP();
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Verify OTP
  const handleVerify = () => {
    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    if (otp !== generatedOtp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }

    Alert.alert("✅ OTP Verified!", "You can now access the app.");
    router.push({ pathname: "/profile-setup", params: { phone } });
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      {/* Title */}
      <Text className="text-3xl font-bold text-gray-900 mb-4">Enter OTP</Text>

      {/* Description */}
      <Text className="text-gray-500 text-lg text-center mb-6">
        A 6-digit code has been sent to {phone} ({generatedOtp}).
      </Text>

      {/* OTP Input */}
      <TextInput
        className="border border-gray-300 p-4 text-lg rounded-lg text-center w-3/4"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />

      {/* Error Message */}
      {error ? <Text className="text-red-500 mt-3">{error}</Text> : null}

      {/* Verify Button */}
      <TouchableOpacity
        className={`p-4 w-full rounded-full mt-6 ${otp.length === 6 ? "bg-green-500" : "bg-gray-300"}`}
        disabled={otp.length !== 6}
        onPress={handleVerify}
      >
        <Text className="text-white text-center font-bold text-lg">Verify</Text>
      </TouchableOpacity>

      {/* Change Number */}
      <TouchableOpacity className="mt-4" onPress={() => router.push("/login")}>
        <Text className="text-blue-500 text-lg">Change Number</Text>
      </TouchableOpacity>

      {/* 🔄 Resend OTP Button */}
      <TouchableOpacity
        className="mt-3"
        disabled={timer > 0}
        onPress={() => {
          setTimer(30);
          generateRandomOTP();
        }}
      >
        <Text className={`text-lg ${timer > 0 ? "text-gray-400" : "text-blue-500"}`}>
          {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
