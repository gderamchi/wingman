import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ReplySuggestion } from "@/src/core/api/blackbox";
import { useAnalysisStore } from "@/src/features/analysis/stores/analysisStore";

export default function ResultsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();


  const analysisResult = useAnalysisStore((s) => s.analysisResult);
  const selectReply = useAnalysisStore((s) => s.selectReply);
  const selectedReply = useAnalysisStore((s) => s.selectedReply);

  // Track which suggestion was just copied (by index)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (!analysisResult) {
      router.replace("/(tabs)");
    }
  }, [analysisResult]);

  const handleSelectReply = (reply: ReplySuggestion) => {
    selectReply(reply);
  };

  const handleCopy = async (text: string, idx: number) => {
    await Clipboard.setStringAsync(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleUseReply = () => {
    if (selectedReply) {
      router.push("/(tabs)/coach/outcome");
    }
  };

  if (!analysisResult) {
    return null;
  }
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) }]}>
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {t("coach.results.title")}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
           {/* Compact Analysis Summary - Collapsible */}
           <Pressable
             onPress={() => setShowAnalysis(!showAnalysis)}
             style={styles.summaryToggle}
           >
             <View style={styles.summaryToggleLeft}>
               <Ionicons name="analytics" size={16} color="#8B5CF6" />
               <Text style={styles.summaryToggleText}>
                 {analysisResult.analysis.conversationSummary.slice(0, 50)}...
               </Text>
             </View>
             <Ionicons name={showAnalysis ? "chevron-up" : "chevron-down"} size={18} color="#6B7280" />
           </Pressable>

           {showAnalysis && (
             <View style={styles.summaryExpanded}>
               <Text style={styles.summaryText}>
                 {analysisResult.analysis.conversationSummary}
               </Text>
               {analysisResult.analysis.keyInsights.length > 0 && (
                 <View style={styles.insightsContainer}>
                   {analysisResult.analysis.keyInsights.slice(0, 2).map((insight, idx) => (
                     <View key={idx} style={styles.insightRow}>
                       <View style={styles.insightDot} />
                       <Text style={styles.insightText}>{insight}</Text>
                     </View>
                   ))}
                 </View>
               )}
             </View>
           )}

           {/* Suggestions Header */}
           <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsTitle}>
                {t("coach.results.suggestions")}
              </Text>
              <View style={styles.countBadge}>
                 <Text style={styles.countText}>{analysisResult.suggestions.length}</Text>
              </View>
           </View>

           {/* Suggestions List - Simplified */}
           <View style={styles.suggestionsList}>
             {analysisResult.suggestions.map((suggestion, idx) => {
               const isSelected = selectedReply === suggestion;
               const isCopied = copiedIdx === idx;
               return (
                 <Pressable
                   key={idx}
                   onPress={() => handleSelectReply(suggestion)}
                   style={styles.suggestionCard}
                 >
                   <LinearGradient
                     colors={isSelected ? ["#362249", "#2D1B3E"] : ["#1A1A2E", "#16162a"]}
                     style={[
                       styles.suggestionGradient,
                       isSelected ? { borderWidth: 1, borderColor: "#8B5CF6" } : { borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }
                     ]}
                   >
                     <View style={styles.suggestionContent}>
                       {/* Simplified Card Header */}
                       <View style={styles.cardHeader}>
                         <View style={styles.headerLeft}>
                           {/* Number badge */}
                           <View style={[styles.numberBadge, isSelected && { backgroundColor: "#8B5CF6" }]}>
                             <Text style={styles.numberText}>{idx + 1}</Text>
                           </View>
                         </View>
                         {/* Copy button and selection check */}
                         <View style={styles.headerRight}>
                           <Pressable
                             onPress={() => handleCopy(suggestion.text, idx)}
                             style={styles.copyButton}
                           >
                             <Ionicons
                               name={isCopied ? "checkmark" : "copy-outline"}
                               size={16}
                               color={isCopied ? "#10B981" : "#8B5CF6"}
                             />
                           </Pressable>
                           {isSelected && (
                             <Ionicons name="checkmark-circle" size={22} color="#8B5CF6" />
                           )}
                         </View>
                       </View>

                       <Text style={[styles.suggestionText, isSelected ? { color: "white", fontWeight: "600" } : { color: "#D1D5DB" }]}>
                         "{suggestion.text}"
                       </Text>
                     </View>
                   </LinearGradient>
                 </Pressable>
               );
             })}
           </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      {selectedReply && (
        <View style={styles.fabContainer}>
          <View style={styles.fabContent}>
            <Pressable
              onPress={() => router.push("/(tabs)/coach/chat")}
              style={styles.chatButton}
            >
              <LinearGradient
                colors={["#8B5CF6", "#6366F1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, styles.chatButtonOverlay]}
              />
              <Ionicons name="chatbubbles" size={20} color="#8B5CF6" />
              <Text style={styles.chatButtonText}>
                {t("coach.results.chatRefine")}
              </Text>
            </Pressable>

            <Pressable onPress={handleUseReply} style={styles.useButton}>
              <LinearGradient
                colors={["#8B5CF6", "#6366F1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.useButtonGradient}
              >
                <Text style={styles.useButtonText}>
                  {t("coach.results.useThis")}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}
    </View>
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
  contentContainer: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    // paddingTop handled dynamically
    paddingBottom: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 24,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(139, 92, 246, 0.1)", // bg-purple-500/10
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    color: "#8B5CF6", // text-purple-500
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryText: {
    color: "#E5E7EB", // text-gray-200
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 16,
  },
  insightsContainer: {
    backgroundColor: "#0F0F1A",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  insightDot: {
    marginTop: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C084FC", // purple-400
  },
  insightText: {
    color: "#9CA3AF", // text-gray-400
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  countBadge: {
    backgroundColor: "rgba(168, 85, 247, 0.1)", // purple-500/10
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countText: {
    color: "#C084FC", // purple-400
    fontSize: 12,
    fontWeight: "bold",
  },
  suggestionsList: {
    gap: 16,
  },
  suggestionCard: {
    overflow: "hidden",
    borderRadius: 16,
  },
  suggestionGradient: {
    padding: 1,
    borderRadius: 16,
  },
  suggestionContent: {
    backgroundColor: "rgba(26, 26, 46, 0.5)", // bg-[#1A1A2E]/50
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(168, 85, 247, 0.2)", // purple-500/20
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    color: "#C084FC", // purple-400
    fontSize: 12,
    fontWeight: "bold",
  },
  toneBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  toneText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyButton: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  suggestionText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 16,
  },
  reasoningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  reasoningText: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
    flex: 1,
    fontStyle: "italic",
  },
  fabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: "rgba(15, 15, 26, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  fabContent: {
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  chatButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden", // for opacity gradient
  },
  chatButtonText: {
    color: "#C084FC", // purple-400
    fontWeight: "bold",
    fontSize: 16,
  },
  useButton: {
    flex: 2,
    shadowColor: "#8B5CF6",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  useButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  useButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  chatButtonOverlay: {
    opacity: 0.2,
    borderRadius: 16,
  },
  summaryToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A2E",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  summaryToggleText: {
    color: "#9CA3AF",
    fontSize: 13,
    flex: 1,
  },
  summaryExpanded: {
    backgroundColor: "#1A1A2E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: -8,
  },
});
