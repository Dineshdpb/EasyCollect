import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export function Button({ onPress, title, style, textStyle }) {
  const { theme } = useTheme();

  const defaultButtonStyle = {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  };

  const defaultTextStyle = {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  };

  return (
    <TouchableOpacity style={[defaultButtonStyle, style]} onPress={onPress}>
      <Text style={[defaultTextStyle, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}
