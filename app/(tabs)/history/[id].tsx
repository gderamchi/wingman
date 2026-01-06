import { supabase } from "@/src/core/api/supabase";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalysis() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }
        setAnalysis(data);
      } catch (e) {
        console.error("Error fetching analysis:", e);
        Alert.alert("Erreur", "Impossible de charger l'analyse");
        router.back();
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#0F0F1A] items-center justify-center">
        <ActivityIndicator color="#8B5CF6" />
      </View>
    );
  }

  if (!analysis) {
     return (
        <View className="flex-1 bg-[#0F0F1A] items-center justify-center">
           <Text className="text-white">Analyse introuvable</Text>
        </View>
     )
  }

  return (
    <View className="flex-1 bg-[#0F0F1A]">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 flex-row items-center justify-center bg-[#0F0F1A]/95 border-b border-white/5 relative z-10">
        <Pressable
          onPress={() => router.back()}
          className="absolute left-4 w-10 h-10 items-center justify-center rounded-full hover:bg-white/10"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-bold">Détails de l'analyse</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Metadata */}
        <View className="flex-row items-center justify-between px-1 mb-6">
           <Text className="text-sm font-medium text-gray-400">
             {new Date(analysis.created_at).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
           </Text>
           <View className="flex-row items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1">
             <MaterialCommunityIcons name="check-circle" size={14} color="#8B5CF6" />
             <Text className="text-xs font-semibold text-purple-500">
               {analysis.outcome === "sent" ? "Envoyé" : "Archivé"}
             </Text>
           </View>
        </View>

        {/* Privacy Context Card (Screenshot placeholder) */}
        <View className="mb-6 relative flex-col overflow-hidden rounded-2xl bg-[#1A1A2E] shadow-sm ring-1 ring-white/10">
          <View className="relative aspect-video w-full overflow-hidden bg-gray-900">
             {/* If we had the image, we would display it here blocked/blurred */}
             <View className="absolute inset-0 items-center justify-center bg-gray-800">
               <MaterialCommunityIcons name="image" size={48} color="#4B5563" />
             </View>

             {/* Overlay */}
             <View className="absolute inset-0 flex-col items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
                <View className="flex-row items-center gap-2 rounded-full bg-black/60 px-4 py-2 border border-white/10">
                   <MaterialCommunityIcons name="lock" size={18} color="white" />
                   <Text className="text-white text-sm font-medium">Confidentialité Protégée</Text>
                </View>
             </View>
          </View>

          <View className="p-4 gap-1">
             <Text className="text-base font-bold text-white">Contexte Original</Text>
             <Text className="text-sm text-gray-400">Capture d'écran analysée. Détails personnels floutés automatiquement.</Text>
          </View>
        </View>

        {/* Wingman Suggestion */}
        <View className="flex-col gap-3 mb-6">
           <View className="flex-row items-center gap-2 px-1">
              <MaterialIcons name="auto-awesome" size={20} color="#8B5CF6" />
              <Text className="text-lg font-bold text-white">Suggestion Wingman</Text>
           </View>

           <LinearGradient
             colors={["#362249", "#0F0F1A"]}
             className="rounded-2xl p-1 border border-purple-500/30"
           >
              <View className="p-4 gap-4">
                 <View className="flex-row items-start gap-3">
                    <View className="w-10 h-10 rounded-full bg-purple-900 border-2 border-purple-500/30 items-center justify-center overflow-hidden">
                       <LinearGradient colors={["#8B5CF6", "#6366F1"]} className="w-full h-full items-center justify-center">
                          <MaterialIcons name="smart-toy" size={24} color="white" />
                       </LinearGradient>
                    </View>
                    <View className="flex-1 gap-2">
                       <View className="flex-row items-center justify-between">
                          <Text className="text-xs font-semibold uppercase tracking-wider text-purple-400">Wingman AI</Text>
                          <Text className="text-xs font-medium text-green-400">92% Confiance</Text>
                       </View>

                       <View className="relative rounded-2xl rounded-tl-sm bg-[#4a3063] p-4 shadow-sm">
                          <Text className="text-base text-white leading-relaxed">
                            {analysis.result || "Aucune suggestion disponible."}
                          </Text>
                       </View>

                       <View className="flex-row items-center gap-2 px-1 pt-1">
                          <Text className="text-xs text-white/40">Généré par IA • Modifié avant envoi</Text>
                       </View>
                    </View>
                 </View>
              </View>

              {/* Action Divider */}
              <View className="h-px w-full bg-white/10" />

              {/* Secondary Actions */}
              <View className="flex-row py-1 divide-x divide-white/10">
                 <Pressable className="flex-1 flex-col items-center justify-center gap-1 p-2 active:bg-white/5">
                    <MaterialIcons name="refresh" size={20} color="#9CA3AF" />
                    <Text className="text-xs font-medium text-gray-400">Ré-analyser</Text>
                 </Pressable>

                 <Pressable className="flex-1 flex-col items-center justify-center gap-1 p-2 active:bg-white/5">
                    <MaterialIcons name="delete" size={20} color="#9CA3AF" />
                    <Text className="text-xs font-medium text-gray-400">Supprimer</Text>
                 </Pressable>

                 <Pressable className="flex-1 flex-col items-center justify-center gap-1 p-2 active:bg-white/5">
                    <MaterialIcons name="share" size={20} color="#9CA3AF" />
                    <Text className="text-xs font-medium text-gray-400">Exporter</Text>
                 </Pressable>
              </View>
           </LinearGradient>
        </View>

        {/* Primary CTA */}
        <View className="pt-4">
           <Pressable
             onPress={() => router.push("/(tabs)/coach/results")} // Assuming this goes to a chat-like interface or similar
             className="w-full flex-row items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-4 px-6 shadow-lg shadow-purple-500/25 active:scale-[0.98]"
           >
              <Text className="text-base font-bold text-white">Continuer la conversation</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
           </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}
