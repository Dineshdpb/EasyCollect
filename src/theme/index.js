export const lightTheme = {
  dark: false,
  colors: {
    primary: "#007AFF",
    background: "#F2F2F7",
    surface: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
    error: "#FF3B30",
    success: "#34C759",
    warning: "#FFCC00",
    buttonText: "#FFFFFF",
    border: "#E5E5EA",
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
  dark: true,
  colors: {
    primary: "#0A84FF",
    background: "#000000",
    surface: "#1C1C1E",
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    error: "#FF453A",
    success: "#32D74B",
    warning: "#FFD60A",
    buttonText: "#FFFFFF",
    border: "#38383A",
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
