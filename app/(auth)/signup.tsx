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
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAuthStore } from "@/src/features/auth/stores/authStore";

export default function SignupScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const signUp = useAuthStore((state) => state.signUp);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  // const signInWithApple = useAuthStore((state) => state.signInWithApple);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t("common.error"), t("auth.fillAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("common.error"), t("auth.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t("common.error"), t("auth.passwordTooShort"));
      return;
    }

    try {
      await signUp(email, password);
      // router.replace("/(onboarding)"); // Handled by root layout
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>
            {t("auth.signUp")}
          </Text>
          <Text style={styles.subtitle}>
            {t("auth.createAccountSubtitle")}
          </Text>

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("auth.email")}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) clearError();
                }}
                placeholder={t("auth.emailPlaceholder")}
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          </View>

          {/* Password field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("auth.password")}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) clearError();
                }}
                placeholder={t("auth.passwordPlaceholder")}
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm password field */}
          <View style={styles.lastInputContainer}>
            <Text style={styles.label}>
              {t("auth.confirmPassword")}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (error) clearError();
                }}
                placeholder={t("auth.passwordPlaceholder")}
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
            </View>
          </View>

          {/* Signup button */}
          <Pressable onPress={handleSignup} disabled={isLoading}>
            <LinearGradient
              colors={isLoading ? ["#4B5563", "#374151"] : ["#8B5CF6", "#6366F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signupButton}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>
                  {t("auth.signUp")}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("common.or")}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social signup */}
          <View style={styles.socialButtonsContainer}>
            <SocialButton
              icon="logo-google"
              text={t("auth.loginWithGoogle")}
              onPress={signInWithGoogle}
            />
            {/* <SocialButton
              icon="logo-apple"
              text={t("auth.loginWithApple")}
              onPress={signInWithApple}
            /> */}
          </View>
        </View>

        {/* Bottom link */}
        <View style={styles.footer}>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.footerText}>
              {t("auth.alreadyHaveAccount")}{" "}
              <Text style={styles.footerLink}>
                {t("auth.login")}
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SocialButton({
  icon,
  text,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.socialButton}
    >
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={styles.socialButtonText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48, // pt-12
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32, // px-8
    paddingTop: 32, // pt-8
  },
  title: {
    fontSize: 30, // text-3xl
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16, // text-base
    color: "#9CA3AF", // gray-400
    marginBottom: 32, // mb-8
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.2)", // bg-error/20
    borderColor: "#EF4444", // border-error
    borderWidth: 1,
    borderRadius: 12, // rounded-xl
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16, // mb-4
  },
  lastInputContainer: {
    marginBottom: 32, // mb-8
  },
  label: {
    fontSize: 14, // text-sm
    color: "#9CA3AF", // gray-400
    marginBottom: 8, // mb-2
  },
  inputWrapper: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12, // rounded-xl
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, // px-4
  },
  input: {
    flex: 1,
    paddingVertical: 16, // py-4
    paddingHorizontal: 12, // px-3
    color: "white",
    fontSize: 16, // text-base
  },
  signupButton: {
    paddingVertical: 16, // py-4
    paddingHorizontal: 32, // px-8
    borderRadius: 16, // rounded-2xl
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    color: "white",
    fontSize: 18, // text-lg
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32, // my-8
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#374151", // gray-700
  },
  dividerText: {
    color: "#6B7280", // gray-500
    paddingHorizontal: 16, // px-4
  },
  socialButtonsContainer: {
    gap: 12, // gap-3
  },
  socialButton: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    paddingVertical: 16, // py-4
    paddingHorizontal: 24, // px-6
    borderRadius: 12, // rounded-xl
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  socialButtonText: {
    color: "white",
    marginLeft: 12, // ml-3
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 32, // px-8
    paddingVertical: 32, // py-8
  },
  footerText: {
    color: "#9CA3AF", // gray-400
    textAlign: "center",
  },
  footerLink: {
    color: "#A78BFA", // primary-400
    fontWeight: "500",
  },
});
