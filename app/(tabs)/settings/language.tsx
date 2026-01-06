import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuthStore, useProfile } from "@/src/features/auth/stores/authStore";
import i18n from "@/src/i18n";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const profile = useProfile();
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const handleSelect = async (code: string) => {
    await i18n.changeLanguage(code);
    await updateProfile({ language: code });
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t("settings.language")}
        </Text>
      </View>

      <View style={styles.content}>
        {LANGUAGES.map((lang) => {
          const isSelected = profile?.language === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => handleSelect(lang.code)}
              style={[
                styles.optionItem,
                isSelected ? styles.optionSelected : styles.optionDefault,
              ]}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={styles.label}>{lang.label}</Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionDefault: {
    backgroundColor: "#1A1A2E", // bg-dark-50
  },
  optionSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    borderWidth: 1,
    borderColor: "#8B5CF6", // border-primary
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  label: {
    color: "white",
    flex: 1,
    fontWeight: "500",
  },
});
