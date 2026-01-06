import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAnalysisStore } from "@/src/features/analysis/stores/analysisStore";

export default function EditorScreen() {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState("");

  const selectedReply = useAnalysisStore((s) => s.selectedReply);
  const refinedReply = useAnalysisStore((s) => s.refinedReply);
  const refineReply = useAnalysisStore((s) => s.refineReply);
  const currentStep = useAnalysisStore((s) => s.currentStep);

  const displayedReply = refinedReply ?? selectedReply?.text ?? "";
  const isRefining = currentStep === "processing";

  const handleRefine = async () => {
    if (!feedback.trim()) return;
    await refineReply(feedback);
    setFeedback("");
  };

  const handleUse = () => {
    router.push("/(tabs)/coach/outcome");
  };

  if (!selectedReply) {
    router.back();
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t("coach.editor.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Current reply */}
        <View style={styles.replyCard}>
          <View style={styles.replyHeader}>
            <Text style={styles.replyLabel}>Réponse actuelle</Text>
            {refinedReply && (
              <View style={styles.refinedBadge}>
                <Text style={styles.refinedText}>Affinée</Text>
              </View>
            )}
          </View>
          <Text style={styles.replyText}>
            "{displayedReply}"
          </Text>
        </View>

        {/* Refinement input */}
        <Text style={styles.inputLabel}>
          Comment l'améliorer ?
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            value={feedback}
            onChangeText={setFeedback}
            placeholder={t("coach.editor.placeholder")}
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={3}
            style={styles.textInput}
            textAlignVertical="top"
            editable={!isRefining}
          />
        </View>

        {/* Quick suggestions */}
        <View style={styles.quickChipsContainer}>
          <QuickChip
            label="Plus décontracté"
            onPress={() => setFeedback("Rends-la plus décontractée et légère")}
          />
          <QuickChip
            label="Plus direct"
            onPress={() => setFeedback("Rends-la plus directe et confiante")}
          />
          <QuickChip
            label="Ajouter de l'humour"
            onPress={() => setFeedback("Ajoute une touche d'humour")}
          />
          <QuickChip
            label="Plus court"
            onPress={() => setFeedback("Raccourcis la réponse")}
          />
        </View>

        {/* Regenerate button */}
        <Pressable
          onPress={handleRefine}
          disabled={!feedback.trim() || isRefining}
          style={[
            styles.regenerateButton,
            (feedback.trim() && !isRefining) ? styles.regenerateButtonActive : styles.regenerateButtonDisabled
          ]}
        >
          {isRefining ? (
            <ActivityIndicator color="#8B5CF6" />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color="#8B5CF6" />
              <Text style={styles.regenerateText}>
                {t("coach.editor.regenerate")}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Use button */}
      <View style={styles.footer}>
        <Pressable onPress={handleUse}>
          <LinearGradient
            colors={["#8B5CF6", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.useButton}
          >
            <Text style={styles.useButtonText}>
              {t("coach.results.useThis")}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function QuickChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.chip}
    >
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  replyCard: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  replyLabel: {
    color: "#9CA3AF", // text-gray-400
    fontSize: 14,
  },
  refinedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)", // bg-success/20
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  refinedText: {
    color: "#10B981", // text-success
    fontSize: 12,
  },
  replyText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
  },
  inputLabel: {
    color: "#9CA3AF", // text-gray-400
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 16,
    marginBottom: 16,
  },
  textInput: {
    padding: 16,
    color: "white",
    fontSize: 16,
    minHeight: 100,
  },
  quickChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    marginRight: 8, // fallback for gap
    marginBottom: 8, // fallback
  },
  chipText: {
    color: "#D1D5DB", // text-gray-300
    fontSize: 14,
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  regenerateButtonActive: {
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
  },
  regenerateButtonDisabled: {
    backgroundColor: "#1A1A2E", // bg-dark-50
  },
  regenerateText: {
    color: "#8B5CF6", // text-primary
    fontWeight: "500",
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  useButton: {
    paddingVertical: 16,
    borderRadius: 16,
  },
  useButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
