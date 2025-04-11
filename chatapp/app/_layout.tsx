import { Stack } from "expo-router";
import { useEffect } from "react";
import { LogBox, Platform } from "react-native";

export default function Layout() {

 
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />  
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
}
