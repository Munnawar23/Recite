export const lightColors = {
  background: "#F5F1EA", // Soft paper warm parchment
  card: "#FFFFFF", // Clean crisp card background
  text: "#1E293B", // Soft slate charcoal (relaxed & modern reading)
  subtext: "#475569", // Darker slate gray for crisp, highly legible subtext
  primary: "#4B8566", // Lighter soft sage green
  quranVerse: "#355E46", // Softer, lighter sage-forest green for relaxed reading
  accent: "#B8823D", // Rich warm gold
  border: "#E2DCD2", // Soft subtle parchment border
  gradient: ["#4E9B6F", "#3A7D56", "#2B5E40"] as [string, string, string],
  cardGradient: ["#3F7A5C", "#2D5A43"] as [string, string],
  hijriCardGradient: ["#059669", "#065F46"] as [string, string],
  hijriCardAccent: "#FFD98E",
  dailyVerseGradient: ["rgba(184, 130, 61, 0.07)", "rgba(184, 130, 61, 0.00)"] as [string, string],
  continueReadingCardGradient: ["#4E9B6F", "#3A7D56", "#2B5E40"] as [string, string, string],
  splashGradient: ["#2B6143", "#1F4831", "#143121"] as [string, string, string],
  splashText: "#FFFFFF",
  splashSubtext: "rgba(255, 255, 255, 0.95)",
};

export const darkColors = {
  background: "#121415", // Sleek dark charcoal background
  card: "#192223", // Dark slate green card container
  text: "#E6ECEF", // Soft off-white (replaces harsh pure #FFF)
  subtext: "#BDCBDB", // Bright crisp slate for clear subtext in dark mode
  primary: "#D4A86A", // Warm gold primary action/icon color
  quranVerse: "#E4B87C", // Muted Warm Soft Amber (gentle on eyes in dark mode)
  accent: "#D4A86A", // Rich warm gold accent
  border: "#1E2B2C", // Dark subtle border
  gradient: ["#1F2E2F", "#192425", "#141C1D"] as [string, string, string],
  cardGradient: ["#1F2E2F", "#162021"] as [string, string],
  hijriCardGradient: ["#134E4A", "#042F2E"] as [string, string],
  hijriCardAccent: "#FFD98E",
  dailyVerseGradient: ["rgba(212, 168, 106, 0.08)", "rgba(212, 168, 106, 0.00)"] as [string, string],
  continueReadingCardGradient: ["#1F2E2F", "#192425", "#141C1D"] as [string, string, string],
  splashGradient: ["#245239", "#193B28", "#10281A"] as [string, string, string],
  splashText: "#FFFFFF",
  splashSubtext: "rgba(255, 255, 255, 0.85)",
};

export type ThemeColors = typeof lightColors;
