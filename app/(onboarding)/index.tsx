import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { changeLanguage, getCurrentLanguage } from "@/src/i18n";

const LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
] as const;

export default function LanguageScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<"fr" | "en">(getCurrentLanguage());

  const handleContinue = () => {
    changeLanguage(selected);
    router.push("/(onboarding)/goal");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t("onboarding.language.title")}
        </Text>
        <Text style={styles.subtitle}>
          {t("onboarding.language.subtitle")}
        </Text>
      </View>

      {/* Language options */}
      <View style={styles.optionsContainer}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.code}
            onPress={() => setSelected(lang.code)}
            style={[
              styles.optionButton,
              selected === lang.code && styles.optionButtonSelected,
            ]}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text style={styles.optionText}>{lang.name}</Text>
            {selected === lang.code && (
              <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
            )}
          </Pressable>
        ))}
      </View>

      {/* Continue button */}
      <Pressable onPress={handleContinue} style={styles.continueButton}>
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
    padding: 16,
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
  flag: {
    fontSize: 30,
    marginRight: 16,
  },
  optionText: {
    color: "white",
    fontSize: 18,
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
