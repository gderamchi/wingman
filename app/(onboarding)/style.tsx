import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "@/src/features/auth/stores/authStore";

const STYLES = [
  { id: "playful", icon: "sparkles", color: "#F59E0B" },
  { id: "direct", icon: "flash", color: "#EF4444" },
] as const;

export default function StyleScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const handleContinue = async () => {
    if (!selected) return;

    try {
      await updateProfile({ communication_style: selected });
      router.push("/(onboarding)/privacy");
    } catch (error) {
      console.error("Failed to update profile:", error);
      router.push("/(onboarding)/privacy");
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.progressBarActive]} />
        <View style={[styles.progressBar, styles.progressBarActive]} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
      </View>

      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t("onboarding.style.title")}
        </Text>
        <Text style={styles.subtitle}>
          {t("onboarding.style.subtitle")}
        </Text>
      </View>

      {/* Style options */}
      <View style={styles.optionsContainer}>
        {STYLES.map((style) => (
          <Pressable
            key={style.id}
            onPress={() => setSelected(style.id)}
            style={[
              styles.optionButton,
              selected === style.id && styles.optionButtonSelected,
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${style.color}20` }]}>
              <Ionicons
                name={style.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={style.color}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>
                {t(`onboarding.style.${style.id}`)}
              </Text>
              <Text style={styles.optionDesc}>
                {t(`onboarding.style.${style.id}Desc`)}
              </Text>
            </View>
            {selected === style.id && (
              <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
            )}
          </Pressable>
        ))}
      </View>

      {/* Continue button */}
      <Pressable
        onPress={handleContinue}
        disabled={!selected}
        style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
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
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#1A1A2E",
  },
  optionButtonSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "#8B5CF6",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  optionDesc: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  continueButtonDisabled: {
    backgroundColor: "#374151",
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
