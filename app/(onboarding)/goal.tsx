import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/src/features/auth/stores/authStore";

export default function GoalScreen() {
  const updateProfile = useAuthStore((state) => state.updateProfile);

  useEffect(() => {
    const autoSelectGoal = async () => {
      try {
        // Auto-select dating and skip to style
        await updateProfile({ main_goal: "dating" });
        router.replace("/(onboarding)/style");
      } catch (error) {
        console.error("Failed to update profile:", error);
        // Fallback: still try to go next
        router.replace("/(onboarding)/style");
      }
    };

    autoSelectGoal();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
    alignItems: "center",
    justifyContent: "center",
  },
});
