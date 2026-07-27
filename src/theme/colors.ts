export const lightColors = {
  background: "#F2E9DD", // Soft warm beige
  card: "#FAF4EC", // Lighter warm beige for cards
  text: "#2C1F0E", // Soft dark warm brown
  subtext: "#6B5A47", // Medium warm brown for clear secondary text
  primary: "#3F7A5C", // Slightly lighter, elegant green matching warm background
  accent: "#B8823D", // Rich warm gold
  border: "#E3D5C1", // Soft border color matching the beige base
  gradient: ["#4E9B6F", "#3A7D56", "#2B5E40"] as [string, string, string],
  cardGradient: ["#3F7A5C", "#2D5A43"] as [string, string],
  splashText: "#FFFFFF",
  splashSubtext: "rgba(255, 255, 255, 0.85)",
};

export const darkColors = {
  background: "#102218", // Slightly darker soft green background
  card: "#182E22", // Matching card color
  text: "#E8DFD0", // Warm cream text
  subtext: "#A9B8AE", // Muted sage subtext
  primary: "#4DBF8A", // Mint green primary
  accent: "#E8B84B", // Warm yellow accent
  border: "#203A2B", // Matching border
  gradient: ["#1B5E3B", "#14402A", "#0C2A1B"] as [string, string, string],
  cardGradient: ["#1B5E3B", "#114028"] as [string, string],
  splashText: "#FFFFFF",
  splashSubtext: "rgba(255, 255, 255, 0.85)",
};

export type ThemeColors = typeof lightColors;
