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
        <View className="flex-1 bg-[#0F0F1A]">
            {/* Header */}
            <View className="flex-row items-center justify-between pt-16 pb-6 px-6 relative">
                 <Pressable
                    onPress={() => router.back()}
                    className="w-11 h-11 items-center justify-center rounded-full bg-white/5 border border-white/10 active:bg-white/10"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-bold tracking-wide">Support</Text>
                <View className="w-11" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Headline */}
                <View className="px-6 mb-8 mt-2">
                    <Text className="text-white text-3xl font-extrabold mb-3 tracking-tight">
                        Besoin d'aide ?
                    </Text>
                    <Text className="text-gray-400 text-base leading-relaxed font-medium">
                        Votre vie privée est notre priorité. Les demandes de support sont cryptées et traitées en toute sécurité.
                    </Text>
                </View>

                {/* FAQs */}
                <View className="px-6 mb-8">
                    <Text className="text-[#A78BFA] text-xs font-bold uppercase tracking-widest mb-4 ml-1">Questions Fréquentes</Text>
                    <View className="gap-3">
                        {FAQs.map((faq, index) => (
                            <View key={index} className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                <Pressable
                                    className="flex-row items-center justify-between p-5 active:bg-white/5"
                                    onPress={() => toggleFaq(index)}
                                >
                                    <View className="flex-row items-center gap-4">
                                        <View className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 items-center justify-center border border-[#8B5CF6]/20">
                                            <MaterialIcons name={faq.icon} size={20} color="#8B5CF6" />
                                        </View>
                                        <Text className="text-white text-sm font-bold">{faq.title}</Text>
                                    </View>
                                    <View className={`bg-white/5 rounded-full p-1 ${openFaq === index ? 'rotate-180 bg-[#8B5CF6]/20' : ''}`}>
                                        <MaterialIcons
                                            name="expand-more"
                                            size={20}
                                            color={openFaq === index ? "#8B5CF6" : "#6B7280"}
                                        />
                                    </View>
                                </Pressable>
                                {openFaq === index && (
                                    <View className="px-5 pb-5 pl-[4.5rem]">
                                        <Text className="text-gray-300 text-sm leading-relaxed">
                                            {faq.content}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact Form */}
                <View className="px-6 mb-8">
                    <Text className="text-[#A78BFA] text-xs font-bold uppercase tracking-widest mb-4 ml-1">Contactez-nous</Text>
                    <View className="gap-5">
                        <View className="gap-2">
                            <TextInput
                                className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 text-white placeholder:text-gray-500 min-h-[140px] text-base leading-relaxed"
                                placeholder="Décrivez votre problème ou suggestion..."
                                placeholderTextColor="#6B7280"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                        <Pressable className="w-full rounded-2xl bg-[#8B5CF6] py-4 items-center shadow-lg shadow-purple-500/30 active:scale-[0.99]">
                            <Text className="text-white text-base font-bold tracking-wide">Envoyer le message</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Safety Section */}
                <View className="px-6 mb-4">
                    <View className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 gap-3 relative overflow-hidden">
                        {/* Glow effect */}
                        <View className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mt-16 -mr-16" />

                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-full bg-red-500/10 items-center justify-center">
                                <MaterialIcons name="flag" size={18} color="#EF4444" />
                            </View>
                            <Text className="text-white text-base font-bold">Sécurité & Modération</Text>
                        </View>
                        <Text className="text-gray-400 text-sm leading-relaxed">
                            Vous avez trouvé du contenu inapproprié ou une suggestion IA nuisible ? Aidez-nous à garder la communauté sûre.
                        </Text>
                        <Pressable className="mt-2 w-full rounded-xl border border-red-500/30 bg-red-500/10 py-3 items-center active:bg-red-500/20">
                            <Text className="text-red-400 text-sm font-bold">Signaler du contenu</Text>
                        </Pressable>
                    </View>
                </View>

                {/* App Version */}
                <View className="pb-8 pt-4 items-center opacity-50">
                    <Text className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Wingman v1.0.2</Text>
                </View>
            </ScrollView>
        </View>
    );
}
