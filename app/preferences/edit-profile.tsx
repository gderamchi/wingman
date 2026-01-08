import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
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
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url ?? null);
  const [mainGoal, setMainGoal] = useState(profile?.main_goal ?? "");
  const [communicationStyle, setCommunicationStyle] = useState(profile?.communication_style ?? "");

  const handleChangePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t("common.error"), "Permission to access photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
      // TODO: Upload to storage and update profile
    }
  };

  const handleChangeGoal = () => {
    Alert.alert(
      t("settings.editProfile.mainGoal"),
      t("settings.editProfile.selectGoal", "Choisissez votre objectif"),
      [
        { text: t("onboarding.goal.dating"), onPress: () => setMainGoal("dating") },
        { text: t("onboarding.goal.social"), onPress: () => setMainGoal("social") },
        { text: t("onboarding.goal.professional"), onPress: () => setMainGoal("professional") },
        { text: t("common.cancel"), style: "cancel" },
      ]
    );
  };

  const handleChangeStyle = () => {
    Alert.alert(
      t("settings.editProfile.style"),
      t("settings.editProfile.selectStyle", "Choisissez votre style"),
      [
        { text: t("onboarding.style.playful"), onPress: () => setCommunicationStyle("playful") },
        { text: t("onboarding.style.direct"), onPress: () => setCommunicationStyle("direct") },
        { text: t("onboarding.style.empathetic"), onPress: () => setCommunicationStyle("empathetic") },
        { text: t("common.cancel"), style: "cancel" },
      ]
    );
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert(t("common.error"), t("settings.editProfile.errorRequired"));
      return;
    }

    try {
      await updateProfile({
        display_name: displayName.trim(),
        username: username.trim() || null,
        main_goal: mainGoal || undefined,
        communication_style: communicationStyle || undefined,
        // avatar_url: avatarUri, // TODO: Upload and save avatar URL
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
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
          <Pressable style={{ position: "relative" }} onPress={handleChangePhoto}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </Pressable>
          <Pressable onPress={handleChangePhoto}>
            <Text style={styles.changePhotoText}>
              {t("settings.editProfile.changePhoto")}
            </Text>
          </Pressable>
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

          <Pressable onPress={handleChangeGoal}>
            {({ pressed }) => (
              <View style={[styles.preferenceCard, pressed && styles.preferenceCardPressed]}>
                <Text style={styles.preferenceLabel}>{t("settings.editProfile.mainGoal")}</Text>
                <View style={styles.preferenceRight}>
                  <Text style={styles.preferenceValue}>
                    {mainGoal === "dating"
                      ? t("onboarding.goal.dating")
                      : mainGoal === "social"
                      ? t("onboarding.goal.social")
                      : mainGoal === "professional"
                      ? t("onboarding.goal.professional")
                      : "Non défini"}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
              </View>
            )}
          </Pressable>

          <Pressable onPress={handleChangeStyle}>
            {({ pressed }) => (
              <View style={[styles.preferenceCard, pressed && styles.preferenceCardPressed]}>
                <Text style={styles.preferenceLabel}>{t("settings.editProfile.style")}</Text>
                <View style={styles.preferenceRight}>
                  <Text style={styles.preferenceValue}>
                    {communicationStyle === "playful"
                      ? t("onboarding.style.playful")
                      : communicationStyle === "direct"
                      ? t("onboarding.style.direct")
                      : communicationStyle === "empathetic"
                      ? t("onboarding.style.empathetic")
                      : "Non défini"}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
              </View>
            )}
          </Pressable>
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
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 10,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "#1A1A2E",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.5)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarText: {
    color: "#8B5CF6",
    fontSize: 48,
    fontWeight: "800",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 4,
    width: 36,
    height: 36,
    backgroundColor: "#8B5CF6",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#0F0F1A",
  },
  changePhotoText: {
    color: "#A78BFA",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#9CA3AF",
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: "white",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  usernameInputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  usernamePrefix: {
    color: "#6B7280",
    fontSize: 16,
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    paddingVertical: 18,
    color: "white",
    fontSize: 16,
  },
  preferencesContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#A78BFA",
    marginBottom: 16,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 4,
  },
  preferenceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceLabel: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  preferenceValue: {
    color: "#A78BFA",
    fontWeight: "500",
    fontSize: 15,
    marginRight: 8,
  },
  preferenceCardPressed: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  preferenceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1A1A2E",
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.5)",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
