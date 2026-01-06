import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAnalysisStore, useChatMessages, useIsChatLoading } from "@/src/features/analysis/stores/analysisStore";

// Quick suggestion prompts for common refinement requests
const QUICK_SUGGESTIONS = [
  { id: "funnier", label: "😂 Plus drôle", prompt: "Rends cette réponse plus drôle et légère" },
  { id: "shorter", label: "✂️ Plus court", prompt: "Raccourcis cette réponse, va droit au but" },
  { id: "direct", label: "🎯 Plus direct", prompt: "Rends cette réponse plus directe et confiante" },
  { id: "flirty", label: "💜 Plus flirt", prompt: "Ajoute une touche de séduction subtile" },
  { id: "emoji", label: "✨ Ajoute emoji", prompt: "Ajoute un ou deux emojis bien placés" },
] as const;

export default function ChatScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const messages = useChatMessages();
  const isLoading = useIsChatLoading();
  const sendMessage = useAnalysisStore((s) => s.sendMessage);
  const selectedReply = useAnalysisStore((s) => s.selectedReply);

  // Filter messages for display: exclude system and initial analysis messages
  const displayMessages = messages.filter((m, idx) => {
    if (m.role === "system") return false;
    // Skip initial user message with image (analysis request)
    if (idx === 0 && m.role === "user" && Array.isArray(m.content)) return false;
    // Skip initial assistant response if it looks like JSON analysis
    if (idx === 1 && m.role === "assistant") {
      const content = typeof m.content === "string" ? m.content : "";
      if (content.includes('"analysis"') || content.includes('"suggestions"')) return false;
    }
    return true;
  });

  // Get the last assistant message for copying
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const lastAssistantContent = lastAssistantMessage
    ? (typeof lastAssistantMessage.content === "string"
        ? lastAssistantMessage.content
        : (lastAssistantMessage.content as any[]).find((c) => c.type === "text")?.text || "")
    : "";

  useEffect(() => {
    // Scroll to bottom on new messages
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || inputText.trim();
    if (!messageToSend || isLoading) return;

    setInputText("");
    await sendMessage(messageToSend);
  };

  const handleCopyLastResponse = async () => {
    if (!lastAssistantContent) return;
    await Clipboard.setStringAsync(lastAssistantContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isUser = item.role === "user";

    // Check if message has image (initial user message)
    const hasImage = Array.isArray(item.content) && item.content.some((c: any) => c.type === "image_url");
    const textContent = Array.isArray(item.content)
        ? item.content.find((c: any) => c.type === "text")?.text
        : item.content;

    return (
      <View
        className={`flex-row mb-4 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-purple-500/10 items-center justify-center mr-2 mt-1">
            <Ionicons name="flash" size={16} color="#8B5CF6" />
          </View>
        )}

        <View
          className={`px-4 py-3 rounded-2xl max-w-[80%] ${
            isUser
              ? "bg-purple-600 rounded-tr-sm"
              : "bg-[#1A1A2E] border border-white/5 rounded-tl-sm"
          }`}
        >
           {hasImage && (
             <View className="mb-2 rounded-lg overflow-hidden border border-white/10 opacity-70">
                <View className="bg-black/40 px-3 py-1.5 flex-row items-center gap-2">
                    <Ionicons name="image" size={12} color="white" />
                    <Text className="text-white/80 text-xs">{t("coach.chat.screenshot")}</Text>
                </View>
             </View>
           )}

          <Text className={`text-base leading-5 ${isUser ? "text-white" : "text-gray-200"}`}>
            {textContent}
          </Text>
        </View>

        {isUser && (
           <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center ml-2 mt-1 opacity-50">
             <Ionicons name="person" size={16} color="white" />
           </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#0F0F1A]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-[#0F0F1A] border-b border-white/5 z-10">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/5 active:bg-white/10"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>

          <View className="items-center">
            <Text className="text-white font-bold text-lg">{t("coach.chat.title")}</Text>
            <Text className="text-purple-400 text-xs font-medium">{t("coach.chat.subtitle")}</Text>
          </View>

          {/* Copy last response button in header */}
          <Pressable
            onPress={handleCopyLastResponse}
            disabled={!lastAssistantContent}
            className={`w-10 h-10 items-center justify-center rounded-full ${lastAssistantContent ? "bg-white/5 active:bg-white/10" : "opacity-30"}`}
          >
            <Ionicons
              name={isCopied ? "checkmark" : "copy-outline"}
              size={20}
              color={isCopied ? "#10B981" : "#8B5CF6"}
            />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={displayMessages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          className="flex-1"
          ListHeaderComponent={
             <View className="items-center py-4 mb-4">
                <View className="w-12 h-12 rounded-full bg-purple-500/10 items-center justify-center mb-3">
                  <Ionicons name="chatbubbles" size={24} color="#8B5CF6" />
                </View>
                <Text className="text-gray-500 text-xs uppercase tracking-widest text-center">{t("coach.chat.sessionStart")}</Text>
                {selectedReply && (
                  <View className="mt-3 bg-[#1A1A2E] rounded-xl p-3 border border-white/5 max-w-[90%]">
                    <Text className="text-gray-400 text-xs mb-1">{t("coach.chat.selectedReply")}</Text>
                    <Text className="text-white text-sm">"{selectedReply.text}"</Text>
                  </View>
                )}
             </View>
          }
        />

        {/* Quick Suggestions */}
        <View className="px-4 pb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <Pressable
                key={suggestion.id}
                onPress={() => handleSend(suggestion.prompt)}
                disabled={isLoading}
                className="bg-[#1A1A2E] px-4 py-2 rounded-full border border-white/10 active:bg-white/5"
              >
                <Text className="text-gray-300 text-sm">{suggestion.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Input Area */}
        <View className="p-4 bg-[#0F0F1A] border-t border-white/10 pb-8">
            <View className="flex-row items-end gap-3">
                <View className="flex-1 bg-[#1A1A2E] rounded-2xl border border-white/10 min-h-[48px] justify-center px-4 py-2">
                    <TextInput
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder={t("coach.chat.placeholder") || "Demandez une modification..."}
                        placeholderTextColor="#6B7280"
                        multiline
                        maxLength={500}
                        style={{ color: "white", maxHeight: 100, fontSize: 16 }}
                    />
                </View>

                <Pressable
                    onPress={() => handleSend()}
                    disabled={!inputText.trim() || isLoading}
                >
                    <LinearGradient
                      colors={!inputText.trim() || isLoading ? ["#374151", "#1F2937"] : ["#8B5CF6", "#6366F1"]}
                      className="w-12 h-12 rounded-full items-center justify-center"
                    >
                      {isLoading ? (
                          <ActivityIndicator color="white" size="small" />
                      ) : (
                          <Ionicons name="arrow-up" size={24} color={!inputText.trim() ? "#6B7280" : "white"} />
                      )}
                    </LinearGradient>
                </Pressable>
            </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
