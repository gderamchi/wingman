import { router } from "expo-router";
import { useEffect } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/src/features/auth/stores/authStore";

export default function SplashScreen() {
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animate logo in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after animation
    const timer = setTimeout(() => {
      console.log("[SPLASH] Timer done. Session:", !!session, "Profile:", !!profile);
      if (session) {
        if (profile?.onboarding_completed) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(onboarding)");
        }
      } else {
        router.replace("/(auth)/welcome");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [session, profile]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Image
          source={require("@/assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 192, // w-48 (48 * 4 = 192)
    height: 192, // h-48
  },
});
