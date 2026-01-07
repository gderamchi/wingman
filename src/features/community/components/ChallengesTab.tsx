import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export function ChallengesTab() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0F0F1A" }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Timer Section */}
      <View className="px-4 py-6">
        <View className="flex-row items-center gap-2 mb-3">
          <MaterialCommunityIcons name="timer-outline" size={16} color="#8B5CF6" />
          <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Temps Restant
          </Text>
        </View>

        <View className="flex-row gap-3">
          {/* Days */}
          <View className="flex-1">
            <View className="h-14 bg-[#1A1A2E] rounded-xl border border-white/5 items-center justify-center mb-2">
              <Text className="text-white text-xl font-bold">02</Text>
            </View>
            <Text className="text-gray-500 text-xs text-center font-medium">Jours</Text>
          </View>

          {/* Hours */}
          <View className="flex-1">
            <View className="h-14 bg-[#1A1A2E] rounded-xl border border-white/5 items-center justify-center mb-2">
              <Text className="text-white text-xl font-bold">04</Text>
            </View>
            <Text className="text-gray-500 text-xs text-center font-medium">Heures</Text>
          </View>

          {/* Minutes */}
          <View className="flex-1">
            <View className="h-14 bg-[#1A1A2E] rounded-xl border border-white/5 items-center justify-center mb-2">
              <Text className="text-white text-xl font-bold">15</Text>
            </View>
            <Text className="text-gray-500 text-xs text-center font-medium">Mn</Text>
          </View>

          {/* Seconds */}
          <View className="flex-1">
            <View className="h-14 bg-[#1A1A2E] rounded-xl border border-white/5 items-center justify-center mb-2">
              <Text className="text-white text-xl font-bold">32</Text>
            </View>
            <Text className="text-gray-500 text-xs text-center font-medium">Sec</Text>
          </View>
        </View>
      </View>

      {/* Level Progress Card */}
      <View className="px-4 mb-6">
        <LinearGradient
          colors={["#261834", "#1e122a"]}
          className="rounded-2xl p-4 border border-white/5 flex-row items-center gap-4 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <View className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl" />

          <View className="flex-1 z-10">
            <View className="mb-3 pr-2">
              <Text className="text-white text-base font-bold mb-1" numberOfLines={1} adjustsFontSizeToFit>
                Niveau 4: Casanova en herbe
              </Text>
              <Text className="text-purple-400 text-sm font-medium">
                450 / 1000 XP
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-2 bg-[#362249] rounded-full overflow-hidden mb-2">
              <LinearGradient
                colors={["#8B5CF6", "#A78BFA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: "45%", height: "100%" }}
              />
            </View>

            <Pressable className="flex-row items-center gap-1 self-start">
              <Text className="text-gray-400 text-xs font-medium">Voir les rangs</Text>
              <MaterialCommunityIcons name="arrow-right" size={14} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Badge Placeholder */}
           <View className="w-16 h-16 bg-[#362249] rounded-full border-2 border-[#4A3260] items-center justify-center shadow-lg">
             <MaterialCommunityIcons name="shield-star" size={32} color="#FBBF24" />
           </View>
        </LinearGradient>
      </View>

      {/* Filter Chips */}
      <View className="pl-4 mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3 pr-4">
          <Pressable className="flex-row items-center gap-2 bg-[#8B5CF6] h-9 px-4 rounded-full shadow-lg shadow-purple-500/20">
            <MaterialCommunityIcons name="calendar-today" size={16} color="white" />
            <Text className="text-white text-sm font-bold">Hebdo</Text>
          </Pressable>

          <Pressable className="flex-row items-center gap-2 bg-[#2d1b3e] h-9 px-4 rounded-full border border-white/5">
            <MaterialCommunityIcons name="weather-sunny" size={16} color="#CBD5E1" />
            <Text className="text-slate-300 text-sm font-medium">Quotidien</Text>
          </Pressable>

          <Pressable className="flex-row items-center gap-2 bg-[#2d1b3e] h-9 px-4 rounded-full border border-white/5">
            <MaterialCommunityIcons name="infinity" size={16} color="#CBD5E1" />
             <Text className="text-slate-300 text-sm font-medium">Total</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Challenges List */}
      <View className="px-4 gap-3">
        {/* Challenge 1 */}
        <View className="bg-[#1A1A2E] rounded-xl p-4 border border-white/5 flex-row items-center gap-4">
          <View className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 items-center justify-center">
            <MaterialCommunityIcons name="broom" size={24} color="#8B5CF6" />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-white text-base font-bold">Relance Propre</Text>
              <View className="bg-purple-500/20 px-1.5 py-0.5 rounded">
                <Text className="text-purple-400 text-[10px] font-bold">+50 PTS</Text>
              </View>
            </View>
            <Text className="text-gray-400 text-sm" numberOfLines={1}>
              Relancer après 3 jours de silence
            </Text>
          </View>

          <View className="items-end gap-1">
             <Text className="text-white text-sm font-bold">1 / 3</Text>
             <View className="w-16 h-1.5 bg-[#362249] rounded-full overflow-hidden">
                <View className="h-full bg-[#8B5CF6] w-1/3" />
             </View>
          </View>
        </View>

        {/* Challenge 2 */}
        <View className="bg-[#1A1A2E] rounded-xl p-4 border border-white/5 flex-row items-center gap-4">
          <View className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 items-center justify-center">
            <MaterialCommunityIcons name="calendar-check" size={24} color="#8B5CF6" />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-white text-base font-bold">Date Proposée</Text>
              <View className="bg-purple-500/20 px-1.5 py-0.5 rounded">
                <Text className="text-purple-400 text-[10px] font-bold">+100 PTS</Text>
              </View>
            </View>
            <Text className="text-gray-400 text-sm" numberOfLines={1}>
              Proposer un rendez-vous avec confiance
            </Text>
          </View>

          <View className="items-end gap-1">
             <Text className="text-white text-sm font-bold">0 / 1</Text>
             <View className="w-16 h-1.5 bg-[#362249] rounded-full overflow-hidden">
                <View className="h-full bg-white/10 w-0" />
             </View>
          </View>
        </View>

        {/* Challenge 3: Completed */}
        <View className="bg-[#1A1A2E]/50 rounded-xl p-4 border border-white/5 flex-row items-center gap-4 opacity-70">
          <View className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center">
            <MaterialCommunityIcons name="check-circle" size={24} color="#34D399" />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
               <Text className="text-gray-300 text-base font-bold line-through decoration-gray-500">
                 Première Impression
               </Text>
            </View>
            <Text className="text-gray-500 text-sm">Complété</Text>
          </View>

          <View>
             <View className="bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
               <Text className="text-emerald-400 text-xs font-bold">Réclamé</Text>
             </View>
          </View>
        </View>
      </View>

      {/* Privacy Footer */}
      <View className="px-8 py-6 items-center">
        <View className="flex-row items-center gap-2 bg-[#2d1b3e] px-3 py-1.5 rounded-full border border-white/5">
          <MaterialCommunityIcons name="lock" size={12} color="#64748B" />
          <Text className="text-slate-500 text-xs font-medium">
            Confidentialité absolue : vos données ne sont pas partagées.
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}
