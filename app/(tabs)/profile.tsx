import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";

import { useAuthStore, useProfile, useUser } from "@/src/features/auth/stores/authStore";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const user = useUser();
  const profile = useProfile();
  const signOut = useAuthStore((state) => state.signOut);

  const displayName = profile?.display_name ?? profile?.username ?? user?.email?.split("@")[0] ?? t("community.post.unknownUser");

  const handleLogout = async () => {
    Alert.alert(
      t("settings.logout"),
      t("profile.logoutConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.logout"),
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)");
          },
        },
      ]
    );
  };

  // Calculate level progress
  const xp = profile?.xp_points ?? 0;
  const level = profile?.level ?? 1;
  const xpForNextLevel = level * 100;
  const progressPercent = Math.min((xp % 100) / 100 * 100, 100);

  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#0F0F1A]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Profile Section */}
        <View className="items-center pt-16 pb-6 px-4">
            <View className="relative mb-4">
                <View className="h-28 w-28 rounded-full p-1 bg-gradient-to-tr from-[#8B5CF6] to-[#C084FC]">
                    <Image
                        source={{ uri: profile?.avatar_url || "https://ui-avatars.com/api/?name=" + displayName + "&background=0D8ABC&color=fff" }}
                        className="h-full w-full rounded-full border-4 border-[#0F0F1A]"
                    />
                </View>
                <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full bg-[#8B5CF6] border-4 border-[#0F0F1A] shadow-md">
                    <Text className="text-white text-xs font-extrabold">{level}</Text>
                </View>
                <Pressable
                    onPress={() => router.push("/(tabs)/settings/edit-profile")}
                    className="absolute top-0 right-0 h-8 w-8 bg-[#1A1A2E] rounded-full items-center justify-center border border-white/10"
                >
                    <Ionicons name="pencil" size={14} color="white" />
                </Pressable>
            </View>

            <View className="items-center gap-1">
                <View className="flex-row items-center gap-1">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">{displayName}</Text>
                    <MaterialIcons name="verified" size={20} color="#8B5CF6" />
                </View>
                <View className="bg-[#8B5CF6]/10 px-3 py-1 rounded-full">
                    <Text className="text-[#8B5CF6] font-medium text-sm">@{profile?.username ?? "user"}</Text>
                </View>
            </View>
        </View>

        {/* Level Progress Card */}
        <View className="px-4 mb-6">
            <LinearGradient
                colors={["#231630", "#191022"]}
                className="rounded-2xl p-5 shadow-sm border border-white/5"
            >
                <View className="flex-row justify-between items-end mb-3">
                    <View className="gap-1">
                        <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("profile.stats.progression")}</Text>
                        <Text className="text-base font-bold text-white">{xp} {t("profile.stats.wingmanPoints")}</Text>
                    </View>
                    <Text className="text-xs font-medium text-[#8B5CF6]">{progressPercent.toFixed(0)}%</Text>
                </View>
                <View className="relative h-2.5 w-full rounded-full bg-gray-700 overflow-hidden">
                    <View
                        className="absolute top-0 left-0 h-full rounded-full bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                        style={{ width: `${progressPercent}%` }}
                    />
                </View>
                <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-xs text-gray-400">{t("profile.stats.currentLevel")}</Text>
                    <Text className="text-xs font-medium text-gray-300">{t("profile.stats.next")}: {level + 1}</Text>
                </View>
            </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View className="px-4 mb-8">
            <View className="flex-row gap-3">
                {/* Analyses */}
                <View className="flex-1 gap-2 rounded-2xl p-4 bg-[#1A1A2E] shadow-sm border border-white/5 items-center justify-center">
                    <View className="h-10 w-10 rounded-full bg-blue-500/10 items-center justify-center mb-1">
                        <MaterialIcons name="query-stats" size={20} color="#3B82F6" />
                    </View>
                    <View className="items-center">
                        <Text className="text-xl font-bold text-white leading-none mb-1">0</Text>
                        <Text className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{t("profile.analyses")}</Text>
                    </View>
                </View>
                {/* Reponses */}
                <View className="flex-1 gap-2 rounded-2xl p-4 bg-[#1A1A2E] shadow-sm border border-white/5 items-center justify-center">
                    <View className="h-10 w-10 rounded-full bg-emerald-500/10 items-center justify-center mb-1">
                         <MaterialIcons name="check-circle" size={20} color="#10B981" />
                    </View>
                    <View className="items-center">
                        <Text className="text-xl font-bold text-white leading-none mb-1">0</Text>
                        <Text className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{t("profile.replies")}</Text>
                    </View>
                </View>
                {/* Streak */}
                <View className="flex-1 gap-2 rounded-2xl p-4 bg-[#1A1A2E] shadow-sm border border-white/5 items-center justify-center">
                    <View className="h-10 w-10 rounded-full bg-orange-500/10 items-center justify-center mb-1">
                        <MaterialIcons name="local-fire-department" size={20} color="#F97316" />
                    </View>
                     <View className="items-center">
                        <Text className="text-xl font-bold text-white leading-none mb-1">3</Text>
                        <Text className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{t("profile.stats.streak")}</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* Menu Sections */}
        <View className="px-4 gap-3">
            <Text className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{t("settings.account")}</Text>

            {/* Subscription */}
            <Pressable
                onPress={() => router.push("/(tabs)/settings/subscription")}
                className="flex-row items-center gap-4 bg-[#1A1A2E] p-4 rounded-xl shadow-sm border border-white/5 active:scale-[0.98]"
            >
                <View className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]/10">
                    <MaterialIcons name="diamond" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-semibold text-white">{t("profile.subscription")}</Text>
                    <Text className="text-xs text-[#8B5CF6] font-medium">{t("profile.wingmanFree")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            {/* Language */}
             <Pressable
                onPress={() => router.push("/(tabs)/settings/language")}
                className="flex-row items-center gap-4 bg-[#1A1A2E] p-4 rounded-xl shadow-sm border border-white/5 active:scale-[0.98]"
            >
                <View className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-700/50">
                    <MaterialIcons name="language" size={20} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-semibold text-white">{t("settings.language")}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Text className="text-sm text-gray-500">{profile?.language === "fr" ? "Français" : "English"}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
            </Pressable>



             {/* Support */}
             <Pressable
                onPress={() => router.push("/(tabs)/settings/support")}
                className="flex-row items-center gap-4 bg-[#1A1A2E] p-4 rounded-xl shadow-sm border border-white/5 active:scale-[0.98]"
            >
                <View className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-700/50">
                    <Ionicons name="help-circle" size={20} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-semibold text-white">{t("settings.help")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>

            {/* Logout */}
            <Pressable
                onPress={handleLogout}
                className="flex-row items-center gap-4 bg-[#1A1A2E] p-4 rounded-xl shadow-sm border border-white/5 active:scale-[0.98] mt-4"
            >
                <View className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-900/10">
                    <Ionicons name="log-out" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-semibold text-[#EF4444]">{t("settings.logout")}</Text>
                </View>
            </Pressable>

            <Text className="text-center text-xs text-gray-600 mt-4 mb-2">Wingman v1.0.2</Text>
        </View>
      </ScrollView>
    </View>
  );
}

