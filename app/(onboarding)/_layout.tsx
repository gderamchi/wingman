import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0F0F1A" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="style" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="paywall" />
    </Stack>
  );
}
