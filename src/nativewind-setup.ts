/**
 * NativeWind cssInterop setup for third-party components
 * This file must be imported early in the app (before components using className on these elements)
 */
import { cssInterop } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";

// Register LinearGradient with NativeWind so className prop works
cssInterop(LinearGradient, {
  className: "style",
});
