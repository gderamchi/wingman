import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useUser } from "@/src/features/auth/stores/authStore";
import { ReplyCard } from "@/src/features/community/components/ReplyCard";
import { useCommunityStore } from "@/src/features/community/stores/communityStore";

export default function PostDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser();
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPost = useCommunityStore((s) => s.selectedPost);
  const replies = useCommunityStore((s) => s.replies);
  const isLoadingReplies = useCommunityStore((s) => s.isLoadingReplies);
  const fetchPostById = useCommunityStore((s) => s.fetchPostById);
  const fetchReplies = useCommunityStore((s) => s.fetchReplies);
  const createReply = useCommunityStore((s) => s.createReply);
  const voteReply = useCommunityStore((s) => s.voteReply);

  useEffect(() => {
    if (id) {
      fetchPostById(id);
      fetchReplies(id, user?.id);
    }
  }, [id, user?.id]);

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !id) return;

    setIsSubmitting(true);
    await createReply(id, replyText.trim());
    setReplyText("");
    setIsSubmitting(false);
  };

  if (!selectedPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#8B5CF6" />
      </View>
    );
  }

  const authorName = selectedPost.is_anonymous
    ? "Anonyme"
    : selectedPost.author?.display_name ?? selectedPost.author?.username ?? "Utilisateur";

  const timeAgo = formatDistanceToNow(new Date(selectedPost.created_at), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>
          Conversation
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Post content */}
        <View style={styles.postContainer}>
          {/* Author */}
          <View style={styles.authorHeader}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>
                {authorName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{authorName}</Text>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>
          </View>

          {/* Content */}
          <Text style={styles.postText}>
            {selectedPost.content}
          </Text>

          {/* Screenshot */}
          {selectedPost.screenshot_url && (
            <View style={styles.screenshotContainer}>
              <Image
                source={{ uri: selectedPost.screenshot_url }}
                style={styles.screenshot}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={18} color="#8B5CF6" />
              <Text style={styles.statText}>
                {replies.length} réponses
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={18} color="#EF4444" />
              <Text style={styles.statText}>
                {selectedPost.likes_count} likes
              </Text>
            </View>
          </View>
        </View>

        {/* Replies */}
        <Text style={styles.sectionTitle}>
          Suggestions de la communauté
        </Text>

        {isLoadingReplies ? (
          <View style={styles.repliesLoading}>
            <ActivityIndicator color="#8B5CF6" />
          </View>
        ) : replies.length === 0 ? (
          <View style={styles.emptyReplies}>
            <Text style={styles.emptyRepliesText}>
              Sois le premier à suggérer une réponse !
            </Text>
          </View>
        ) : (
          replies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              onVote={(voteType) => voteReply(reply.id, voteType)}
            />
          ))
        )}

        <View style={{ height: 128 }} />
      </ScrollView>

      {/* Reply input */}
      <View style={styles.footer}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={replyText}
            onChangeText={setReplyText}
            placeholder={t("community.post.addReply")}
            placeholderTextColor="#6B7280"
            multiline
            style={styles.replyInput}
          />
          <Pressable
            onPress={handleSubmitReply}
            disabled={!replyText.trim() || isSubmitting}
            style={[
              styles.sendButton,
              (replyText.trim() && !isSubmitting) ? styles.sendButtonActive : styles.sendButtonDisabled
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  postContainer: {
    marginBottom: 24,
  },
  authorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  authorAvatarText: {
    color: "#8B5CF6", // text-primary
    fontWeight: "600",
    fontSize: 18,
  },
  authorName: {
    color: "white",
    fontWeight: "500",
  },
  timeAgo: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
  },
  postText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  screenshotContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  screenshot: {
    width: "100%",
    height: 256,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#1A1A2E", // border-dark-50
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  statText: {
    color: "#9CA3AF", // text-gray-400
    marginLeft: 8,
  },
  sectionTitle: {
    color: "white",
    fontWeight: "600",
    marginBottom: 16,
  },
  repliesLoading: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyReplies: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyRepliesText: {
    color: "#6B7280", // text-gray-500
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderTopWidth: 1,
    borderTopColor: "#0F0F1A", // border-dark
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  replyInput: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "white",
    maxHeight: 96,
  },
  sendButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#8B5CF6", // bg-primary
  },
  sendButtonDisabled: {
    backgroundColor: "#374151", // bg-gray-700
  },
});
