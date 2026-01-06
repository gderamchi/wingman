import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/features/auth/stores/authStore";
import {
    type BillingPeriod,
    formatPrice,
    getMonthlyEquivalent,
    getProductId,
    PLANS,
    type PlanTier,
} from "@/src/features/subscription/config/plans";
import { useSubscriptionStore } from "@/src/features/subscription/stores/subscriptionStore";

export default function PaywallScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("pro");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");

  const isPurchasing = useSubscriptionStore((s) => s.isPurchasing);
  const isRestoring = useSubscriptionStore((s) => s.isRestoring);
  const restore = useSubscriptionStore((s) => s.restore);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const packages = useSubscriptionStore((s) => s.packages);
  const purchase = useSubscriptionStore((s) => s.purchase);

  const currentPlan = PLANS.find((p) => p.id === selectedPlan)!;
  const price = billingPeriod === "monthly"
    ? currentPlan.monthlyPrice
    : currentPlan.yearlyPrice;

  const handlePurchase = async () => {
    // Find the correct package
    const productId = getProductId(selectedPlan, billingPeriod);
    const pkg = packages.find((p) => p.product.identifier === productId);

    if (!pkg) {
      // Try to reload offerings if empty
      if (packages.length === 0) {
        useSubscriptionStore.getState().loadOfferings();
      }

      console.error(`Product not found: ${productId}. Available: ${packages.map(p => p.product.identifier).join(", ")}`);

      if (packages.length === 0) {
        Alert.alert(t("common.error"), t("paywall.errorNoOffers"));
      } else {
        Alert.alert(t("common.error"), t("paywall.errorUnavailable"));
      }
      return;
    }

    try {
      const success = await purchase(pkg);
      if (success) {
        await updateProfile({ onboarding_completed: true });
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      Alert.alert(t("common.error"), t("paywall.errorPurchase"));
    }
  };

  const handleRestore = async () => {
    try {
      const success = await restore();
      if (success) {
        await updateProfile({ onboarding_completed: true });
        Alert.alert(t("paywall.restoreSuccess"), t("paywall.restoreSuccessMessage"));
        router.replace("/(tabs)");
      } else {
        Alert.alert(t("paywall.noRestore"), t("paywall.noRestoreMessage"));
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert(t("common.error"), t("paywall.errorRestore"));
    }
  };

  const handleSkip = async () => {
    try {
      await updateProfile({ onboarding_completed: true });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Skip error:", error);
      // Even if profile update fails, we should probably let them in?
      // But let's show the error first as requested by user to debug.
      Alert.alert(t("common.error"), t("common.errorGeneric", { message: error instanceof Error ? error.message : "Inconnue" }));
    }
  };

  // Attempt to load offerings if empty
  useEffect(() => {
    if (packages.length === 0) {
      useSubscriptionStore.getState().loadOfferings();
    }
  }, [packages.length]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>{t("paywall.title")}</Text>
          <Text style={styles.subtitle}>{t("paywall.subtitle")}</Text>
        </View>

        {/* Billing toggle */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            <Pressable
              onPress={() => setBillingPeriod("monthly")}
              style={[
                styles.toggleButton,
                billingPeriod === "monthly" && styles.toggleButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingPeriod === "monthly" && styles.toggleTextActive,
                ]}
              >
                {t("paywall.monthly")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setBillingPeriod("yearly")}
              style={[
                styles.toggleButton,
                billingPeriod === "yearly" && styles.toggleButtonActive,
              ]}
            >
              <View style={styles.toggleYearlyContent}>
                <Text
                  style={[
                    styles.toggleText,
                    billingPeriod === "yearly" && styles.toggleTextActive,
                  ]}
                >
                  {t("paywall.yearly")}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-37%</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const displayPrice = billingPeriod === "monthly"
              ? plan.monthlyPrice
              : plan.yearlyPrice;
            const monthlyEquiv = billingPeriod === "yearly"
              ? getMonthlyEquivalent(plan.yearlyPrice)
              : null;

            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                ]}
              >
                {/* Recommended badge */}
                {plan.recommended && (
                  <LinearGradient
                    colors={["#8B5CF6", "#6366F1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.recommendedBadge}
                  >
                    <Text style={styles.recommendedText}>⭐ {t("paywall.recommended")}</Text>
                  </LinearGradient>
                )}

                <View style={[styles.planContent, isSelected && styles.planContentSelected]}>
                  {/* Plan header */}
                  <View style={styles.planHeader}>
                    <View style={styles.planNameRow}>
                      <View
                        style={[
                          styles.radioOuter,
                          isSelected && styles.radioOuterSelected,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.planName}>{t(plan.name)}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceText}>
                        {formatPrice(displayPrice)}
                        <Text style={styles.pricePeriod}>
                          /{billingPeriod === "monthly" ? t("paywall.month") : t("paywall.year")}
                        </Text>
                      </Text>
                      {monthlyEquiv && (
                        <Text style={styles.monthlyEquiv}>
                          ≈ {formatPrice(monthlyEquiv)}/{t("paywall.month")}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Features */}
                  <View style={styles.featuresContainer}>
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <View key={idx} style={styles.featureRow}>
                        <Ionicons
                          name={feature.included ? "checkmark-circle" : "close-circle"}
                          size={16}
                          color={feature.included ? (feature.highlight ? "#8B5CF6" : "#10B981") : "#6B7280"}
                        />
                        <Text
                          style={[
                            styles.featureText,
                            !feature.included && styles.featureTextDisabled,
                            feature.highlight && styles.featureTextHighlight,
                          ]}
                        >
                          {t(feature.label)}
                        </Text>
                      </View>
                    ))}
                    {plan.features.length > 4 && (
                      <Text style={styles.moreFeatures}>
                        + {plan.features.length - 4} {t("paywall.moreFeatures")}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Trial info */}
        <View style={styles.trialInfo}>
          <View style={styles.trialContent}>
            <Ionicons name="gift" size={24} color="#10B981" />
            <View style={styles.trialTextContainer}>
              <Text style={styles.trialTitle}>{t("paywall.trialTitle")}</Text>
              <Text style={styles.trialSubtitle}>{t("paywall.trialSubtitle")}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <Pressable onPress={handlePurchase} disabled={isPurchasing}>
          <LinearGradient
            colors={isPurchasing ? ["#4B5563", "#374151"] : ["#8B5CF6", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.ctaTextContainer}>
                <Text style={styles.ctaTitle}>{t("paywall.startTrial")}</Text>
                <Text style={styles.ctaSubtitle}>
                  {t("paywall.then")} {formatPrice(price)}/{billingPeriod === "monthly" ? t("paywall.month") : t("paywall.year")}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Pressable>

        {/* Secondary actions */}
        <View style={styles.secondaryActions}>
          <Pressable onPress={handleRestore} disabled={isRestoring} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>
              {isRestoring ? t("paywall.restoring") : t("paywall.restore")}
            </Text>
          </Pressable>
          <Text style={styles.separator}>•</Text>
          <Pressable onPress={handleSkip} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>{t("paywall.skip")}</Text>
          </Pressable>
        </View>
      </View>
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
  header: {
    paddingHorizontal: 24,
    // paddingTop handled dynamically
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  toggleContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  toggleWrapper: {
    flexDirection: "row",
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#0F0F1A",
  },
  toggleText: {
    textAlign: "center",
    fontWeight: "500",
    color: "#6B7280",
  },
  toggleTextActive: {
    color: "white",
  },
  toggleYearlyContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  discountBadge: {
    backgroundColor: "#10B981",
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  plansContainer: {
    paddingHorizontal: 24,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  planCardSelected: {
    borderColor: "#8B5CF6",
  },
  recommendedBadge: {
    paddingVertical: 4,
  },
  recommendedText: {
    color: "white",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
  },
  planContent: {
    padding: 16,
    backgroundColor: "#1A1A2E",
  },
  planContentSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6B7280",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: "#8B5CF6",
    backgroundColor: "#8B5CF6",
  },
  planName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  pricePeriod: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "normal",
  },
  monthlyEquiv: {
    color: "#10B981",
    fontSize: 14,
  },
  featuresContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: "white",
  },
  featureTextDisabled: {
    color: "#6B7280",
  },
  featureTextHighlight: {
    color: "#8B5CF6",
    fontWeight: "500",
  },
  moreFeatures: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
  trialInfo: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  trialContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  trialTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  trialTitle: {
    color: "#10B981",
    fontWeight: "600",
  },
  trialSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: "#0F0F1A",
    borderTopWidth: 1,
    borderTopColor: "#1A1A2E",
  },
  ctaButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  ctaTextContainer: {
    alignItems: "center",
  },
  ctaTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  ctaSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  secondaryText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  separator: {
    color: "#4B5563",
    paddingVertical: 8,
  },
});
