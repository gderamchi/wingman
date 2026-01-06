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

      <View style={styles.content}>
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
      </View>

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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  closeButton: {
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
    flex: 1,
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: "#9CA3AF", // text-gray-400
    marginBottom: 8,
    fontSize: 14,
  },
  textInput: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    color: "white",
    fontSize: 16,
    minHeight: 150,
  },
  charCount: {
    color: "#6B7280", // text-gray-500
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
  },
  uploadCard: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  uploadInfo: {
    flex: 1,
  },
  uploadTitle: {
    color: "white",
    fontWeight: "500",
  },
  uploadSubtitle: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
  },
  anonymousContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  anonymousLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  anonymousInfo: {
    marginLeft: 12,
  },
  anonymousTitle: {
    color: "white",
    fontWeight: "500",
  },
  anonymousSubtitle: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
  },
  tipsContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.1)", // bg-primary/10
    borderRadius: 12,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipsTitle: {
    color: "#8B5CF6", // text-primary
    fontWeight: "500",
    marginLeft: 8,
  },
  tipsText: {
    color: "#D1D5DB", // text-gray-300
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});
