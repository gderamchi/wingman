import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#1A1A2E", "#0F0F1A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {t("welcome.title")}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t("welcome.subtitle")}
        </Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          {t("welcome.tagline")}
        </Text>

        {/* Features list */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="💬"
            text={t("welcome.features.analyze")}
          />
          <FeatureItem
            icon="✨"
            text={t("welcome.features.suggestions")}
          />
          <FeatureItem
            icon="🚀"
            text={t("welcome.features.skills")}
          />
        </View>
      </View>

      {/* Bottom CTAs */}
      <View style={styles.bottomContainer}>
        {/* Primary CTA */}
        <Pressable
          onPress={() => router.push("/(auth)/signup")}
          style={styles.primaryButtonContainer}
        >
          <LinearGradient
            colors={["#8B5CF6", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {t("welcome.cta")}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Secondary CTA */}
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            {t("auth.alreadyHaveAccount")}{" "}
            <Text style={styles.secondaryButtonLink}>
              {t("auth.login")}
            </Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 128,
    height: 128,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#9CA3AF", // gray-400
    textAlign: "center",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#A78BFA", // primary-400
    textAlign: "center",
    marginBottom: 48,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  primaryButtonContainer: {
    marginBottom: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryButton: {
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: "#9CA3AF",
    textAlign: "center",
  },
  secondaryButtonLink: {
    color: "#A78BFA",
    fontWeight: "500",
  },
});
