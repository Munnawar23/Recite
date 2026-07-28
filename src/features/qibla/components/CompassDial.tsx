import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { scale, verticalScale } from "react-native-size-matters";
import Svg, {
  Circle,
  G,
  Line,
  Polygon,
  Text as SvgText,
} from "react-native-svg";

interface CompassDialProps {
  rotation: SharedValue<number>;
  qiblaAngle: number;
}

const SIZE = scale(300);
const CENTER = SIZE / 2;
const OUTER_R = CENTER - scale(10);
const INNER_R = OUTER_R - scale(32);

export default function CompassDial({
  rotation,
  qiblaAngle,
}: CompassDialProps) {
  const { colors, fontFamily } = useAppTheme();
  const isAligned = useSharedValue(false);

  useAnimatedReaction(
    () => rotation.value,
    (currentRotation) => {
      const screenAngle = (((-currentRotation + qiblaAngle) % 360) + 360) % 360;
      const aligned = screenAngle < 3 || screenAngle > 357;

      if (aligned !== isAligned.value) {
        isAligned.value = aligned;
        if (aligned) runOnJS(Haptics.success)();
      }
    },
  );

  // Pure GPU 120 FPS transform rotation
  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rotation.value}deg` }],
  }));

  // Memoized vector ticks (every 5° with major/mid highlights)
  const ticks = useMemo(() => {
    return Array.from({ length: 72 }).map((_, i) => {
      const deg = i * 5;
      const isCard = deg % 90 === 0;
      const isMajor = deg % 30 === 0 && !isCard;
      const isMid = deg % 10 === 0 && !isMajor && !isCard;

      const len = isCard ? scale(12) : isMajor ? scale(9) : isMid ? scale(6) : scale(4);
      const strokeWidth = isCard ? 2.5 : isMajor ? 1.8 : 1;
      const rad = (deg * Math.PI) / 180;

      const x1 = CENTER + OUTER_R * Math.sin(rad);
      const y1 = CENTER - OUTER_R * Math.cos(rad);
      const x2 = CENTER + (OUTER_R - len) * Math.sin(rad);
      const y2 = CENTER - (OUTER_R - len) * Math.cos(rad);

      let stroke = colors.border;
      if (deg === 0) stroke = colors.accent;
      else if (isCard) stroke = colors.text;

      return (
        <Line
          key={deg}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={isCard || isMajor ? 0.9 : 0.4}
        />
      );
    });
  }, [colors.border, colors.accent, colors.text]);

  // Cardinal labels & degree numbers
  const markings = useMemo(() => {
    const cardinals = [
      { label: "N", deg: 0, color: colors.accent },
      { label: "E", deg: 90, color: colors.accent },
      { label: "S", deg: 180, color: colors.accent },
      { label: "W", deg: 270, color: colors.accent },
    ];

    const degrees = [30, 60, 120, 150, 210, 240, 300, 330];

    return (
      <G>
        {cardinals.map(({ label, deg, color }) => {
          const rad = (deg * Math.PI) / 180;
          const r = OUTER_R - scale(20);
          const x = CENTER + r * Math.sin(rad);
          const y = CENTER - r * Math.cos(rad);

          return (
            <SvgText
              key={label}
              x={x}
              y={y}
              fill={color}
              fontSize={scale(17)}
              fontWeight="800"
              fontFamily={fontFamily.title}
              textAnchor="middle"
              alignmentBaseline="central"
            >
              {label}
            </SvgText>
          );
        })}

        {degrees.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const r = OUTER_R - scale(18);
          const x = CENTER + r * Math.sin(rad);
          const y = CENTER - r * Math.cos(rad);

          return (
            <SvgText
              key={deg}
              x={x}
              y={y}
              fill={colors.subtext}
              fontSize={scale(10)}
              fontWeight="600"
              fontFamily={fontFamily.text}
              textAnchor="middle"
              alignmentBaseline="central"
              opacity={0.7}
            >
              {deg}°
            </SvgText>
          );
        })}
      </G>
    );
  }, [colors.accent, colors.text, colors.subtext, fontFamily]);

  // Qibla marker position calculations
  const qiblaRad = (qiblaAngle * Math.PI) / 180;
  const qiblaR = INNER_R + scale(12);
  const qiblaX = CENTER + qiblaR * Math.sin(qiblaRad);
  const qiblaY = CENTER - qiblaR * Math.cos(qiblaRad);

  return (
    <View style={styles.container}>
      {/* Modern Top Arrow Needle Indicator */}
      <View style={styles.pointerWrap}>
        <Svg width={scale(24)} height={scale(26)}>
          <Polygon
            points="12,2 20,24 12,19 4,24"
            fill={colors.primary}
          />
        </Svg>
      </View>

      {/* Rotating Dial */}
      <Animated.View style={dialStyle}>
        <Svg width={SIZE} height={SIZE}>
          {/* Dual-Tone Bezel Outer Ring */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={OUTER_R + scale(4)}
            fill={colors.card}
            stroke={colors.border}
            strokeWidth={1.5}
          />
          {/* Inner Dial Face */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={OUTER_R - scale(2)}
            fill={colors.card}
            stroke={colors.border}
            strokeWidth={1}
          />
          {/* Inner Decorative Dashed Ring */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={INNER_R}
            fill="none"
            stroke={colors.primary}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.35}
          />

          {/* Ticks & Text markings */}
          {ticks}
          {markings}

          {/* Qibla Direction Line from center to marker */}
          <Line
            x1={CENTER}
            y1={CENTER}
            x2={qiblaX}
            y2={qiblaY}
            stroke={colors.primary}
            strokeWidth={2}
            strokeDasharray="4,4"
            opacity={0.8}
          />

          {/* Kaaba Emoji Badge Marker */}
          <G
            transform={`translate(${qiblaX - scale(16)}, ${qiblaY - scale(16)}) rotate(${qiblaAngle}, ${scale(16)}, ${scale(16)})`}
          >
            <Circle
              cx={scale(16)}
              cy={scale(16)}
              r={scale(15)}
              fill={colors.card}
              stroke={colors.primary}
              strokeWidth={2}
            />
            <SvgText
              x={scale(16)}
              y={scale(14)}
              fontSize={scale(18)}
              textAnchor="middle"
              alignmentBaseline="central"
            >
              🕋
            </SvgText>
          </G>

          {/* Center pivot needle pin */}
          <Circle cx={CENTER} cy={CENTER} r={scale(6)} fill={colors.primary} />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={scale(12)}
            fill="none"
            stroke={colors.primary}
            strokeWidth={1.5}
            opacity={0.4}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: SIZE,
    height: SIZE,
    marginVertical: verticalScale(16),
  },
  pointerWrap: {
    position: "absolute",
    top: -scale(16),
    zIndex: 10,
  },
});
