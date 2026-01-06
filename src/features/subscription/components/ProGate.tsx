import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useIsProUser } from "@/src/features/subscription/stores/subscriptionStore";

interface ProGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
}

/**
 * Component that gates content behind Pro subscription
 * Shows upgrade prompt for non-pro users
 */
export function ProGate({ children, fallback, featureName }: ProGateProps) {
  const isProUser = useIsProUser();

  if (isProUser) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View style={styles.gateContainer}>
      <LinearGradient
        colors={["#8B5CF6", "#6366F1"]}
        style={styles.iconGradient}
      >
        <Ionicons name="diamond" size={28} color="#fff" />
      </LinearGradient>
      <Text style={styles.gateTitle}>
        {featureName ? `${featureName} est réservé aux PRO` : "Fonctionnalité PRO"}
      </Text>
      <Text style={styles.gateDescription}>
        Passe à Wingman PRO pour débloquer cette fonctionnalité et bien plus.
      </Text>
      <Pressable
        onPress={() => router.push("/(onboarding)/paywall")}
        style={styles.upgradeButton}
      >
        <Text style={styles.upgradeButtonText}>Voir les offres PRO</Text>
      </Pressable>
    </View>
  );
}

interface ProBadgeProps {
  size?: "sm" | "md";
}

/**
 * PRO badge to show on premium features
 */
export function ProBadge({ size = "md" }: ProBadgeProps) {
  const isProUser = useIsProUser();

  if (isProUser) return null;

  if (size === "sm") {
    return (
      <View style={styles.badgeSm}>
        <Text style={styles.badgeTextSm}>PRO</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#8B5CF6", "#6366F1"]}
      style={styles.badgeMd}
    >
      <Text style={styles.badgeTextMd}>PRO</Text>
    </LinearGradient>
  );
}

interface UsageLimitProps {
  current: number;
  max: number;
  label?: string;
  onUpgrade?: () => void;
}

/**
 * Component to show usage limits for free users
 */
export function UsageLimit({ current, max, label, onUpgrade }: UsageLimitProps) {
  const isProUser = useIsProUser();
  const remaining = max - current;
  const percentage = (current / max) * 100;

  if (isProUser) return null;

  return (
    <View style={styles.limitContainer}>
      <View style={styles.limitHeader}>
        <Text style={styles.limitLabel}>
          {label ?? "Utilisations restantes"}
        </Text>
        <View style={styles.limitCountContainer}>
          <Text style={remaining <= 1 ? styles.limitCountWarning : styles.limitCountNormal}>
            {remaining}/{max}
          </Text>
        </View>
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%` },
            percentage >= 80 && styles.progressBarFillWarning,
          ]}
        />
      </View>
      {remaining <= 1 && (
        <Pressable
          onPress={onUpgrade ?? (() => router.push("/(onboarding)/paywall"))}
          style={styles.limitUpgradeButton}
        >
          <Ionicons name="diamond" size={16} color="#8B5CF6" />
          <Text style={styles.limitUpgradeText}>
            Passer à PRO pour un accès illimité
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gateContainer: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  gateTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  gateDescription: {
    color: "#9CA3AF", // text-gray-400
    textAlign: "center",
    fontSize: 14,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: "#8B5CF6", // bg-primary
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: "white",
    fontWeight: "500",
  },
  badgeSm: {
    backgroundColor: "#8B5CF6", // bg-primary
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextSm: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeTextMd: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  limitContainer: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  limitHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  limitLabel: {
    color: "white",
    fontWeight: "500",
  },
  limitCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  limitCountWarning: {
    color: "#F59E0B", // text-warning
    fontWeight: "bold",
  },
  limitCountNormal: {
    color: "#9CA3AF", // text-gray-400
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#0F0F1A", // bg-dark
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#8B5CF6", // bg-primary
    borderRadius: 4,
  },
  progressBarFillWarning: {
    backgroundColor: "#F59E0B", // bg-warning
  },
  limitUpgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    paddingVertical: 8,
    borderRadius: 8,
  },
  limitUpgradeText: {
    color: "#8B5CF6", // text-primary
    fontWeight: "500",
    marginLeft: 8,
  },
});
