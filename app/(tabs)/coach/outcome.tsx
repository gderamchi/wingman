import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useAnalysisStore } from "@/src/features/analysis/stores/analysisStore";
import { useUser } from "@/src/features/auth/stores/authStore";

type OutcomeType = "sent" | "saved" | "discarded";
type ResultType = "positive" | "neutral" | "negative";



import { useCommunityStore } from "@/src/features/community/stores/communityStore";

export default function OutcomeScreen() {
  const { t } = useTranslation();
  const user = useUser();

  const outcomes = [
    { id: "sent" as OutcomeType, label: t("coach.outcome.sent"), icon: "send", color: "#10B981" },
    { id: "saved" as OutcomeType, label: t("coach.outcome.saved"), icon: "bookmark", color: "#F59E0B" },
    { id: "discarded" as OutcomeType, label: t("coach.outcome.discarded"), icon: "close-circle", color: "#6B7280" },
  ] as const;

  const results = [
    { id: "positive" as ResultType, label: t("coach.outcome.positive"), icon: "happy" },
    { id: "neutral" as ResultType, label: t("coach.outcome.neutral"), icon: "remove" },
    { id: "negative" as ResultType, label: t("coach.outcome.negative"), icon: "sad" },
  ] as const;

  const [outcome, setOutcome] = useState<OutcomeType | null>(null);
  const [result, setResult] = useState<ResultType | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const selectedReply = useAnalysisStore((s) => s.selectedReply);
  const refinedReply = useAnalysisStore((s) => s.refinedReply);
  const analysisResult = useAnalysisStore((s) => s.analysisResult);
  const screenshotUri = useAnalysisStore((s) => s.screenshotUri);
  const setOutcomeStore = useAnalysisStore((s) => s.setOutcome);
  const setOutcomeResult = useAnalysisStore((s) => s.setOutcomeResult);
  const saveAnalysis = useAnalysisStore((s) => s.saveAnalysis);
  const resetAnalysis = useAnalysisStore((s) => s.resetAnalysis);

  const createPost = useCommunityStore((s) => s.createPost);

  const finalReply = refinedReply ?? selectedReply?.text ?? "";

  const handleCopy = async () => {
    await Clipboard.setStringAsync(finalReply);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareToCommunity = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
        const content = `Analyse Wingman: ${analysisResult?.analysis.conversationSummary || "Conversation"}\n\nRéponse choisie: "${finalReply}"`;
        // Note: Using screenshotUri directly (likely local), should be uploaded reference ideally.
        await createPost(content, screenshotUri ?? undefined, true);
        Alert.alert("Partagé !", "Ton analyse a été postée anonymement sur la communauté.");
    } catch (e) {
        Alert.alert("Erreur", "Impossible de partager pour le moment.");
    } finally {
        setIsSharing(false);
    }
  };

  const handleComplete = async () => {
    if (!outcome) return;

    // Save to store
    setOutcomeStore(outcome);
    if (result) setOutcomeResult(result);

    // Save to database
    if (user?.id) {
      await saveAnalysis(user.id);
    }

    // Reset and go home
    resetAnalysis();
    router.replace("/(tabs)");
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
          {t("coach.outcome.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Final reply */}
        <View style={styles.replyCard}>
          <View style={styles.replyHeader}>
            <Text style={styles.replyLabel}>{t("coach.outcome.yourReply")}</Text>
            <Pressable
              onPress={handleCopy}
              style={styles.copyButton}
            >
              <Ionicons
                name={isCopied ? "checkmark" : "copy-outline"}
                size={18}
                color={isCopied ? "#10B981" : "#8B5CF6"}
              />
              <Text style={[styles.copyText, isCopied ? styles.textSuccess : styles.textPrimary]}>
                {isCopied ? t("common.copied") : t("common.copy")}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.replyText}>
            "{finalReply}"
          </Text>
        </View>

        {/* Outcome selection */}
        <Text style={styles.sectionTitle}>
          {t("coach.outcome.whatDidYouDo")}
        </Text>
        <View style={styles.outcomesContainer}>
          {outcomes.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setOutcome(item.id)}
              style={[
                styles.optionItem,
                outcome === item.id
                  ? { backgroundColor: "rgba(139, 92, 246, 0.1)", borderColor: "#8B5CF6" }
                  : { backgroundColor: "#1A1A2E", borderColor: "transparent" }
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: `${item.color}20` }
                ]}
              >
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={item.color}
                />
              </View>
              <Text style={styles.optionLabel}>{item.label}</Text>
              {outcome === item.id && (
                <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Result selection (only if sent) */}
        {outcome === "sent" && (
          <>
            <Text style={styles.sectionTitle}>
              {t("coach.outcome.result")}
            </Text>
            <View style={styles.resultsContainer}>
              {results.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setResult(item.id)}
                  style={[
                    styles.optionItem,
                    result === item.id
                      ? { backgroundColor: "rgba(139, 92, 246, 0.1)", borderColor: "#8B5CF6" }
                      : { backgroundColor: "#1A1A2E", borderColor: "transparent" }
                  ]}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={result === item.id ? "#8B5CF6" : "#9CA3AF"}
                  />
                  <Text style={styles.resultLabel}>{item.label}</Text>
                  {result === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                  )}
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Complete buttons */}
      <View style={styles.footer}>
         {outcome === "sent" && (result === "positive" || result === "neutral") && (
             <Pressable
               onPress={handleShareToCommunity}
               disabled={isSharing}
               style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 16, backgroundColor: '#2D1B4E', borderWidth: 1, borderColor: '#8B5CF6' }}
             >
                {isSharing ? (
                    <ActivityIndicator color="#8B5CF6" size="small" />
                ) : (
                    <>
                     <Ionicons name="people" size={20} color="#D8B4FE" style={{ marginRight: 8 }} />
                     <Text style={{ color: '#D8B4FE', fontWeight: 'bold' }}>Partager anonymement</Text>
                    </>
                )}
             </Pressable>
         )}

        <Pressable
          onPress={handleComplete}
          disabled={!outcome || (outcome === "sent" && !result)}
        >
          <LinearGradient
            colors={
              outcome && (outcome !== "sent" || result)
                ? ["#8B5CF6", "#6366F1"]
                : ["#4B5563", "#374151"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>
              {t("common.done")}
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
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyText: {
    marginLeft: 4,
    fontSize: 14,
  },
  textSuccess: {
    color: "#10B981", // text-success
  },
  textPrimary: {
    color: "#8B5CF6", // text-primary
  },
  replyText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    color: "white",
    fontWeight: "600",
    marginBottom: 16,
  },
  outcomesContainer: {
    gap: 12, // Gap polyfill not always safe, but newer RN supports it. Alternatively use marginBottom on items.
    marginBottom: 32,
  },
  resultsContainer: {
    gap: 12,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12, // fallback for gap
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionLabel: {
    color: "white",
    flex: 1,
  },
  resultLabel: {
    color: "white",
    marginLeft: 16,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 16,
  },
  doneButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
