import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ReplyWithAuthor } from "../stores/communityStore";

interface ReplyCardProps {
  reply: ReplyWithAuthor;
  onVote: (voteType: "up" | "down") => void;
}

export function ReplyCard({ reply, onVote }: ReplyCardProps) {
  const authorName =
    reply.author?.display_name ?? reply.author?.username ?? "Utilisateur";

  const score = reply.upvotes - reply.downvotes;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarPlaceholder}>
            {authorName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.authorName}>{authorName}</Text>
      </View>

      {/* Content */}
      <Text style={styles.content}>"{reply.content}"</Text>

      {/* Voting */}
      <View style={styles.votingContainer}>
        <Pressable
          onPress={() => onVote("up")}
          style={[
            styles.voteButton,
            reply.userVote === "up" ? styles.voteActiveUp : styles.voteInactive,
          ]}
        >
          <Ionicons
            name={reply.userVote === "up" ? "arrow-up" : "arrow-up-outline"}
            size={18}
            color={reply.userVote === "up" ? "#10B981" : "#6B7280"}
          />
          <Text
            style={[
              styles.voteCount,
              reply.userVote === "up" ? styles.textSuccess : styles.textGray,
            ]}
          >
            {reply.upvotes}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onVote("down")}
          style={[
            styles.voteButton,
            reply.userVote === "down" ? styles.voteActiveDown : styles.voteInactive,
          ]}
        >
          <Ionicons
            name={reply.userVote === "down" ? "arrow-down" : "arrow-down-outline"}
            size={18}
            color={reply.userVote === "down" ? "#EF4444" : "#6B7280"}
          />
          <Text
            style={[
              styles.voteCount,
              reply.userVote === "down" ? styles.textError : styles.textGray,
            ]}
          >
            {reply.downvotes}
          </Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <View style={styles.scoreContainer}>
          <Text
            style={[
              styles.scoreText,
              score > 0 ? styles.textSuccess : score < 0 ? styles.textError : styles.textGray,
            ]}
          >
            {score > 0 ? `+${score}` : score}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarPlaceholder: {
    color: "#8B5CF6", // text-primary
    fontSize: 14,
    fontWeight: "600",
  },
  authorName: {
    color: "#9CA3AF", // text-gray-400
    fontSize: 14,
  },
  content: {
    color: "white",
    marginBottom: 12,
    lineHeight: 20,
  },
  votingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  voteInactive: {
    backgroundColor: "#0F0F1A", // bg-dark
  },
  voteActiveUp: {
    backgroundColor: "rgba(16, 185, 129, 0.2)", // bg-success/20
  },
  voteActiveDown: {
    backgroundColor: "rgba(239, 68, 68, 0.2)", // bg-error/20
  },
  voteCount: {
    marginLeft: 4,
    fontSize: 14,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "500",
  },
  textSuccess: { color: "#10B981" },
  textError: { color: "#EF4444" },
  textGray: { color: "#6B7280" },
});
