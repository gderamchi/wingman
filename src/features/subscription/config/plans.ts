// Subscription plan types and pricing configuration

export type PlanTier = "starter" | "pro" | "elite";
export type BillingPeriod = "monthly" | "yearly";

export interface PlanConfig {
  id: PlanTier;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  recommended?: boolean;
  features: PlanFeature[];
  limits: PlanLimits;
}

export interface PlanFeature {
  label: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanLimits {
  analysesPerWeek: number | "unlimited";
  replyVariants: number;
  historyDays: number | "unlimited";
  priorityLatency: boolean;
  advancedToneSlider: boolean;
  coachMode: "basic" | "full" | "premium";
  premiumChallenges: boolean;
  detailedAudit: boolean;
}

// Product identifiers (must match RevenueCat)
export const PRODUCT_IDS = {
  STARTER_MONTHLY: "wingman_starter_monthly",
  STARTER_YEARLY: "wingman_starter_yearly",
  PRO_MONTHLY: "wingman_pro_monthly",
  PRO_YEARLY: "wingman_pro_yearly",
  ELITE_MONTHLY: "wingman_elite_monthly",
  ELITE_YEARLY: "wingman_elite_yearly",
} as const;

// Pricing configuration
export const PLANS: PlanConfig[] = [
  {
    id: "starter",
    name: "paywall.plans.starter.name",
    monthlyPrice: 9.99,
    yearlyPrice: 79.99,
    yearlyDiscount: 33,
    features: [
      { label: "paywall.plans.starter.features.aiAnalysis", included: true },
      { label: "paywall.plans.starter.features.chat", included: true },
      { label: "paywall.plans.starter.features.community", included: true },
      { label: "paywall.plans.starter.features.historyLimit", included: true },
      { label: "paywall.plans.starter.features.replyVariants", included: true },
      { label: "paywall.plans.starter.features.toneSlider", included: false },
      { label: "paywall.plans.starter.features.coachMode", included: false },
    ],
    limits: {
      analysesPerWeek: 10,
      replyVariants: 3,
      historyDays: 30,
      priorityLatency: false,
      advancedToneSlider: false,
      coachMode: "basic",
      premiumChallenges: false,
      detailedAudit: false,
    },
  },
  {
    id: "pro",
    name: "paywall.plans.pro.name",
    monthlyPrice: 19.99,
    yearlyPrice: 149.99,
    yearlyDiscount: 37,
    recommended: true,
    features: [
      { label: "paywall.plans.pro.features.unlimited", included: true, highlight: true },
      { label: "paywall.plans.pro.features.allVariants", included: true, highlight: true },
      { label: "paywall.plans.pro.features.fullHistory", included: true },
      { label: "paywall.plans.pro.features.toneSlider", included: true },
      { label: "paywall.plans.pro.features.coachMode", included: true },
      { label: "paywall.plans.pro.features.reviews", included: true },
      { label: "paywall.plans.pro.features.bestAI", included: true, highlight: true },
    ],
    limits: {
      analysesPerWeek: "unlimited",
      replyVariants: 6,
      historyDays: "unlimited",
      priorityLatency: false,
      advancedToneSlider: true,
      coachMode: "full",
      premiumChallenges: false,
      detailedAudit: false,
    },
  },
  {
    id: "elite",
    name: "paywall.plans.elite.name",
    monthlyPrice: 39.99,
    yearlyPrice: 299.99,
    yearlyDiscount: 36,
    features: [
      { label: "paywall.plans.elite.features.allPro", included: true },
      { label: "paywall.plans.elite.features.priority", included: true, highlight: true },
      { label: "paywall.plans.elite.features.premiumCoach", included: true, highlight: true },
      { label: "paywall.plans.elite.features.scripts", included: true },
      { label: "paywall.plans.elite.features.challenges", included: true },
      { label: "paywall.plans.elite.features.audit", included: true, highlight: true },
      { label: "paywall.plans.elite.features.support", included: true },
    ],
    limits: {
      analysesPerWeek: "unlimited",
      replyVariants: 10,
      historyDays: "unlimited",
      priorityLatency: true,
      advancedToneSlider: true,
      coachMode: "premium",
      premiumChallenges: true,
      detailedAudit: true,
    },
  },
];

// Helper functions
export function getPlanById(id: PlanTier): PlanConfig | undefined {
  return PLANS.find((p) => p.id === id);
}

export function formatPrice(price: number): string {
  return `${price.toFixed(2).replace(".", ",")}€`;
}

export function getMonthlyEquivalent(yearlyPrice: number): number {
  return Math.round((yearlyPrice / 12) * 100) / 100;
}

export function getProductId(tier: PlanTier, period: BillingPeriod): string {
  const key = `${tier.toUpperCase()}_${period.toUpperCase()}` as keyof typeof PRODUCT_IDS;
  return PRODUCT_IDS[key];
}
