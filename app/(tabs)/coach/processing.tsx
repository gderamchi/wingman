import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { useAnalysisStore } from "@/src/features/analysis/stores/analysisStore";

export default function ProcessingScreen() {
  const { t } = useTranslation();

  const screenshotUri = useAnalysisStore((s) => s.screenshotUri);
  const startAnalysis = useAnalysisStore((s) => s.startAnalysis);
  const currentStep = useAnalysisStore((s) => s.currentStep);
  const progress = useAnalysisStore((s) => s.progress);
  const progressMessage = useAnalysisStore((s) => s.progressMessage);
  const error = useAnalysisStore((s) => s.error);

  // Animation for the pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start analysis
    const runAnalysis = async () => {
      if (!screenshotUri) {
        router.replace("/(tabs)");
        return;
      }

      try {
        // Read image as base64
        const base64 = await FileSystem.readAsStringAsync(screenshotUri, {
          encoding: "base64",
        });

        // Start analysis
        await startAnalysis(`data:image/jpeg;base64,${base64}`);
      } catch (err) {
        console.error("Failed to read image:", err);
      }
    };

    runAnalysis();
  }, []);

  // Navigate when complete
  useEffect(() => {
    if (currentStep === "complete") {
      router.replace("/(tabs)/coach/results");
    } else if (currentStep === "error") {
      // Could show error and go back
      router.back();
    }
  }, [currentStep]);

  return (
    <View style={styles.container}>
      {/* Animated circle */}
      <Animated.View
        style={[
          styles.pulseCircle,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <View style={styles.innerCircleMedium}>
          <View style={styles.innerCircleSmall}>
            <Text style={styles.brainEmoji}>🧠</Text>
          </View>
        </View>
      </Animated.View>

      {/* Title */}
      <Text style={styles.title}>
        {t("coach.processing.title")}
      </Text>

      {/* Progress message */}
      <Text style={styles.message}>
        {progressMessage}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progress}%` }
          ]}
        />
      </View>

      {/* Progress steps */}
      <View style={styles.stepsContainer}>
        <ProgressStep
          label={t("coach.processing.step1")}
          isActive={progress >= 0}
          isComplete={progress >= 30}
        />
        <ProgressStep
          label={t("coach.processing.step2")}
          isActive={progress >= 30}
          isComplete={progress >= 60}
        />
        <ProgressStep
          label={t("coach.processing.step3")}
          isActive={progress >= 60}
          isComplete={progress >= 100}
        />
      </View>
    </View>
  );
}

function ProgressStep({
  label,
  isActive,
  isComplete,
}: {
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <View style={styles.stepRow}>
      <View
        style={[
          styles.stepDot,
          isComplete
            ? styles.dotComplete
            : isActive
            ? styles.dotActive
            : styles.dotInactive
        ]}
      >
        {isComplete && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text
        style={isActive || isComplete ? styles.stepLabelActive : styles.stepLabelInactive}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  pulseCircle: {
    width: 128,
    height: 128,
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  innerCircleMedium: {
    width: 96,
    height: 96,
    backgroundColor: "rgba(139, 92, 246, 0.3)", // bg-primary/30
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircleSmall: {
    width: 64,
    height: 64,
    backgroundColor: "#8B5CF6", // bg-primary
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  brainEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    color: "#9CA3AF", // text-gray-400
    textAlign: "center",
    marginBottom: 32,
  },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#8B5CF6", // bg-primary
    borderRadius: 4,
  },
  stepsContainer: {
    marginTop: 32,
    width: "100%",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dotComplete: {
    backgroundColor: "#10B981", // bg-success
  },
  dotActive: {
    backgroundColor: "#8B5CF6", // bg-primary
  },
  dotInactive: {
    backgroundColor: "#1A1A2E", // bg-dark-50
  },
  checkmark: {
    color: "white",
    fontSize: 12,
  },
  stepLabelActive: {
    color: "white",
  },
  stepLabelInactive: {
    color: "#6B7280", // text-gray-500
  },
});
