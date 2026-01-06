import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CustomerInfo, PurchasesPackage } from "react-native-purchases";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ENTITLEMENTS, revenueCat } from "@/src/core/api/revenuecat";
import { supabase } from "@/src/core/api/supabase";

export type SubscriptionStatus = "none" | "trial" | "active" | "expired" | "cancelled";

interface SubscriptionState {
  // State
  status: SubscriptionStatus;
  isProUser: boolean;
  expirationDate: Date | null;
  isInTrial: boolean;
  packages: PurchasesPackage[];

  // Loading states
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;

  // Error
  error: string | null;

  // Actions
  initialize: (userId?: string) => Promise<void>;
  loadOfferings: () => Promise<void>;
  checkProAccess: () => Promise<boolean>;

  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;

  syncWithDatabase: (userId: string, customerInfo: CustomerInfo) => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Initial state
      status: "none",
      isProUser: false,
      expirationDate: null,
      isInTrial: false,
      packages: [],
      isLoading: false,
      isPurchasing: false,
      isRestoring: false,
      error: null,

      // Initialize RevenueCat
      initialize: async (userId) => {
        set({ isLoading: true, error: null });

        try {
          await revenueCat.initialize(userId);

          if (userId) {
            await revenueCat.login(userId);
          }

          // Check current status
          const hasAccess = await revenueCat.hasProAccess();
          const isInTrial = await revenueCat.isInTrialPeriod();
          const expirationDate = await revenueCat.getProExpirationDate();

          set({
            isProUser: hasAccess,
            isInTrial,
            expirationDate,
            status: hasAccess
              ? isInTrial
                ? "trial"
                : "active"
              : "none",
            isLoading: false,
          });

          // Load offerings
          await get().loadOfferings();
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to initialize",
            isLoading: false,
          });
        }
      },

      // Load available packages
      loadOfferings: async () => {
        try {
          const offering = await revenueCat.getOfferings();

          if (offering?.availablePackages) {
            set({ packages: offering.availablePackages });
          }
        } catch (error) {
          console.error("Failed to load offerings:", error);
        }
      },

      // Check pro access
      checkProAccess: async () => {
        const hasAccess = await revenueCat.hasProAccess();
        const isInTrial = await revenueCat.isInTrialPeriod();

        set({
          isProUser: hasAccess,
          isInTrial,
          status: hasAccess
            ? isInTrial
              ? "trial"
              : "active"
            : "none",
        });

        return hasAccess;
      },

      // Purchase a package
      purchase: async (pkg) => {
        set({ isPurchasing: true, error: null });

        try {
          const result = await revenueCat.purchasePackage(pkg);

          if (result.success && result.customerInfo) {
            const hasAccess =
              result.customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;
            const isInTrial =
              result.customerInfo.entitlements.active[ENTITLEMENTS.PRO]?.periodType === "TRIAL";

            set({
              isProUser: hasAccess,
              isInTrial,
              status: hasAccess ? (isInTrial ? "trial" : "active") : "none",
              isPurchasing: false,
            });

            return true;
          }

          if (result.error === "cancelled") {
            set({ isPurchasing: false });
            return false;
          }

          set({
            error: result.error ?? "Purchase failed",
            isPurchasing: false,
          });
          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Purchase failed",
            isPurchasing: false,
          });
          return false;
        }
      },

      // Restore purchases
      restore: async () => {
        set({ isRestoring: true, error: null });

        try {
          const result = await revenueCat.restorePurchases();

          if (result.success && result.customerInfo) {
            const hasAccess =
              result.customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;

            set({
              isProUser: hasAccess,
              status: hasAccess ? "active" : "none",
              isRestoring: false,
            });

            return true;
          }

          set({
            error: result.error ?? "No purchases to restore",
            isRestoring: false,
          });
          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Restore failed",
            isRestoring: false,
          });
          return false;
        }
      },

      // Sync subscription status with database
      syncWithDatabase: async (userId, customerInfo) => {
        try {
          const proEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];

          await supabase.from("subscriptions").upsert({
            user_id: userId,
            status: proEntitlement
              ? proEntitlement.periodType === "TRIAL"
                ? "trial"
                : "active"
              : "expired",
            plan: proEntitlement?.productIdentifier,
            trial_end: proEntitlement?.periodType === "TRIAL"
              ? proEntitlement.expirationDate
              : null,
            current_period_end: proEntitlement?.expirationDate,
            revenuecat_id: customerInfo.originalAppUserId,
            updated_at: new Date().toISOString(),
          } as any as never);
        } catch (error) {
          console.error("Failed to sync subscription with database:", error);
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "wingman-subscription",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        status: state.status,
        isProUser: state.isProUser,
        isInTrial: state.isInTrial,
      }),
    }
  )
);

// Selectors
export const useIsProUser = () => useSubscriptionStore((s) => s.isProUser);
export const useSubscriptionStatus = () => useSubscriptionStore((s) => s.status);
