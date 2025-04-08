import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔐 Keys
const USER_KEY = "user";

// ✅ Save any value (auto stringified)
export const saveToStorage = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`❌ Error saving to storage [${key}]:`, error);
  }
};

// 🧹 Remove a key
export const removeFromStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`❌ Error removing from storage [${key}]:`, error);
  }
};

// 📦 Get and parse
export const getFromStorage = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`❌ Error reading from storage [${key}]:`, error);
    return null;
  }
};

// 🔐 Specific helpers for user
export const saveUser = async (user: any) => saveToStorage(USER_KEY, user);
export const getUser = async () => getFromStorage(USER_KEY);
export const removeUser = async () => removeFromStorage(USER_KEY);
