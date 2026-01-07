import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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

import { ChallengesTab } from "@/src/features/community/components/ChallengesTab";
import { LeaderboardTab } from "@/src/features/community/components/LeaderboardTab";
import { PostCard } from "@/src/features/community/components/PostCard";
import { useCommunityStore } from "@/src/features/community/stores/communityStore";





export default function CommunityFeedScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"feed" | "challenges" | "leaderboard">("feed");

  const CATEGORIES = [
    { id: null, label: t("community.categories.all") },
    { id: "dating", label: t("community.categories.dating") },
    { id: "social", label: t("community.categories.social") },
    { id: "pro", label: t("community.categories.pro") },
  ];

  const posts = useCommunityStore((s) => s.posts);
  const isLoading = useCommunityStore((s) => s.isLoadingPosts);
  const category = useCommunityStore((s) => s.category);
  const fetchPosts = useCommunityStore((s) => s.fetchPosts);
  const setCategory = useCommunityStore((s) => s.setCategory);
  const error = useCommunityStore((s) => s.error);

  useEffect(() => {
    fetchPosts().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not when fetchPosts reference changes

  const handleRefresh = () => {
    fetchPosts(category ?? undefined);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t("community.title")}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          label={t("community.feed")}
          isActive={activeTab === "feed"}
          onPress={() => setActiveTab("feed")}
        />
        <TabButton
          label={t("community.challenges")}
          isActive={activeTab === "challenges"}
          onPress={() => setActiveTab("challenges")}
        />
        <TabButton
          label={t("community.leaderboard")}
          isActive={activeTab === "leaderboard"}
          onPress={() => setActiveTab("leaderboard")}
        />
      </View>

      {activeTab === "feed" && (
        <>
          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={handleRefresh}>
                 <Text style={styles.retryText}>{t("common.retry")}</Text>
              </Pressable>
            </View>
          )}

          {/* Category filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
            contentContainerStyle={styles.filterContent}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id ?? "all"}
                onPress={() => setCategory(cat.id)}
                style={[
                  styles.categoryButton,
                  category === cat.id ? styles.categoryButtonActive : styles.categoryButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.id ? styles.categoryTextActive : styles.categoryTextInactive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Posts list */}
          <ScrollView
            style={styles.postsScrollView}
            contentContainerStyle={styles.postsContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor="#8B5CF6"
              />
            }
          >
            {isLoading && posts.length === 0 ? (
              <View style={[styles.centerLoading, { flex: 1, justifyContent: 'center' }]}>
                <ActivityIndicator color="#8B5CF6" />
              </View>
            ) : posts.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconWrapper}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="chatbubbles-outline" size={36} color="#8B5CF6" />
                  </View>
                  <View style={styles.emptyIconGlow} />
                </View>
                <Text style={styles.emptyTitle}>
                  {t("community.emptyFeed")}
                </Text>
                <Text style={styles.emptySubtitle}>
                  Partage tes expériences avec la communauté
                </Text>
              </View>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPress={() => router.push(`/(tabs)/community/post/${post.id}`)}
                />
              ))
            )}
            <View style={{ height: 96 }} />
          </ScrollView>
        </>
      )}

      {activeTab === "challenges" && <ChallengesTab />}
      {activeTab === "leaderboard" && <LeaderboardTab />}

      {/* FAB for creating post */}
      {activeTab === "feed" && (
        <Pressable
          onPress={() => router.push("/(tabs)/community/create")}
          style={styles.fabButton}
        >
          <LinearGradient
            colors={["#8B5CF6", "#6366F1"]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

function TabButton({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        isActive && styles.tabButtonActive,
        pressed && { opacity: 0.8 }
      ]}
    >
      <Text
        style={[
          styles.tabText,
          isActive ? styles.tabTextActive : styles.tabTextInactive,
        ]}
      >
        {label}
      </Text>
      {isActive && <View style={styles.tabIndicatorGlow} />}
    </Pressable>
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
    paddingBottom: 24,
    alignItems: 'center', // Center content
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    textAlign: 'center',
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 24,
    justifyContent: 'center',
    gap: 12,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "white",
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  tabTextInactive: {
    color: "#6B7280",
  },
  tabIndicatorGlow: {
    position: 'absolute' as const,
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#8B5CF6',
    borderRadius: 1,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  filterScrollView: {
    maxHeight: 40,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  filterContent: {
    gap: 8,
    paddingRight: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  categoryButtonActive: {
    backgroundColor: "#8B5CF6", // bg-primary
  },
  categoryButtonInactive: {
    backgroundColor: "#1A1A2E", // bg-dark-50
  },
  categoryText: {
    fontSize: 14,
  },
  categoryTextActive: {
    color: "white",
  },
  categoryTextInactive: {
    color: "#9CA3AF", // text-gray-400
  },
  postsScrollView: {
    flex: 1,
  },
  postsContent: {
    paddingHorizontal: 24,
  },
  centerLoading: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateContainer: {
    alignItems: "center" as const,
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    position: 'relative' as const,
    marginBottom: 20,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    borderRadius: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.25)",
  },
  emptyIconGlow: {
    position: 'absolute' as const,
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 48,
    zIndex: -1,
  },
  emptyTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
    textAlign: "center" as const,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center" as const,
  },
  emptyText: {
    color: "#9CA3AF",
    textAlign: "center" as const,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  placeholderSubtitle: {
    color: "#9CA3AF", // text-gray-400
    textAlign: "center",
  },
  fabButton: {
    position: "absolute",
    bottom: 96,
    right: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    backgroundColor: "rgba(239, 68, 68, 0.1)", // bg-red-500/10
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444", // text-red-500
    textAlign: "center",
    marginVertical: 8,
  },
  retryText: {
    color: "#8B5CF6", // text-primary
    fontWeight: "600",
  },
});
