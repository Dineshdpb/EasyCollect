export const lightTheme = {
  colors: {
    background: "#FFFFFF",
    surface: "#F5F5F5",
    primary: "#007AFF",
    success: "#34C759",
    error: "#FF3B30",
    warning: "#FF9500",
    text: "#000000",
    textSecondary: "#666666",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const darkTheme = {
  colors: {
    background: "#1a1a1a",
    surface: "#2c2c2c",
    primary: "#0A84FF",
    success: "#32D74B",
    error: "#FF453A",
    warning: "#FF9F0A",
    text: "#FFFFFF",
    textSecondary: "#ABABAB",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export let theme = darkTheme; // default theme

export const setTheme = (isDark) => {
  theme = isDark ? darkTheme : lightTheme;
};
