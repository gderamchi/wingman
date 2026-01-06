import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutAnimation, Platform, Pressable, ScrollView, Text, TextInput, UIManager, View } from "react-native";

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function SupportScreen() {
    const { t } = useTranslation();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenFaq(openFaq === index ? null : index);
    };

    const FAQs = [
        {
            icon: "security" as const,
            title: "Confidentialité & Données",
            content: "Nous ne stockons pas vos conversations privées. Toutes les analyses sont effectuées de manière cryptée ou sur l'appareil."
        },
        {
            icon: "smart-toy" as const,
            title: "Suggestions IA",
            content: "Wingman apprend du contexte. Vous pouvez signaler des suggestions inappropriées directement sur l'écran pour améliorer les résultats futurs."
        },
        {
            icon: "credit-card" as const,
            title: "Facturation & Abonnements",
            content: "Les abonnements sont gérés via vos paramètres Apple ID ou Google Play. Vous pouvez annuler ou mettre à niveau à tout moment."
        }
    ];

    return (
        <View className="flex-1 bg-[#f7f5f8] dark:bg-[#0F0F1A]">
            {/* Header */}
            <View className="flex-row items-center justify-between bg-[#f7f5f8]/80 dark:bg-[#0F0F1A]/80 pt-12 pb-4 px-4 border-b border-gray-200 dark:border-white/5 z-10">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-white/10"
                >
                    <Ionicons name="chevron-back" size={24} color="#64748B" />
                </Pressable>
                <Text className="text-gray-900 dark:text-white text-lg font-bold pr-10">Support</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Headline */}
                <View className="px-6 pt-6">
                    <Text className="text-gray-900 dark:text-white text-3xl font-bold mb-2">
                        Besoin d'aide avec Wingman ?
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                        Votre vie privée est notre priorité. Les demandes de support sont cryptées et traitées en toute sécurité.
                    </Text>
                </View>

                {/* FAQs */}
                <View className="px-6 mt-8">
                    <Text className="text-gray-900 dark:text-white text-lg font-bold mb-4">Questions Fréquentes</Text>
                    <View className="gap-3">
                        {FAQs.map((faq, index) => (
                            <View key={index} className="bg-white dark:bg-[#1A1A2E] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                                <Pressable
                                    className="flex-row items-center justify-between p-4"
                                    onPress={() => toggleFaq(index)}
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 items-center justify-center">
                                            <MaterialIcons name={faq.icon} size={20} color="#8B5CF6" />
                                        </View>
                                        <Text className="text-gray-800 dark:text-white text-sm font-semibold">{faq.title}</Text>
                                    </View>
                                    <MaterialIcons
                                        name="expand-more"
                                        size={24}
                                        color="#9CA3AF"
                                        style={{ transform: [{ rotate: openFaq === index ? '180deg' : '0deg' }] }}
                                    />
                                </Pressable>
                                {openFaq === index && (
                                    <View className="px-4 pb-4 pl-[3.25rem]">
                                        <Text className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed">
                                            {faq.content}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact Form */}
                <View className="px-6 mt-8">
                    <Text className="text-gray-900 dark:text-white text-lg font-bold mb-4">Contactez-nous</Text>
                    <View className="gap-4">
                        <View className="gap-2">
                            <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1">
                                Comment pouvons-nous aider ?
                            </Text>
                            <TextInput
                                className="w-full rounded-xl bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-[#362249] p-4 text-gray-900 dark:text-white placeholder-gray-400 min-h-[120px] text-justify"
                                placeholder="Décrivez votre problème ou suggestion..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                        <Pressable className="w-full rounded-xl bg-[#8B5CF6] py-3.5 items-center shadow-lg shadow-purple-500/25 active:bg-[#7C3AED]">
                            <Text className="text-white text-sm font-bold">Envoyer le message</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Safety Section */}
                <View className="px-6 mt-8 mb-4">
                    <View className="rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-5 gap-3">
                        <View className="flex-row items-center gap-3">
                            <MaterialIcons name="flag" size={24} color="#EF4444" />
                            <Text className="text-gray-900 dark:text-white text-base font-bold">Sécurité & Modération</Text>
                        </View>
                        <Text className="text-gray-600 dark:text-gray-300 text-sm">
                            Vous avez trouvé du contenu inapproprié ou une suggestion IA nuisible ? Aidez-nous à garder la communauté sûre.
                        </Text>
                        <Pressable className="mt-1 w-full rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-transparent py-2.5 items-center">
                            <Text className="text-red-600 dark:text-red-400 text-sm font-bold">Signaler du contenu</Text>
                        </Pressable>
                    </View>
                </View>

                {/* App Version */}
                <View className="pb-8 pt-4 items-center">
                    <Text className="text-xs font-medium text-gray-400 dark:text-gray-600">Wingman v1.0.2</Text>
                </View>
            </ScrollView>
        </View>
    );
}
