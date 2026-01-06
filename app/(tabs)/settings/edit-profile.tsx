import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore, useProfile } from "@/src/features/auth/stores/authStore";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert(t("common.error"), t("settings.editProfile.errorRequired"));
      return;
    }

    try {
      await updateProfile({
        display_name: displayName.trim(),
        username: username.trim() || null,
      });
      router.back();
    } catch (error) {
      Alert.alert(t("common.error"), t("settings.editProfile.errorUpdate"));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t("settings.editProfile.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Pressable style={{ position: "relative" }}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.changePhotoText}>
            {t("settings.editProfile.changePhoto")}
          </Text>
        </View>

        {/* Display name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("settings.editProfile.displayName")}</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t("settings.editProfile.namePlaceholder")}
            placeholderTextColor="#6B7280"
            style={styles.input}
          />
        </View>

        {/* Username */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("settings.editProfile.username")}</Text>
          <View style={styles.usernameInputContainer}>
            <Text style={styles.usernamePrefix}>@</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="pseudo"
              placeholderTextColor="#6B7280"
              autoCapitalize="none"
              style={styles.usernameInput}
            />
          </View>
        </View>

        {/* Communication preferences */}
        <View style={styles.preferencesContainer}>
          <Text style={styles.sectionTitle}>{t("settings.editProfile.preferences")}</Text>

          <View style={styles.preferenceCard}>
            <Text style={styles.preferenceLabel}>{t("settings.editProfile.mainGoal")}</Text>
            <Text style={styles.preferenceValue}>
              {profile?.main_goal === "dating"
                ? t("onboarding.goal.dating")
                : profile?.main_goal === "social"
                ? t("onboarding.goal.social")
                : profile?.main_goal === "professional"
                ? t("onboarding.goal.professional")
                : "Non défini"}
            </Text>
          </View>

          <View style={styles.preferenceCard}>
            <Text style={styles.preferenceLabel}>{t("settings.editProfile.style")}</Text>
            <Text style={styles.preferenceValue}>
              {profile?.communication_style === "playful"
                ? t("onboarding.style.playful")
                : profile?.communication_style === "direct"
                ? t("onboarding.style.direct")
                : profile?.communication_style === "empathetic"
                ? t("onboarding.style.empathetic")
                : "Non défini"}
            </Text>
          </View>
        </View>
      </View>

      {/* Save button */}
      <View style={styles.footer}>
        <Pressable onPress={handleSave} disabled={isLoading}>
          <LinearGradient
            colors={isLoading ? ["#4B5563", "#374151"] : ["#8B5CF6", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {t("common.save")}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    // paddingTop handled dynamically
    paddingTop: 16,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#8B5CF6", // text-primary
    fontSize: 36,
    fontWeight: "bold",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: "#8B5CF6", // bg-primary
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoText: {
    color: "#9CA3AF", // text-gray-400
    fontSize: 14,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#9CA3AF", // text-gray-400
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "white",
    fontSize: 16,
  },
  usernameInputContainer: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  usernamePrefix: {
    color: "#6B7280", // text-gray-500
  },
  usernameInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    color: "white",
    fontSize: 16,
  },
  preferencesContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#9CA3AF", // text-gray-400
    marginBottom: 16,
    fontSize: 14,
  },
  preferenceCard: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  preferenceLabel: {
    color: "white",
    fontWeight: "500",
    marginBottom: 4,
  },
  preferenceValue: {
    color: "#8B5CF6", // text-primary
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
