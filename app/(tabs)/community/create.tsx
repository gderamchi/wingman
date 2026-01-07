import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

import { useCommunityStore } from "@/src/features/community/stores/communityStore";

export default function CreatePostScreen() {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = useCommunityStore((s) => s.createPost);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Erreur", "Le contenu ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);
    const postId = await createPost(content.trim(), undefined, isAnonymous);
    setIsSubmitting(false);

    if (postId) {
      router.back();
    } else {
      Alert.alert("Erreur", "Impossible de créer le post");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>
          Nouveau post
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Content input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Décris ta situation
          </Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Ex: J'ai reçu ce message d'un match Tinder et je ne sais pas quoi répondre..."
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={6}
            style={styles.textInput}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {content.length}/500
          </Text>
        </View>

        {/* Screenshot upload (placeholder) */}
        <Pressable style={styles.uploadCard}>
          <View style={styles.uploadIconContainer}>
            <Ionicons name="image-outline" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.uploadInfo}>
            <Text style={styles.uploadTitle}>
              Ajouter une capture (optionnel)
            </Text>
            <Text style={styles.uploadSubtitle}>
              Ta capture sera floutée automatiquement
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </Pressable>

        {/* Anonymous toggle */}
        <View style={styles.anonymousContainer}>
          <View style={styles.anonymousLeft}>
            <Ionicons name="eye-off-outline" size={24} color="#8B5CF6" />
            <View style={styles.anonymousInfo}>
              <Text style={styles.anonymousTitle}>Poster anonymement</Text>
              <Text style={styles.anonymousSubtitle}>
                Ton pseudo ne sera pas affiché
              </Text>
            </View>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: "#374151", true: "#8B5CF6" }}
            thumbColor="#fff"
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color="#8B5CF6" />
            <Text style={styles.tipsTitle}>Conseil</Text>
          </View>
          <Text style={styles.tipsText}>
            Plus tu donnes de contexte, meilleures seront les suggestions de la
            communauté ! N'hésite pas à expliquer ta relation avec la personne
            et ce que tu veux accomplir.
          </Text>
        </View>
      </ScrollView>

      {/* Submit button */}
      <View style={styles.footer}>
        <Pressable onPress={handleSubmit} disabled={isSubmitting || !content.trim()}>
          <LinearGradient
            colors={
              content.trim() && !isSubmitting
                ? ["#8B5CF6", "#6366F1"]
                : ["#4B5563", "#374151"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButton}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>
                  Publier
                </Text>
              </>
            )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: "#A78BFA",
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 24,
    padding: 24,
    color: "white",
    fontSize: 17,
    minHeight: 180,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    lineHeight: 24,
  },
  charCount: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "right",
    marginTop: 12,
    marginRight: 8,
    fontWeight: "600",
  },
  uploadCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderStyle: 'dashed',
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  uploadInfo: {
    flex: 1,
  },
  uploadTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  uploadSubtitle: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  anonymousContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  anonymousLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  anonymousInfo: {
    marginLeft: 16,
  },
  anonymousTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  anonymousSubtitle: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 2,
  },
  tipsContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.05)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.1)",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipsTitle: {
    color: "#8B5CF6",
    fontWeight: "700",
    marginLeft: 10,
    fontSize: 14,
    textTransform: "uppercase",
  },
  tipsText: {
    color: "#D1D5DB",
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
