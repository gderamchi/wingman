import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useAnalysisStore } from "@/src/features/analysis/stores/analysisStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PreviewScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const screenshotUri = useAnalysisStore((s) => s.screenshotUri);
  const setCroppedImage = useAnalysisStore((s) => s.setCroppedImage);
  const [isBlurred, setIsBlurred] = useState(false);

  const handleContinue = () => {
    // For now, just use the original image
    if (screenshotUri) {
      setCroppedImage(screenshotUri);
    }
    router.push({
      pathname: "/(tabs)/coach/context",
      params: params
    });
  };

  if (!screenshotUri) {
    router.back();
    return null;
  }

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
          {t("coach.preview.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Image preview */}
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: screenshotUri }}
            style={{
              width: SCREEN_WIDTH - 32,
              height: (SCREEN_WIDTH - 32) * 1.5,
            }}
            resizeMode="contain"
            blurRadius={isBlurred ? 20 : 0}
          />

          {/* Crop overlay indicator */}
          <View style={styles.cropOverlay} />
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.footer}>
        {/* Crop and Blur buttons */}
        <View style={styles.toolsRow}>
          <Pressable
            style={styles.toolButton}
          >
            <Ionicons name="crop" size={20} color="#8B5CF6" />
            <Text style={styles.toolText}>{t("coach.preview.crop")}</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsBlurred(!isBlurred)}
            style={[
              styles.toolButton,
              isBlurred ? styles.toolButtonActive : null
            ]}
          >
            <Ionicons
              name={isBlurred ? "eye-off" : "eye"}
              size={20}
              color="#8B5CF6"
            />
            <Text style={styles.toolText}>{t("coach.preview.blur")}</Text>
          </Pressable>
        </View>

        {/* Continue button */}
        <Pressable onPress={handleContinue}>
          <LinearGradient
            colors={["#8B5CF6", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>
              {t("coach.preview.analyze")}
            </Text>
          </LinearGradient>
        </Pressable>
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
    justifyContent: "space-between",
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
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  cropOverlay: {
    position: "absolute",
    top: 16,
    bottom: 16,
    left: 16,
    right: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)", // white/30
    borderRadius: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  toolsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  toolButton: {
    flex: 1,
    backgroundColor: "#1A1A2E", // bg-dark-50
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6, // fallback
  },
  toolButtonActive: {
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
  },
  toolText: {
    color: "white",
    marginLeft: 8,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 16,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
