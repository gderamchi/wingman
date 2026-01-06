import { Stack } from "expo-router";

export default function CoachLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0F0F1A" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="preview" />
      <Stack.Screen name="context" />
      <Stack.Screen name="processing" />
      <Stack.Screen name="results" />
      <Stack.Screen name="editor" />
      <Stack.Screen name="outcome" />
      <Stack.Screen name="chat" />
    </Stack>
  );
}
