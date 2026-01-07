import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { PostWithAuthor } from "../stores/communityStore";

interface PostCardProps {
  post: PostWithAuthor;
  onPress: () => void;
}

export function PostCard({ post, onPress }: PostCardProps) {
  const { t, i18n } = useTranslation();
  const authorName = post.is_anonymous
    ? t("community.post.anonymous")
    : post.author?.display_name ?? post.author?.username ?? t("community.post.unknownUser");

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: i18n.language === "fr" ? fr : enUS,
  });

  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {post.is_anonymous ? (
            <Ionicons name="person" size={20} color="#8B5CF6" />
          ) : post.author?.avatar_url ? (
            <Image
              source={{ uri: post.author.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <Text style={styles.avatarPlaceholder}>
              {authorName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.authorName}>{authorName}</Text>
          <Text style={styles.timestamp}>{timeAgo}</Text>
        </View>
        {post.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <Text style={styles.content} numberOfLines={4}>
        {post.content}
      </Text>

      {/* Screenshot preview */}
      {post.screenshot_url && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: post.screenshot_url }}
            style={styles.image}
            resizeMode="cover"
            blurRadius={10}
          />
          <View style={styles.overlay}>
            <View style={styles.overlayBadge}>
              <Text style={styles.overlayText}>{t("community.post.viewConversation")}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
          <Text style={styles.footerText}>
            {post.replies_count}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="heart-outline" size={18} color="#6B7280" />
          <Text style={styles.footerText}>
            {post.likes_count}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 30, 46, 0.7)', // Glassmorphism background
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    color: "#A78BFA",
    fontWeight: "700",
    fontSize: 16,
  },
  headerText: {
    flex: 1,
  },
  authorName: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 2,
  },
  timestamp: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  categoryBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  categoryText: {
    color: "#A78BFA",
    fontSize: 11,
    fontWeight: "600",
  },
  content: {
    color: "white",
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 160,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  overlayText: {
    color: "white",
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  footerText: {
    color: "#6B7280", // text-gray-500
    marginLeft: 4,
    fontSize: 14,
  },
});
