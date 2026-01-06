import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PRIVACY_POINTS = [
  { key: "point1", icon: "lock-closed", color: "#8B5CF6" },
  { key: "point2", icon: "eye-off", color: "#10B981" },
  { key: "point3", icon: "trash", color: "#EF4444" },
] as const;

export default function PrivacyScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.progressBarActive]} />
        <View style={[styles.progressBar, styles.progressBarActive]} />
        <View style={[styles.progressBar, styles.progressBarActive]} />
        <View style={styles.progressBar} />
      </View>

      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </Pressable>

      {/* Header */}
      <View style={styles.headerCenter}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={40} color="#8B5CF6" />
        </View>
        <Text style={styles.title}>
          {t("onboarding.privacy.title")}
        </Text>
        <Text style={styles.subtitleCenter}>
          {t("onboarding.privacy.subtitle")}
        </Text>
      </View>

      {/* Privacy points */}
      <View style={styles.optionsContainer}>
        {PRIVACY_POINTS.map((point) => (
          <View key={point.key} style={styles.pointCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${point.color}20` }]}>
              <Ionicons
                name={point.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={point.color}
              />
            </View>
            <Text style={styles.pointText}>
              {t(`onboarding.privacy.${point.key}`)}
            </Text>
          </View>
        ))}
      </View>

      {/* Continue button */}
      <Pressable
        onPress={() => router.push("/(onboarding)/permissions")}
        style={styles.continueButton}
      >
        <Text style={styles.continueButtonText}>
          {t("common.continue")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#1A1A2E",
    borderRadius: 9999,
  },
  progressBarActive: {
    backgroundColor: "#8B5CF6",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginLeft: -8,
  },
  headerCenter: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconCircle: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleCenter: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  optionsContainer: {
    flex: 1,
  },
  pointCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#1A1A2E",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  pointText: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  continueButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
