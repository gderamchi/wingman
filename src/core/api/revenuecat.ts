import { Platform } from "react-native";
import Purchases, {
    CustomerInfo,
    PurchasesOffering,
    PurchasesPackage,
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
   * Initialize RevenueCat SDK
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return;

    const apiKey = Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
      console.warn("RevenueCat API key not configured");
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
      console.log("RevenueCat initialized successfully");
    } catch (error) {
      console.error("Failed to initialize RevenueCat:", error);
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
      console.error("Failed to login to RevenueCat:", error);
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
      console.error("Failed to logout from RevenueCat:", error);
    }
  }

  /**
   * Get available offerings
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error("Failed to get offerings:", error);
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
      console.error("Failed to get customer info:", error);
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
      console.error("Failed to check pro access:", error);
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
      const purchaseError = error as { userCancelled?: boolean; message?: string };

      if (purchaseError.userCancelled) {
        return { success: false, customerInfo: null, error: "cancelled" };
      }

      console.error("Purchase failed:", error);
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
      console.error("Restore failed:", error);
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
      console.error("Failed to get expiration date:", error);
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
      console.error("Failed to check trial status:", error);
      return false;
    }
  }
}

export const revenueCat = new RevenueCatService();
