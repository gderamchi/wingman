import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0F0F1A" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="language" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="support" />
    </Stack>
  );
}
