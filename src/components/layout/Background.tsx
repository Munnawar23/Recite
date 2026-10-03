import { memo } from "react";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verticalScale } from "@/helpers/responsiveHelper";

// ── Star data ─────────────────────────────────────────────────────────────
const STARS = [
  { top: 0.04, left: 0.15, size: 1.4, opacity: 0.35 },
  { top: 0.08, left: 0.82, size: 2.0, opacity: 0.45 },
  { top: 0.18, left: 0.28, size: 1.2, opacity: 0.25 },
  { top: 0.24, left: 0.75, size: 1.5, opacity: 0.25 },
];

// ── Simple dot star ───────────────────────────────────────────────────────
const Star = memo(function Star({
  size,
  color,
  opacity,
}: {
  size: number;
  color: string;
  opacity: number;
}) {
  const s = size;
  return (
    <View
      style={{
        width: s * 7,
        height: s * 7,
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {/* Vertical */}
      <View
        style={{
          position: "absolute",
          width: s * 0.8,
          height: s * 7,
          borderRadius: s,
          backgroundColor: color,
        }}
      />
      {/* Horizontal */}
      <View
        style={{
          position: "absolute",
          width: s * 7,
          height: s * 0.8,
          borderRadius: s,
          backgroundColor: color,
        }}
      />
      {/* Diag 1 */}
      <View
        style={{
          position: "absolute",
          width: s * 5,
          height: s * 0.6,
          borderRadius: s,
          backgroundColor: color,
          transform: [{ rotate: "45deg" }],
        }}
      />
      {/* Diag 2 */}
      <View
        style={{
          position: "absolute",
          width: s * 5,
          height: s * 0.6,
          borderRadius: s,
          backgroundColor: color,
          transform: [{ rotate: "-45deg" }],
        }}
      />
      {/* Center dot */}
      <View
        style={{
          position: "absolute",
          width: s * 1.6,
          height: s * 1.6,
          borderRadius: s,
          backgroundColor: color,
        }}
      />
    </View>
  );
});

// ── Crescent moon ─────────────────────────────────────────────────────────
const CrescentMoon = memo(function CrescentMoon({ moonColor }: { moonColor: string }) {
  return (
    <View style={{ transform: [{ rotate: "-15deg" }] }}>
      <FontAwesome5 name="moon" solid size={34} color={moonColor} />
    </View>
  );
});

// ── Glowing dot (tiny sparkle) ────────────────────────────────────────────
const Sparkle = memo(function Sparkle({
  color,
  size,
  opacity,
}: {
  color: string;
  size: number;
  opacity: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        ...(Platform.OS === "ios"
          ? {
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: size,
            }
          : {
              elevation: 2,
            }),
      }}
    />
  );
});

// ── Geometric ring ────────────────────────────────────────────────────────
const Ring = memo(function Ring({
  radius,
  color,
  opacity,
  borderWidth = 1,
}: {
  radius: number;
  color: string;
  opacity: number;
  borderWidth?: number;
}) {
  return (
    <View
      style={{
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        borderWidth,
        borderColor: color,
        opacity,
      }}
    />
  );
});

function Background() {
  const { width, height } = useWindowDimensions();
  const { activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const insets = useSafeAreaInsets();

  // We add verticalScale(70) so that all decorative elements start below the Header component
  const top = insets.top + verticalScale(70);

  const starColor = isDark ? "#8C9BA5" : "#3A7D56";
  const moonColor = isDark ? "#D4A86A" : "#B8823D";
  const accentGlow = isDark ? "#D4A86A" : "#3A7D56";

  const gradientColors: [string, string, string] = isDark
    ? ["#121415", "#16191A", "#121415"]
    : ["#E8F2EA", "#F2E9DD", "#EDE4D4"];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* ── Base gradient ── */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top accent gradient removed */}



      {/* ── Crescent moon ── */}
      <View
        style={{
          position: "absolute",
          top: insets.top + height * 0.03,
          right: width * 0.08,
        }}
      >
        <CrescentMoon moonColor={moonColor} />
      </View>

      {/* ── 8-pointed star near moon ── */}
      <View
        style={{
          position: "absolute",
          top: top + height * 0.035,
          right: width * 0.26,
        }}
      >
        <Star size={2.2} color={starColor} opacity={0.7} />
      </View>

      {/* ── Stars scattered ── */}
      {STARS.map((s, i) => (
        <View
          key={`star-${s.top}-${s.left}-${i}`}
          style={{
            position: "absolute",
            top: top + s.top * height,
            left: s.left * width,
          }}
        >
          <Star size={s.size} color={starColor} opacity={s.opacity} />
        </View>
      ))}

      {/* ── Sparkle dot ── */}
      <View
        style={{
          position: "absolute",
          top: top + height * 0.07,
          left: width * 0.6,
        }}
      >
        <Sparkle color={starColor} size={2.5} opacity={0.3} />
      </View>

      {/* ── Concentric rings (top-right Islamic geometry) ── */}
      <View
        style={{
          position: "absolute",
          top: top - height * 0.01,
          right: -width * 0.08,
        }}
      >
        <Ring
          radius={width * 0.28}
          color={starColor}
          opacity={0.05}
          borderWidth={1}
        />
      </View>
      <View
        style={{
          position: "absolute",
          top: top - height * 0.01 + width * 0.1,
          right: -width * 0.18,
        }}
      >
        <Ring
          radius={width * 0.28}
          color={starColor}
          opacity={0.04}
          borderWidth={1}
        />
      </View>

      {/* ── Bottom-left decorative ring ── */}
      <View
        style={{
          position: "absolute",
          top: top + height * 0.28,
          left: -width * 0.25,
        }}
      >
        <Ring
          radius={width * 0.38}
          color={accentGlow}
          opacity={0.04}
          borderWidth={1.5}
        />
      </View>
    </View>
  );
}

export default memo(Background);

