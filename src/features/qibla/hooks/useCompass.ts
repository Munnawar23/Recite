import {
  SensorType,
  useAnimatedReaction,
  useAnimatedSensor,
  useSharedValue,
} from "react-native-reanimated";

const ALPHA_STILL = 0.95;
const ALPHA_MOVING = 0.995;

// Angular speed (°/s) at which α fully saturates to ALPHA_MOVING.
// Below this, α interpolates linearly between STILL and MOVING.
const SPEED_THRESHOLD = 50; // °/s — a moderately fast hand rotation

// Gyro deadband — ignore sub-threshold noise when near-stationary.
// Prevents micro-drift when the phone sits on a table.
const GYRO_DEADBAND = 0.3; // °/s

export function useCompass() {
  // ── Sensor streams (both on the UI thread at max device rate) ──────
  const rotationSensor = useAnimatedSensor(SensorType.ROTATION, {
    interval: 0,
  });
  const gyroSensor = useAnimatedSensor(SensorType.GYROSCOPE, {
    interval: 0,
  });

  // ── Output ─────────────────────────────────────────────────────────
  const rotation = useSharedValue(0); // continuous unwrapped heading, degrees

  // ── Internal state (all shared values → worklet-accessible) ───────
  const initialized = useSharedValue(false);
  const prevTime = useSharedValue(0);
  const gyroPredicted = useSharedValue(0); // gyro-integrated heading (unwrapped)
  const fusedHeading = useSharedValue(0); // complementary output (unwrapped)
  const prevMagUnwrapped = useSharedValue(0); // unwrapped magnetometer heading

  useAnimatedReaction(
    () => ({
      yaw: rotationSensor.sensor.value.yaw,
      gz: gyroSensor.sensor.value.z,
    }),
    ({ yaw, gz }) => {
      // ── Convert magnetometer yaw → 0-360 heading ─────────────────
      let magHeading = (-yaw * 180) / Math.PI;
      magHeading = ((magHeading % 360) + 360) % 360;

      const now = performance.now() / 1000; // seconds

      // ── First sample: seed everything and bail ────────────────────
      if (!initialized.value) {
        fusedHeading.value = magHeading;
        gyroPredicted.value = magHeading;
        prevMagUnwrapped.value = magHeading;
        prevTime.value = now;
        rotation.value = magHeading;
        initialized.value = true;
        return;
      }

      // ── Time delta ────────────────────────────────────────────────
      let dt = now - prevTime.value;
      if (dt <= 0 || dt > 0.5) dt = 1 / 60; // guard against stalls/resume
      prevTime.value = now;

      // ── Unwrap magnetometer so the filter sees a continuous signal ─
      let magDiff = magHeading - (((prevMagUnwrapped.value % 360) + 360) % 360);
      if (magDiff < -180) magDiff += 360;
      if (magDiff > 180) magDiff -= 360;
      const magUnwrapped = prevMagUnwrapped.value + magDiff;
      prevMagUnwrapped.value = magUnwrapped;

      let gyroRate = -gz * (180 / Math.PI); // convert rad/s → °/s

      // Deadband: zero out sub-threshold noise
      if (Math.abs(gyroRate) < GYRO_DEADBAND) {
        gyroRate = 0;
      }

      const gyroDelta = gyroRate * dt;
      const gyroPred = fusedHeading.value + gyroDelta;
      gyroPredicted.value = gyroPred;

      // ── Adaptive alpha ────────────────────────────────────────────
      const speed = Math.abs(gyroRate);
      const t = Math.min(speed / SPEED_THRESHOLD, 1); // 0..1
      const alpha = ALPHA_STILL + t * (ALPHA_MOVING - ALPHA_STILL);

      // ── Complementary fusion ──────────────────────────────────────
      // Unwrap the mag reference relative to gyro prediction so we
      // interpolate across the shortest arc.
      let correction = magUnwrapped - gyroPred;
      if (correction < -180) correction += 360;
      if (correction > 180) correction -= 360;

      const fused = gyroPred + (1 - alpha) * correction;
      fusedHeading.value = fused;

      // ── Publish ───────────────────────────────────────────────────
      rotation.value = fused;
    },
  );

  return rotation;
}
