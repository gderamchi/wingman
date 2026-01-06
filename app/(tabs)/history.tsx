import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { supabase } from "@/src/core/api/supabase";
import { useUser } from "@/src/features/auth/stores/authStore";

interface AnalysisItem {
  id: string;
  created_at: string;
  context: { goal?: string; additionalContext?: string } | null;
  outcome: string | null;
  outcome_result: string | null;
}

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "fr" ? fr : enUS;
  const user = useUser();

  const {
    data: analyses,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["analyses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("analyses")
        .select("id, created_at, context, outcome, outcome_result")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AnalysisItem[];
    },
    enabled: !!user?.id,
  });

  const getOutcomeIcon = (outcome: string | null) => {
    switch (outcome) {
      case "sent":
        return { icon: "send", color: "#10B981" };
      case "saved":
        return { icon: "bookmark", color: "#F59E0B" };
      case "discarded":
        return { icon: "close-circle", color: "#6B7280" };
      default:
        return { icon: "ellipsis-horizontal", color: "#6B7280" };
    }
  };

  const getResultBadge = (result: string | null) => {
    switch (result) {
      case "positive":
        return { label: t("history.results.positive"), backgroundColor: "rgba(16, 185, 129, 0.2)", textColor: "#10B981" };
      case "neutral":
        return { label: t("history.results.neutral"), backgroundColor: "rgba(107, 114, 128, 0.2)", textColor: "#9CA3AF" };
      case "negative":
        return { label: t("history.results.negative"), backgroundColor: "rgba(239, 68, 68, 0.2)", textColor: "#EF4444" };
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t("history.title")}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#8B5CF6"
          />
        }
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color="#8B5CF6" />
          </View>
        ) : !user ? (
          <View style={styles.centerContainer}>
             <Ionicons name="person-circle-outline" size={48} color="#6B7280" />
             <Text style={styles.emptyTitle}>{t("history.notLoggedIn")}</Text>
             <Text style={styles.emptySubtitle}>{t("history.loginPrompt")}</Text>
          </View>
        ) : !analyses || analyses.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="time-outline" size={40} color="#8B5CF6" />
            </View>
            <Text style={styles.emptyTitle}>
              {t("history.empty")}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t("history.emptyDesc")}
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)")}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>
                {t("coach.empty.cta")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>
              {analyses.length} analyse{analyses.length > 1 ? "s" : ""}
            </Text>
            {analyses.map((item) => {
              const outcomeInfo = getOutcomeIcon(item.outcome);
              const resultBadge = getResultBadge(item.outcome_result);
              const timeAgo = formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
                locale: dateLocale,
              });

              return (
                <Pressable
                  key={item.id}
                  style={styles.card}
                  onPress={() => router.push(`/(tabs)/history/${item.id}`)}
                >
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[styles.outcomeIcon, { backgroundColor: `${outcomeInfo.color}20` }]}
                      >
                        <Ionicons
                          name={outcomeInfo.icon as keyof typeof Ionicons.glyphMap}
                          size={16}
                          color={outcomeInfo.color}
                        />
                      </View>
                      <Text style={styles.timeText}>{timeAgo}</Text>
                    </View>
                    {resultBadge && (
                      <View style={[styles.badge, { backgroundColor: resultBadge.backgroundColor }]}>
                        <Text style={[styles.badgeText, { color: resultBadge.textColor }]}>
                          {resultBadge.label}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Context preview */}
                  <Text style={styles.contextText} numberOfLines={2}>
                    {item.context?.additionalContext ||
                      (item.context?.goal === "dating"
                        ? t("history.context.dating")
                        : item.context?.goal === "social"
                        ? t("history.context.social")
                        : item.context?.goal === "professional"
                        ? t("history.context.professional")
                        : t("history.context.default"))}
                  </Text>
                </Pressable>
              );
            })}
            <View style={{ height: 96 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  centerContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(139, 92, 246, 0.1)", // bg-primary/10
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#9CA3AF", // text-gray-400
    textAlign: "center",
    paddingHorizontal: 32,
  },
  ctaButton: {
    marginTop: 24,
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: {
    color: "#8B5CF6", // text-primary
    fontWeight: "500",
  },
  countText: {
    color: "#6B7280", // text-gray-500
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  outcomeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  timeText: {
    color: "#9CA3AF", // text-gray-400
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 12,
  },
  contextText: {
    color: "white",
  },
});
