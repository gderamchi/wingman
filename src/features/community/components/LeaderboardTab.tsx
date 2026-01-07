import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export function LeaderboardTab() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0F0F1A" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Summary */}
        <View className="p-5 flex-row justify-between items-center sticky top-0 z-20 bg-[#0F0F1A]/95">
          <View>
             <Text className="text-2xl font-bold text-white tracking-tight">Classement</Text>
             <Text className="text-gray-400 text-xs font-medium mt-0.5">Ligue Hebdomadaire</Text>
          </View>
          <View className="items-end">
             <View className="flex-row items-center gap-1.5 bg-purple-500/10 rounded-lg px-2 py-1">
               <MaterialCommunityIcons name="clock-outline" size={14} color="#8B5CF6" />
               <Text className="text-purple-500 text-xs font-bold font-mono">2j 14h 32m</Text>
             </View>
             <Text className="text-[10px] text-gray-500 mt-1">Reset Dimanche</Text>
          </View>
        </View>

        {/* Tier Carousel (Simplified visual representation) */}
        <View className="mt-2 mb-2">
           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 gap-3 pb-2">
              {/* Previous Tier */}
              <View className="w-[140px] opacity-40 scale-90">
                <LinearGradient colors={["#D1D5DB", "#9CA3AF"]} className="rounded-2xl p-4 h-32 items-center justify-center">
                   <MaterialCommunityIcons name="medal" size={40} color="white" />
                   <Text className="text-white font-bold mt-1">Argent</Text>
                </LinearGradient>
              </View>

              {/* Current Tier */}
              <View className="w-[160px]">
                <LinearGradient
                  colors={["#FACC15", "#EAB308", "#CA8A04"]}
                  className="rounded-2xl p-4 h-36 items-center justify-center relative shadow-lg shadow-yellow-500/20"
                >
                   <View className="absolute top-2 right-2 bg-black/20 px-2 py-0.5 rounded-full">
                     <Text className="text-white text-[10px] font-bold">Actuel</Text>
                   </View>
                   <MaterialCommunityIcons name="trophy" size={44} color="white" style={{ marginBottom: 4 }} />
                   <Text className="text-white text-lg font-bold tracking-wide">Or</Text>
                   <Text className="text-yellow-100 text-xs font-medium">Top 20%</Text>
                </LinearGradient>
              </View>

              {/* Next Tier */}
              <View className="w-[140px] opacity-60 scale-90">
                <LinearGradient colors={["#22D3EE", "#3B82F6"]} className="rounded-2xl p-4 h-32 items-center justify-center relative">
                   <MaterialCommunityIcons name="diamond-stone" size={40} color="white" />
                   <Text className="text-white font-bold mt-1">Diamant</Text>
                   <View className="absolute bottom-2 bg-black/30 rounded-full p-1">
                      <MaterialCommunityIcons name="lock" size={14} color="white" />
                   </View>
                </LinearGradient>
              </View>
           </ScrollView>
        </View>

        {/* Global / Friends Filter */}
        <View className="px-5 py-2">
           <View className="flex-row h-10 w-full bg-[#1A1A2E] rounded-lg p-1">
              <View className="flex-1 bg-[#2d1b3e] rounded-[4px] items-center justify-center shadow-sm">
                 <Text className="text-white text-sm font-semibold">Global</Text>
              </View>
              <View className="flex-1 items-center justify-center flex-row gap-1 opacity-60">
                 <Text className="text-gray-400 text-sm font-medium">Amis</Text>
                 <MaterialCommunityIcons name="lock" size={12} color="#9CA3AF" />
              </View>
           </View>
        </View>

        {/* Podium */}
        <View className="px-5 pt-8 pb-4 relative items-end justify-center flex-row gap-4">
           {/* Background Glow */}
           <View className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full -z-10" style={{ transform: [{translateX: '-50%'}, {translateY: '-50%'}] }} />

           {/* Rank 2 */}
           <View className="items-center w-1/3">
              <View className="relative mb-2">
                 <LinearGradient colors={["#D1D5DB", "#6B7280"]} className="w-20 h-20 rounded-full p-1 shadow-lg">
                    <View className="w-full h-full rounded-full bg-gray-800" />
                 </LinearGradient>
                 <View className="absolute -bottom-3 left-1/2 bg-[#2d1b3e] border border-gray-600 rounded-full w-6 h-6 items-center justify-center" style={{ transform: [{translateX: -12}] }}>
                    <Text className="text-xs font-bold text-gray-300">2</Text>
                 </View>
              </View>
              <Text className="text-sm font-bold text-white truncate w-full text-center">CyberPunk</Text>
              <Text className="text-xs text-purple-500 font-medium">2,100 pts</Text>
           </View>

           {/* Rank 1 */}
           <View className="items-center w-1/3 -mt-8 z-10">
              <View className="relative mb-3">
                 <View className="absolute -top-8 left-1/2" style={{ transform: [{translateX: -12}] }}>
                    <MaterialCommunityIcons name="crown" size={32} color="#FACC15" />
                 </View>
                 <LinearGradient colors={["#FDE047", "#EAB308", "#CA8A04"]} className="w-24 h-24 rounded-full p-1 shadow-2xl shadow-yellow-500/50">
                    <View className="w-full h-full rounded-full bg-gray-800" />
                 </LinearGradient>
                 <View className="absolute -bottom-3 left-1/2 bg-yellow-500 rounded-full w-7 h-7 items-center justify-center shadow-md" style={{ transform: [{translateX: -14}] }}>
                    <Text className="text-sm font-bold text-black">1</Text>
                 </View>
              </View>
              <Text className="text-base font-bold text-white truncate w-full text-center">NeoSoul</Text>
              <Text className="text-sm text-yellow-400 font-bold">2,450 pts</Text>
           </View>

           {/* Rank 3 */}
           <View className="items-center w-1/3">
              <View className="relative mb-2">
                 <LinearGradient colors={["#FB923C", "#EF4444"]} className="w-20 h-20 rounded-full p-1 shadow-lg">
                    <View className="w-full h-full rounded-full bg-gray-800" />
                 </LinearGradient>
                 <View className="absolute -bottom-3 left-1/2 bg-[#2d1b3e] border border-orange-500/50 rounded-full w-6 h-6 items-center justify-center" style={{ transform: [{translateX: -12}] }}>
                    <Text className="text-xs font-bold text-orange-300">3</Text>
                 </View>
              </View>
              <Text className="text-sm font-bold text-white truncate w-full text-center">Glitch</Text>
              <Text className="text-xs text-purple-500 font-medium">1,950 pts</Text>
           </View>
        </View>

        {/* List Ranks 4-10 */}
        <View className="px-5 mt-4 space-y-3 gap-3">
           {[
             { rank: 4, name: "VaporWave", pts: "1,820" },
             { rank: 5, name: "PixelHeart", pts: "1,650" },
             { rank: 6, name: "SynthPop", pts: "1,410" },
             { rank: 7, name: "NightRider", pts: "1,300" },
             { rank: 8, name: "PastelGoth", pts: "1,250" },
           ].map((item) => (
             <View key={item.rank} className="flex-row items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 shadow-sm">
                <Text className="text-sm font-bold text-gray-400 w-6 text-center">{item.rank}</Text>
                <View className="w-10 h-10 rounded-full bg-gray-700" />
                <View className="flex-1">
                   <Text className="text-sm font-semibold text-white">{item.name}</Text>
                </View>
                <View className="items-end">
                   <Text className="text-sm font-bold text-purple-500">{item.pts}</Text>
                   <Text className="text-[10px] text-gray-500 uppercase">pts</Text>
                </View>
             </View>
           ))}
        </View>

      </ScrollView>

      {/* Fixed User Row at bottom */}
      <View className="bg-[#2d1b3e]/90 backdrop-blur-md px-5 py-3 border-t border-white/10 absolute bottom-0 w-full pb-8">
         <View className="flex-row items-center gap-4 p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 relative overflow-hidden">
            <View className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
            <Text className="text-sm font-bold text-white w-6 text-center">42</Text>
            <View className="w-10 h-10 rounded-full bg-gray-700 border-2 border-purple-500 p-0.5">
               <View className="w-full h-full rounded-full bg-gray-600" />
            </View>
            <View className="flex-1 justify-center">
               <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-bold text-white">Vous</Text>
                  <View className="bg-purple-600 px-1.5 rounded-sm">
                    <Text className="text-[10px] text-white font-bold uppercase">Argent</Text>
                  </View>
               </View>
               <Text className="text-xs text-purple-300">Top 45% • Continuez !</Text>
            </View>
            <View className="items-end">
               <Text className="text-sm font-bold text-white">450</Text>
               <Text className="text-[10px] text-gray-400 uppercase">pts</Text>
            </View>
         </View>
      </View>
    </View>
  );
}
