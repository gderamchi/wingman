import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore, useProfile, useUser } from "@/src/features/auth/stores/authStore";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const profile = useProfile();
  const signOut = useAuthStore((state) => state.signOut);

  const displayName =
    profile?.display_name ??
    profile?.username ??
    user?.email?.split("@")[0] ??
    t("community.post.unknownUser");

  const handleLogout = async () => {
    Alert.alert(t("settings.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logout"),
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  // Calculate level progress
  const xp = profile?.xp_points ?? 0;
  const level = profile?.level ?? 1;
  const progressPercent = Math.min(((xp % 100) / 100) * 100, 100);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["#8B5CF6", "#6366F1"]}
              style={styles.avatarGradient}
            >
              <Image
                source={{
                  uri:
                    profile?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8B5CF6&color=fff&size=128`,
                }}
                style={styles.avatar}
              />
            </LinearGradient>
            {/* Level Badge */}
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
            {/* Edit Button */}
            <Pressable
              onPress={() => router.push("/preferences/edit-profile")}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={14} color="#fff" />
            </Pressable>
          </View>

          {/* Name & Username */}
          <Text style={styles.displayName}>{displayName}</Text>
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>@{profile?.username ?? "user"}</Text>
          </View>
        </View>

        {/* XP Progress Card */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <Text style={styles.xpLabel}>{t("profile.stats.progression")}</Text>
              <Text style={styles.xpValue}>
                {xp} {t("profile.stats.wingmanPoints")}
              </Text>
            </View>
            <View style={styles.xpPercentContainer}>
              <Text style={styles.xpPercent}>{progressPercent.toFixed(0)}%</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={["#8B5CF6", "#6366F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <View style={styles.xpFooter}>
            <Text style={styles.xpFooterText}>{t("profile.stats.currentLevel")}</Text>
            <Text style={styles.xpFooterText}>
              {t("profile.stats.next")}: {level + 1}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(96, 165, 250, 0.1)" }]}>
              <MaterialIcons name="query-stats" size={22} color="#60A5FA" />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t("profile.analyses")}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(52, 211, 153, 0.1)" }]}>
              <MaterialIcons name="check-circle" size={22} color="#34D399" />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t("profile.replies")}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(251, 146, 60, 0.1)" }]}>
              <MaterialIcons name="local-fire-department" size={22} color="#FB923C" />
            </View>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>{t("profile.stats.streak")}</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.account")}</Text>

          {/* Subscription */}
          <Pressable
            onPress={() => router.push("/preferences/subscription")}
          >
            {({ pressed }) => (
              <View style={[styles.menuItem, pressed && styles.menuItemPressed]}>
                <View style={[styles.menuIcon, styles.menuIconPrimary]}>
                  <MaterialIcons name="diamond" size={24} color="#A78BFA" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{t("profile.subscription")}</Text>
                  <Text style={styles.menuSubtitle}>{t("profile.wingmanFree")}</Text>
                </View>
                <View style={styles.menuChevron}>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </View>
              </View>
            )}
          </Pressable>

          {/* Language */}
          <Pressable
            onPress={() => router.push("/preferences/language")}
          >
            {({ pressed }) => (
              <View style={[styles.menuItem, pressed && styles.menuItemPressed]}>
                <View style={styles.menuIcon}>
                  <MaterialIcons name="language" size={24} color="#9CA3AF" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{t("settings.language")}</Text>
                </View>
                <Text style={styles.menuValue}>
                  {profile?.language === "fr" ? "Français" : "English"}
                </Text>
                <View style={styles.menuChevron}>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </View>
              </View>
            )}
          </Pressable>

          {/* Support */}
          <Pressable
            onPress={() => router.push("/preferences/support")}
          >
            {({ pressed }) => (
              <View style={[styles.menuItem, pressed && styles.menuItemPressed]}>
                <View style={styles.menuIcon}>
                  <Ionicons name="help-circle" size={24} color="#9CA3AF" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{t("settings.help")}</Text>
                </View>
                <View style={styles.menuChevron}>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </View>
              </View>
            )}
          </Pressable>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
        >
          {({ pressed }) => (
            <View style={[styles.logoutButton, pressed && styles.logoutButtonPressed]}>
              <View style={styles.logoutIcon}>
                <Ionicons name="log-out" size={22} color="#F87171" />
              </View>
              <Text style={styles.logoutText}>{t("settings.logout")}</Text>
            </View>
          )}
        </Pressable>

        {/* Version */}
        <Text style={styles.version}>Wingman v1.0.2</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  // Profile Header
  profileHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 18,
    // Glow effect
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarGradient: {
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 4,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: "#1A1A2E",
  },
  levelBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#0F0F1A",
    // Badge shadow
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  levelText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  editButton: {
    position: "absolute",
    top: 2,
    right: -6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(26, 26, 46, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  displayName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  usernameContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.25)",
  },
  username: {
    color: "#A78BFA",
    fontSize: 14,
    fontWeight: "600",
  },
  // XP Card
  xpCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "rgba(139, 92, 246, 0.25)",
    // Shadow
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  xpValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  xpPercentContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  xpPercent: {
    fontSize: 14,
    fontWeight: "700",
    color: "#A78BFA",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  xpFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  xpFooterText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1A1A2E",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "center",
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  // Menu Items
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItemPressed: {
    backgroundColor: "#252540",
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  menuIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  menuIconPrimary: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#A78BFA",
    fontWeight: "500",
    marginTop: 3,
  },
  menuValue: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
    marginRight: 10,
  },
  menuChevron: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 6,
    borderRadius: 10,
  },
  // Logout
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(248, 113, 113, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.1)",
  },
  logoutButtonPressed: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
  },
  logoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F87171",
  },
  // Version
  version: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 20,
  },
});
