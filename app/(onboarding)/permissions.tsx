import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PermissionsScreen() {
  const { t } = useTranslation();

  const handleEnableNotifications = async () => {
    // Notifications disabled due to missing entitlements on Personal Team
    router.push("/(onboarding)/paywall");
  };

  const handleSkip = () => {
    router.push("/(onboarding)/paywall");
  };

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.progressBarActive]} />
        <View style={[styles.progressBar, styles.progressBarActive]} />
        <View style={[styles.progressBar, styles.progressBarActive]} />
        <View style={[styles.progressBar, styles.progressBarActive]} />
      </View>

      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </Pressable>

      {/* Content */}
      <View style={styles.contentCenter}>
        {/* Notification icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="notifications" size={60} color="#8B5CF6" />
        </View>

        {/* Header */}
        <Text style={styles.title}>
          {t("onboarding.permissions.title")}
        </Text>
        <Text style={styles.subtitle}>
          {t("onboarding.permissions.subtitle")}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable onPress={handleEnableNotifications} style={styles.enableButton}>
          <Text style={styles.enableButtonText}>
            {t("onboarding.permissions.enable")}
          </Text>
        </Pressable>

        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>
            {t("onboarding.permissions.skip")}
          </Text>
        </Pressable>
      </View>
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
  contentCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 128,
    height: 128,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  buttonsContainer: {
    marginBottom: 32,
  },
  enableButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  enableButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  skipButton: {
    paddingVertical: 16,
  },
  skipButtonText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
  },
});
