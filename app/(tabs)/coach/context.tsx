import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAnalysisStore } from "@/src/features/analysis/stores/analysisStore";
import { useProfile } from "@/src/features/auth/stores/authStore";



export default function ContextScreen() {
  const { t } = useTranslation();
  const profile = useProfile();
  const params = useLocalSearchParams<{
    relationship?: string;
    objective?: string;
    goal?: string;
    style?: string;
    additionalContext?: string;
  }>();

  const relationships = [
    { id: "match", label: t("coach.context.relationships.match"), icon: "heart" },
    { id: "crush", label: t("coach.context.relationships.crush"), icon: "flame" },
    { id: "ex", label: t("coach.context.relationships.ex"), icon: "time" },
    { id: "friend", label: t("coach.context.relationships.friend"), icon: "people" },
    { id: "colleague", label: t("coach.context.relationships.colleague"), icon: "briefcase" },
    { id: "other", label: t("coach.context.relationships.other"), icon: "ellipsis-horizontal" },
  ] as const;

  const objectives = [
    { id: "flirt", label: t("coach.context.objectives.flirt"), icon: "sparkles" },
    { id: "date", label: t("coach.context.objectives.date"), icon: "calendar" },
    { id: "reconnect", label: t("coach.context.objectives.reconnect"), icon: "refresh" },
    { id: "friendly", label: t("coach.context.objectives.friendly"), icon: "happy" },
    { id: "professional", label: t("coach.context.objectives.professional"), icon: "briefcase" },
  ] as const;

  const setContext = useAnalysisStore((s) => s.setContext);
  const context = useAnalysisStore((s) => s.context);

  const [relationship, setRelationship] = useState<string | null>(params.relationship || null);
  const [objective, setObjective] = useState<string | null>(params.objective || null);
  const [additionalInfo, setAdditionalInfo] = useState(params.additionalContext || "");

  const handleContinue = () => {
    // Update context with user's preferences from profile or params
    setContext({
      goal: (params.goal as any) ?? (profile?.main_goal as "dating" | "social" | "professional") ?? "dating",
      style: (params.style as any) ?? (profile?.communication_style as "playful" | "direct" | "empathetic") ?? "playful",
      additionalContext: `Relation: ${relationship ?? "non spécifié"}. Objectif: ${objective ?? "non spécifié"}. ${additionalInfo}`,
      userQuestion: additionalInfo || "Suggère-moi des réponses adaptées.",
    });

    router.push("/(tabs)/coach/processing");
  };

  const canContinue = relationship && objective;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {t("coach.context.title")}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Fast Presets */}
          <View style={[styles.section, { marginBottom: 24 }]}>
             <Text style={styles.questionText}>Accès rapide</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24 }}>
               {[
                 { label: "🔥 Match récent", r: "match", o: "flirt" },
                 { label: "📅 Date prévu", r: "match", o: "date" },
                 { label: "👋 Reprendre contact", r: "friend", o: "reconnect" },
                 { label: "💔 Mon Ex", r: "ex", o: "reconnect" },
               ].map((preset, idx) => (
                 <Pressable
                   key={idx}
                   onPress={() => {
                     setRelationship(preset.r);
                     setObjective(preset.o);
                   }}
                   style={{
                     backgroundColor: "#2D1B3E",
                     paddingHorizontal: 16,
                     paddingVertical: 10,
                     borderRadius: 20,
                     marginRight: 10,
                     borderWidth: 1,
                     borderColor: "#8B5CF6",
                   }}
                 >
                   <Text style={{ color: "#D8B4FE", fontWeight: "600", fontSize: 13 }}>{preset.label}</Text>
                 </Pressable>
               ))}
             </ScrollView>
          </View>

          {/* Question 1: Relationship */}
          <View style={styles.section}>
            <Text style={styles.questionText}>
              {t("coach.context.question1")}
            </Text>
            <View style={styles.chipsContainer}>
              {relationships.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setRelationship(item.id)}
                  style={[
                    styles.chip,
                    relationship === item.id
                      ? styles.chipSelected
                      : styles.chipDefault
                  ]}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={relationship === item.id ? "#8B5CF6" : "#9CA3AF"}
                  />
                  <Text
                    style={[
                      styles.chipLabel,
                      relationship === item.id ? styles.chipLabelSelected : styles.chipLabelDefault
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Question 2: Objective */}
          <View style={styles.section}>
            <Text style={styles.questionText}>
              {t("coach.context.question2")}
            </Text>
            <View style={styles.chipsContainer}>
              {objectives.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setObjective(item.id)}
                  style={[
                    styles.chip,
                    objective === item.id
                      ? styles.chipSelected
                      : styles.chipDefault
                  ]}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={objective === item.id ? "#8B5CF6" : "#9CA3AF"}
                  />
                  <Text
                    style={[
                      styles.chipLabel,
                      objective === item.id ? styles.chipLabelSelected : styles.chipLabelDefault
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Additional context */}
          <View style={styles.section}>
            <Text style={styles.questionText}>
              {t("coach.context.additionalContext")}
            </Text>
            <TextInput
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              placeholder={t("coach.context.placeholder")}
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={3}
              style={styles.textInput}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Continue button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <LinearGradient
            colors={canContinue ? ["#8B5CF6", "#6366F1"] : ["#4B5563", "#374151"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>
              {t("common.continue")}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  content: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  questionText: {
    fontSize: 16,
    color: "#9CA3AF", // text-gray-400
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8, // fallback
    marginBottom: 8, // fallback
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    borderColor: "#8B5CF6", // border-primary
  },
  chipLabel: {
    marginLeft: 8,
  },
  chipLabelDefault: {
    color: "white",
  },
  chipLabelSelected: {
    color: "#8B5CF6", // text-primary
  },
  textInput: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    color: "white",
    fontSize: 16,
    minHeight: 100,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 16,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
