import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export function Button({ onPress, title, style, textStyle, icon, iconPosition = "left", disabled }) {
  const { theme } = useTheme();

  const defaultButtonStyle = {
    backgroundColor: disabled ? theme.colors.disabled : theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    opacity: disabled ? 0.7 : 1,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
  };

  const defaultTextStyle = {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: icon && iconPosition === "left" ? theme.spacing.sm : 0,
    marginRight: icon && iconPosition === "right" ? theme.spacing.sm : 0,
  };

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <Ionicons
        name={icon}
        size={20}
        color={theme.colors.buttonText}
        style={{
          marginRight: iconPosition === "left" ? theme.spacing.sm : 0,
          marginLeft: iconPosition === "right" ? theme.spacing.sm : 0,
        }}
      />
    );
  };

  return (
    <TouchableOpacity 
      style={[defaultButtonStyle, style]} 
      onPress={onPress}
      disabled={disabled}
    >
      {iconPosition === "left" && renderIcon()}
      <Text style={[defaultTextStyle, textStyle]}>{title}</Text>
      {iconPosition === "right" && renderIcon()}
    </TouchableOpacity>
  );
}
