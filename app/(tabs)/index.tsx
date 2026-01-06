import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAnalysisStore } from "@/src/features/analysis/stores/analysisStore";

const QUICK_ACTIONS = [
  {
    id: "approach",
    icon: "hand-left",
    label: "Première approche",
    subLabel: "Dating • Playful",
    params: { relationship: "match", objective: "flirt", goal: "dating", style: "playful" }
  },
  {
    id: "revive",
    icon: "chatbubbles",
    label: "Relancer",
    subLabel: "Dating • Reconnect",
    params: { relationship: "match", objective: "reconnect", goal: "dating", style: "playful", additionalContext: "Elle ne répond plus" }
  },
  {
    id: "flirt",
    icon: "flame",
    label: "Séduction",
    subLabel: "Dating • Direct",
    params: { relationship: "match", objective: "date", goal: "dating", style: "direct" }
  }
];

export default function CoachScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [pendingParams, setPendingParams] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");
      if (!hasSeen) {
        setShowOnboarding(true);
      }
    } catch (e) {
      console.error("Error checking onboarding status", e);
    }
  };

  const dismissOnboarding = async () => {
    setShowOnboarding(false);
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
    } catch (e) {
      console.error("Error saving onboarding status", e);
    }
  };

  const setScreenshot = useAnalysisStore((s) => s.setScreenshot);
  const resetAnalysis = useAnalysisStore((s) => s.resetAnalysis);

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setPendingParams(action.params);
    setShowSourcePicker(true);
  };

  const handlePickImage = async (source: "camera" | "gallery") => {
    setShowSourcePicker(false);
    setIsLoading(true);

    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission refusée", "L'accès à la caméra est nécessaire");
          setIsLoading(false);
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
          allowsEditing: false,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission refusée", "L'accès à la galerie est nécessaire");
          setIsLoading(false);
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
          allowsEditing: false,
        });
      }

      if (!result.canceled && result.assets[0]) {
        resetAnalysis();
        setScreenshot(result.assets[0].uri);
        // Pass params to preview if we have any pending from quick actions
        router.push({
          pathname: "/(tabs)/coach/preview",
          params: pendingParams || undefined
        });
        setPendingParams(null);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t("coach.title")}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Onboarding Card */}
        {showOnboarding && (
          <View className="mx-6 mt-6 mb-2 p-5 rounded-2xl bg-[#2D1B4E] border border-purple-500/30 relative overflow-hidden">
             <LinearGradient
                colors={["rgba(139, 92, 246, 0.1)", "transparent"]}
                className="absolute inset-0"
             />
             <View className="flex-row items-center justify-between mb-4">
               <View className="flex-row items-center gap-2">
                 <View className="w-8 h-8 rounded-full bg-purple-500/20 items-center justify-center border border-purple-500/40">
                   <Ionicons name="sparkles" size={16} color="#D8B4FE" />
                 </View>
                 <Text className="text-white font-bold text-base">Comment ça marche ?</Text>
               </View>
               <Pressable onPress={dismissOnboarding} hitSlop={10} className="w-6 h-6 items-center justify-center rounded-full bg-black/20">
                 <Ionicons name="close" size={14} color="rgba(255,255,255,0.7)" />
               </Pressable>
             </View>

             <View className="gap-3">
               <View className="flex-row items-center gap-3">
                 <View className="w-5 h-5 rounded-full bg-purple-500/20 items-center justify-center">
                    <Text className="text-purple-300 font-bold text-xs">1</Text>
                 </View>
                 <Text className="text-gray-300 text-sm flex-1">Capturez ou importez une conversation</Text>
               </View>
               <View className="flex-row items-center gap-3">
                 <View className="w-5 h-5 rounded-full bg-purple-500/20 items-center justify-center">
                    <Text className="text-purple-300 font-bold text-xs">2</Text>
                 </View>
                 <Text className="text-gray-300 text-sm flex-1">Choisissez votre objectif & style</Text>
               </View>
               <View className="flex-row items-center gap-3">
                 <View className="w-5 h-5 rounded-full bg-purple-500/20 items-center justify-center">
                    <Text className="text-purple-300 font-bold text-xs">3</Text>
                 </View>
                 <Text className="text-gray-300 text-sm flex-1">Obtenez la réponse parfaite</Text>
               </View>
             </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="px-6 pt-6 pb-2">
          <Text className="text-white font-bold text-lg mb-4">{t("coach.quickActions") || "Accès rapide"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3 -mx-6 px-6">
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => handleQuickAction(action)}
                className="bg-[#1A1A2E] p-4 rounded-2xl border border-white/5 active:bg-white/5 w-40"
              >
                <View className="w-10 h-10 rounded-full bg-purple-500/10 items-center justify-center mb-3">
                  <Ionicons name={action.icon as any} size={20} color="#8B5CF6" />
                </View>
                <Text className="text-white font-semibold mb-1">{action.label}</Text>
                <Text className="text-gray-500 text-xs">{action.subLabel}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Empty state / Main CTA */}
        <View style={styles.emptyContainer}>
          {/* Illustration */}
          <View style={styles.emptyIllustration}>
            <Image
              source={require("@/assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Text */}
          <Text style={styles.emptyTitle}>
            {t("coach.empty.title")}
          </Text>
          <Text style={styles.emptySubtitle}>
            {t("coach.empty.subtitle")}
          </Text>

          {/* CTA */}
          <Pressable
            onPress={() => setShowSourcePicker(true)}
            disabled={isLoading}
            style={styles.ctaButton}
          >
            <LinearGradient
              colors={["#8B5CF6", "#6366F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={24} color="#fff" />
                  <Text style={styles.ctaText}>
                    {t("coach.empty.cta")}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>

      {/* Source picker modal */}
      {showSourcePicker && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setShowSourcePicker(false)}
        >
          {/* Backdrop with blur effect */}
          <View className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Bottom Sheet */}
          <View className="absolute bottom-0 left-0 right-0 justify-end">
            <View className="bg-[#191022] w-full rounded-t-[32px] border-t border-white/10 pb-8 overflow-hidden shadow-2xl">
              {/* Handle */}
              <View className="w-full items-center pt-3 pb-2">
                <View className="h-1.5 w-12 rounded-full bg-white/20" />
              </View>

              {/* Header */}
              <View className="px-6 pt-2 pb-6 items-center">
                <Text className="text-white text-2xl font-bold tracking-tight text-center">
                  {t("coach.sourcePicker.title")}
                </Text>
                <Text className="text-white/40 text-sm font-medium mt-1 text-center">
                  {t("coach.sourcePicker.subtitle")}
                </Text>
              </View>

              {/* Actions List */}
              <View className="px-4 gap-3">
                {/* Gallery Action */}
                <Pressable
                  onPress={() => handlePickImage("gallery")}
                  className="w-full flex-row items-center gap-4 bg-[#231630] active:bg-[#8B5CF6]/10 p-4 rounded-2xl border border-white/5 active:border-[#8B5CF6]/30"
                >
                  <View className="items-center justify-center rounded-xl bg-[#8B5CF6]/20 w-12 h-12">
                    <Ionicons name="images" size={24} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-semibold">
                      {t("coach.sourcePicker.import")}
                    </Text>
                    <Text className="text-white/40 text-xs font-medium">
                      {t("coach.sourcePicker.fromGallery")}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.2)" />
                </Pressable>

                {/* Camera Action */}
                <Pressable
                  onPress={() => handlePickImage("camera")}
                  className="w-full flex-row items-center gap-4 bg-[#231630] active:bg-[#8B5CF6]/10 p-4 rounded-2xl border border-white/5 active:border-[#8B5CF6]/30"
                >
                   <View className="items-center justify-center rounded-xl bg-[#8B5CF6]/20 w-12 h-12">
                    <Ionicons name="camera" size={24} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-semibold">
                      {t("coach.sourcePicker.takePhoto")}
                    </Text>
                    <Text className="text-white/40 text-xs font-medium">
                      {t("coach.sourcePicker.useCamera")}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.2)" />
                </Pressable>
              </View>

              {/* Footer Privacy Note */}
              <View className="mt-8 px-6 items-center">
                <View className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                  <Ionicons name="shield-checkmark" size={16} color="#4ADE80" />
                  <Text className="text-[#ad90cb] text-xs font-medium text-center">
                    {t("coach.sourcePicker.privacy")}
                  </Text>
                </View>
              </View>

              <View className="h-6" />
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIllustration: {
    width: 160,
    height: 160,
    backgroundColor: "rgba(139, 92, 246, 0.1)", // bg-primary/10
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  logo: {
    width: 96,
    height: 96,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#9CA3AF", // text-gray-400
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  ctaButton: {
    width: "100%",
  },
  ctaGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});
