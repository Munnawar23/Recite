import { useOnboardingStore } from "@/store/onboardingStore";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppLanguageStep } from "../components/AppLanguageStep";
import { LocationStep } from "../components/LocationStep";
import { NotificationStep } from "../components/NotificationStep";
import { ThemeStep } from "../components/ThemeStep";
import { Translation } from "../components/Translation";

export default function OnboardingScreen() {
  const router = useRouter();
  const { setHasCompletedOnboarding } = useOnboardingStore();
  const [step, setStep] = useState(1);

  const finish = () => {
    setHasCompletedOnboarding(true);
    router.replace("/(tabs)/home" as Href);
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(1, s - 1));

  return (
    <View style={styles.container}>
      {step === 1 && <AppLanguageStep onNext={next} />}
      {step === 2 && <Translation onNext={next} onBack={back} />}
      {step === 3 && <ThemeStep onNext={next} onBack={back} />}
      {step === 4 && <NotificationStep onNext={next} onBack={back} />}
      {step === 5 && <LocationStep onFinish={finish} onBack={back} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
