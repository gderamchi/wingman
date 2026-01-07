import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSubscriptionStore } from "@/src/features/subscription/stores/subscriptionStore";

export default function SubscriptionScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const dateLocale = i18n.language === "fr" ? fr : enUS;

  const isProUser = useSubscriptionStore((s) => s.isProUser);
  const status = useSubscriptionStore((s) => s.status);
  const isInTrial = useSubscriptionStore((s) => s.isInTrial);
  const expirationDate = useSubscriptionStore((s) => s.expirationDate);
  const isLoading = useSubscriptionStore((s) => s.isLoading);
  const isRestoring = useSubscriptionStore((s) => s.isRestoring);
  const restore = useSubscriptionStore((s) => s.restore);
  const checkProAccess = useSubscriptionStore((s) => s.checkProAccess);

  useEffect(() => {
    checkProAccess();
  }, []);

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      Alert.alert(t("common.success"), t("paywall.restoreSuccess"));
    } else {
      Alert.alert(t("paywall.noPurchase"), t("paywall.restoreEmpty"));
    }
  };

  const features = [
    { icon: "infinite", label: t("paywall.features.unlimited") },
    { icon: "flash", label: t("paywall.features.priority") },
    { icon: "trending-up", label: t("paywall.features.stats") },
    { icon: "trophy", label: t("paywall.features.challenges") },
    { icon: "sparkles", label: t("paywall.features.earlyAccess") },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t("profile.subscription")}
        </Text>
      </View>

      <View style={styles.content}>
        {isProUser ? (
          <>
            {/* Active subscription */}
            <LinearGradient
              colors={["rgba(139, 92, 246, 0.3)", "rgba(99, 102, 241, 0.2)"]}
              style={styles.activeCard}
            >
              <View style={styles.activeCardHeader}>
                <View>
                  <View style={styles.activeTitleRow}>
                    <Text style={styles.activeTitle}>
                      Wingman PRO
                    </Text>
                    <View style={[styles.statusBadge, isInTrial ? styles.badgeTrial : styles.badgeActive]}>
                      <Text style={styles.statusText}>
                        {isInTrial ? t("paywall.status.trial") : t("paywall.status.active")}
                      </Text>
                    </View>
                  </View>
                  {expirationDate && (
                    <Text style={styles.expirationText}>
                      {isInTrial ? t("paywall.trialEnd") : t("paywall.renewalDate")}
                      {format(expirationDate, "d MMMM yyyy", { locale: dateLocale })}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planPrice}>
                  {status === "trial" ? t("paywall.freeTrial") : "9,99€/mois"}
                </Text>
                <Text style={styles.planRenewal}>
                  {t("paywall.autoRenewal")}
                </Text>
              </View>
            </LinearGradient>

            {/* Features */}
            <Text style={styles.sectionTitle}>
              {t("paywall.featuresTitle")}
            </Text>
            <View style={styles.featuresList}>
              {features.map((feature, idx) => (
                <View
                  key={idx}
                  style={[styles.featureItem, idx < features.length - 1 && styles.featureBorder]}
                >
                  <View style={styles.featureIconSuccess}>
                    <Ionicons
                      name={feature.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                </View>
              ))}
            </View>

            {/* Manage subscription */}
            <Pressable style={styles.manageButton}>
              <View style={styles.manageLeft}>
                <Ionicons name="card-outline" size={24} color="#8B5CF6" />
                <Text style={styles.manageText}>{t("paywall.manageSubscription")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            <Text style={styles.disclaimerText}>
              {t("paywall.disclaimer")}
            </Text>
          </>
        ) : (
          <>
            {/* No subscription - upgrade prompt */}
            <View style={styles.upgradeHeader}>
              <LinearGradient
                colors={["#8B5CF6", "#6366F1"]}
                style={styles.upgradeIcon}
              >
                <Ionicons name="diamond" size={40} color="#fff" />
              </LinearGradient>
              <Text style={styles.upgradeTitle}>
                {t("paywall.titles.pro")}
              </Text>
              <Text style={styles.upgradeSubtitle}>
                {t("paywall.subtitles.pro")}
              </Text>
            </View>

            {/* Features preview */}
            <View style={styles.featuresList}>
              {features.map((feature, idx) => (
                <View
                  key={idx}
                  style={[styles.featureItem, idx < features.length - 1 && styles.featureBorder]}
                >
                  <View style={styles.featureIconPrimary}>
                    <Ionicons
                      name={feature.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color="#8B5CF6"
                    />
                  </View>
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <Pressable onPress={() => router.push("/(onboarding)/paywall")}>
              <LinearGradient
                colors={["#8B5CF6", "#6366F1"]}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaText}>
                  {t("paywall.cta.viewOffers")}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Restore */}
            <Pressable
              onPress={handleRestore}
              disabled={isRestoring}
              style={styles.restoreButton}
            >
              <Text style={styles.restoreText}>
                {isRestoring ? t("paywall.restoring") : t("paywall.restore")}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    // paddingTop handled dynamically
    paddingBottom: 16,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  activeCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  activeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  activeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  activeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    marginRight: 10,
    letterSpacing: -0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeTrial: {
    backgroundColor: "#F59E0B",
  },
  badgeActive: {
    backgroundColor: "#10B981",
  },
  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  expirationText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  planInfo: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planPrice: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  planRenewal: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
  },
  sectionTitle: {
    color: "#A78BFA",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 8,
  },
  featuresList: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  featureBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  featureIconSuccess: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureIconPrimary: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureLabel: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  manageButton: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  manageLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  manageText: {
    color: "white",
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimerText: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 12,
    marginTop: 24,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  upgradeHeader: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  upgradeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  upgradeTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  upgradeSubtitle: {
    color: "#A78BFA",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  ctaButton: {
    paddingVertical: 20,
    borderRadius: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  restoreButton: {
    paddingVertical: 20,
    alignItems: "center",
    marginTop: 8,
  },
  restoreText: {
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 14,
  },
});
