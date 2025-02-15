import React, { createContext, useContext, useState, useEffect } from "react";
import { setTheme, darkTheme, lightTheme } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("themeMode");
      const isDark = savedTheme === "dark";
      setIsDarkMode(isDark);
      setTheme(isDark);
    } catch (error) {
      console.warn("Error loading theme preference:", error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      await AsyncStorage.setItem("themeMode", newMode ? "dark" : "light");
      setIsDarkMode(newMode);
      setTheme(newMode);
    } catch (error) {
      console.warn("Error saving theme preference:", error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        theme: isDarkMode ? darkTheme : lightTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
