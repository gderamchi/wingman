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
    paddingHorizontal: 16,
    // paddingTop handled dynamically
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
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  activeCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  activeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  activeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeTrial: {
    backgroundColor: "#F59E0B", // bg-warning
  },
  badgeActive: {
    backgroundColor: "#10B981", // bg-success
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  expirationText: {
    color: "#9CA3AF", // text-gray-400
    marginTop: 4,
  },
  planInfo: {
    backgroundColor: "rgba(15, 15, 26, 0.5)", // bg-dark/50
    borderRadius: 12,
    padding: 16,
  },
  planPrice: {
    color: "white",
    fontWeight: "500",
  },
  planRenewal: {
    color: "#9CA3AF", // text-gray-400
    fontSize: 14,
  },
  sectionTitle: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  featuresList: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  featureBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#0F0F1A", // border-dark
  },
  featureIconSuccess: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(16, 185, 129, 0.2)", // bg-success/20
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureIconPrimary: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureLabel: {
    color: "white",
  },
  manageButton: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  manageLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  manageText: {
    color: "white",
    marginLeft: 12,
  },
  disclaimerText: {
    color: "#6B7280", // text-gray-500
    textAlign: "center",
    fontSize: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  upgradeHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  upgradeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  upgradeSubtitle: {
    color: "#9CA3AF", // text-gray-400
    textAlign: "center",
  },
  ctaButton: {
    paddingVertical: 16,
    borderRadius: 16,
  },
  ctaText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  restoreButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  restoreText: {
    color: "#9CA3AF", // text-gray-400
  },
});
