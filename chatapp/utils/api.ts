// app/api.js
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
 // Replace with your backend URL

export const fetchMessages = async (chatId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${chatId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};
