import { Platform } from "react-native";
import Purchases, {
    CustomerInfo,
    PurchasesOffering,
    PurchasesPackage
} from "react-native-purchases";

// RevenueCat API Keys
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? "";
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? "";

// Entitlement identifiers
export const ENTITLEMENTS = {
  PRO: "pro",
} as const;

// Product identifiers
export const PRODUCTS = {
  MONTHLY: "wingman_pro_monthly",
  YEARLY: "wingman_pro_yearly",
} as const;

class RevenueCatService {
  private initialized = false;

  /**
   * Helper to mask API key for logging
   */
  private maskKey(key: string): string {
    if (!key) return "(empty)";
    if (key.length < 8) return "******";
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  /**
   * Helper to handle RevenueCat errors
   */
  private handleError(context: string, error: unknown): void {
    const purchasesError = error as { code?: number; message?: string };

    // Code 10 is NetworkError in RevenueCat
    if (purchasesError.code === 10) {
      console.warn(`[RevenueCat] Network error in ${context}. Check internet connection.`);
      return;
    }

    console.error(`[RevenueCat] Failed to ${context}:`, error);
  }

  /**
   * Initialize RevenueCat SDK
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return;

    const apiKey = Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

    console.log(`[RevenueCat] Initializing with API Key: ${this.maskKey(apiKey)} (User: ${userId ?? "anonymous"})`);

    if (!apiKey) {
      console.warn("[RevenueCat] API key not configured. Check your .env file.");
      return;
    }

    try {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

      if (userId) {
        await Purchases.configure({ apiKey, appUserID: userId });
      } else {
        await Purchases.configure({ apiKey });
      }

      this.initialized = true;
      console.log("[RevenueCat] initialized successfully");
    } catch (error) {
      this.handleError("initialize", error);
    }
  }

  /**
   * Log in user to RevenueCat
   */
  async login(userId: string): Promise<CustomerInfo | null> {
    try {
      const { customerInfo } = await Purchases.logIn(userId);
      return customerInfo;
    } catch (error) {
      this.handleError("login", error);
      return null;
    }
  }

  /**
   * Log out user from RevenueCat
   */
  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (error) {
      this.handleError("logout", error);
    }
  }

  /**
   * Get available offerings
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      if (!this.initialized) {
        // Try to re-initialize if needed, or just return null
        // Here we just warn
        console.warn("[RevenueCat] Cannot get offerings: Not initialized");
        return null;
      }
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      this.handleError("get offerings", error);
      return null;
    }
  }

  /**
   * Get customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      this.handleError("get customer info", error);
      return null;
    }
  }

  /**
   * Check if user has pro entitlement
   */
  async hasProAccess(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;
    } catch (error) {
      // Don't log error for network issues on simple checks
      const purchasesError = error as { code?: number };
      if (purchasesError.code === 10) {
        // Silent or warn
        console.warn("[RevenueCat] Network error checking pro access.");
      } else {
        console.error("Failed to check pro access:", error);
      }
      return false;
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<{
    success: boolean;
    customerInfo: CustomerInfo | null;
    error?: string;
  }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return { success: true, customerInfo };
    } catch (error: unknown) {
      const purchaseError = error as { userCancelled?: boolean; message?: string; code?: number };

      if (purchaseError.userCancelled) {
        return { success: false, customerInfo: null, error: "cancelled" };
      }

      this.handleError("purchase package", error);

      return {
        success: false,
        customerInfo: null,
        error: purchaseError.message ?? "Purchase failed",
      };
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<{
    success: boolean;
    customerInfo: CustomerInfo | null;
    error?: string;
  }> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasAccess = customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;
      return { success: hasAccess, customerInfo };
    } catch (error: unknown) {
      this.handleError("restore purchases", error);
      return {
        success: false,
        customerInfo: null,
        error: (error as Error).message ?? "Restore failed",
      };
    }
  }

  /**
   * Get expiration date for pro entitlement
   */
  async getProExpirationDate(): Promise<Date | null> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const proEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];

      if (proEntitlement?.expirationDate) {
        return new Date(proEntitlement.expirationDate);
      }

      return null;
    } catch (error) {
      this.handleError("get expiration date", error);
      return null;
    }
  }

  /**
   * Check if user is in trial period
   */
  async isInTrialPeriod(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const proEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];
      return proEntitlement?.periodType === "TRIAL";
    } catch (error) {
      this.handleError("check trial status", error);
      return false;
    }
  }
}

export const revenueCat = new RevenueCatService();
