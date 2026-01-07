import "../global.css";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { validateSupabaseConfig } from "@/src/core/api/supabase";
import { useAuthStore } from "@/src/features/auth/stores/authStore";
import "@/src/i18n";
import { changeLanguage } from "@/src/i18n";
import { verifyInstallation } from "nativewind";

import { useSubscriptionStore } from "@/src/features/subscription/stores/subscriptionStore";


export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Custom dark theme matching our design
const WingmanDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#8B5CF6",
    background: "#0F0F1A",
    card: "#1A1A2E",
    text: "#FFFFFF",
    border: "#2D2D44",
    notification: "#8B5CF6",
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const profile = useAuthStore((state) => state.profile);

  // Sync language with profile
  useEffect(() => {
    if (profile?.language) {
      changeLanguage(profile.language as "en" | "fr");
    }
  }, [profile?.language]);

  // Verify NativeWind setup (only in development, inside effect to prevent Android crash)
  useEffect(() => {
    if (__DEV__) {
      verifyInstallation();
    }
  }, []);

  // Validate Supabase configuration on mount
  useEffect(() => {
    const configValidation = validateSupabaseConfig();
    if (!configValidation.isValid) {
      console.error("[ROOT] Supabase configuration validation failed:", configValidation.errors);
      // In development, we want to see this error clearly
      if (__DEV__) {
        console.error(
          "\n" +
          "═══════════════════════════════════════════════════════════════\n" +
          "  APP STARTUP ERROR: SUPABASE NOT CONFIGURED\n" +
          "═══════════════════════════════════════════════════════════════\n" +
          "The following configuration errors were found:\n" +
          configValidation.errors.map((err) => `  • ${err}`).join("\n") + "\n\n" +
          "To fix this:\n" +
          "  1. Create a .env file in the project root\n" +
          "  2. Add your Supabase credentials:\n" +
          "     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url\n" +
          "     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n" +
          "  3. Restart the development server\n\n" +
          "For local development, check supabase/config.toml\n" +
          "═══════════════════════════════════════════════════════════════\n"
        );
      }
    } else {
      console.log("[ROOT] Supabase configuration validated successfully");
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    console.log("[ROOT] Mounting RootLayout, calling initialize...");
    initialize().then(() => console.log("[ROOT] Initialize completed"))
      .catch(err => console.error("[ROOT] Initialize failed:", err));

    // Initialize subscription store
    useSubscriptionStore.getState().initialize();
  }, [initialize]);

  // Handle font loading errors
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Hide splash when ready
  useEffect(() => {
    if (loaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized]);

  if (!loaded || !isInitialized) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={WingmanDarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
