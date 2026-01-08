import { create } from "zustand";

import { supabase } from "@/src/core/api/supabase";
import type { Post, PostReply, Profile } from "@/src/types/database";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PostWithAuthor extends Post {
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  userLiked?: boolean;
}

export interface ReplyWithAuthor extends PostReply {
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  userVote?: "up" | "down" | null;
}

interface CommunityState {
  // Posts
  posts: PostWithAuthor[];
  isLoadingPosts: boolean;
  selectedPost: PostWithAuthor | null;

  // Replies
  replies: ReplyWithAuthor[];
  isLoadingReplies: boolean;

  // Filters
  category: string | null;

  // Error
  error: string | null;

  // Actions
  fetchPosts: (category?: string) => Promise<void>;
  fetchPostById: (postId: string) => Promise<void>;
  createPost: (content: string, screenshotUrl?: string, isAnonymous?: boolean) => Promise<string | null>;

  fetchReplies: (postId: string, userId?: string) => Promise<void>;
  createReply: (postId: string, content: string) => Promise<void>;
  voteReply: (replyId: string, voteType: "up" | "down") => Promise<void>;
  likePost: (postId: string) => Promise<void>;

  setCategory: (category: string | null) => void;
  clearError: () => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  // Initial state
  posts: [],
  isLoadingPosts: false,
  selectedPost: null,
  replies: [],
  isLoadingReplies: false,
  category: null,
  error: null,
  _isVoting: false, // Internal lock to prevent race conditions

  // Fetch all posts
  fetchPosts: async (category) => {
    // Prevent concurrent fetches
    if (get().isLoadingPosts) {
      console.log("[CommunityStore] Already loading posts, skipping...");
      return;
    }

    set({ isLoadingPosts: true, error: null });
    console.log("[CommunityStore] fetchPosts started", { category });

    try {
      // Validate Supabase client
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      console.log("[CommunityStore] Building query...");

      // Build query
      let queryBuilder = supabase
        .from("posts")
        .select(`
          *,
          author:profiles(id, username, display_name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      // Apply category filter if provided
      if (category) {
        queryBuilder = queryBuilder.eq("category", category);
        console.log("[CommunityStore] Filtering by category:", category);
      }

      const { data, error } = await queryBuilder;

      console.log("[CommunityStore] Query completed", {
        hasData: !!data,
        dataLength: data?.length,
        hasError: !!error,
        errorMessage: error?.message
      });

      if (error) {
        console.error("[CommunityStore] Supabase query error:", {
          message: error.message,
          details: (error as any).details,
          hint: (error as any).hint,
          code: (error as any).code,
        });
        throw error;
      }

      const posts = (data as PostWithAuthor[]) ?? [];
      console.log("[CommunityStore] Successfully loaded posts:", posts.length);

      set({ posts, error: null });
    } catch (error) {
      let errorMessage = "Failed to load posts";

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("[CommunityStore] Caught error:", error.message, error.stack);

        // Provide more actionable error messages
        if (error.message.includes("not configured") || error.message.includes("Supabase")) {
          errorMessage = "Database connection error. Please check your configuration.";
        } else if (error.message.includes("JWT") || error.message.includes("auth")) {
          errorMessage = "Authentication error. Please try logging in again.";
        } else if (error.message.includes("permission") || error.message.includes("policy")) {
          errorMessage = "Permission denied. You may need to sign in to view posts.";
        } else if (error.message.includes("relation") || error.message.includes("does not exist")) {
          errorMessage = "Database table not found. Please run migrations.";
        }
      } else {
        console.error("[CommunityStore] Unknown error type:", error);
      }

      console.error("[CommunityStore] fetchPosts error:", {
        error,
        errorMessage,
        category,
      });

      set({ error: errorMessage });
    } finally {
      console.log("[CommunityStore] fetchPosts finished, setting isLoadingPosts to false");
      // ALWAYS reset loading state - this is the key fix
      set({ isLoadingPosts: false });
    }
  },

  // Fetch single post
  fetchPostById: async (postId) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles(id, username, display_name, avatar_url)
        `)
        .eq("id", postId)
        .single();

      if (error) throw error;

      set({ selectedPost: data as PostWithAuthor });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load post",
      });
    }
  },

  // Create new post
  createPost: async (content, screenshotUrl, isAnonymous = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          content,
          screenshot_url: screenshotUrl,
          is_anonymous: isAnonymous,
        } as any)
        .select("id")
        .single();

      if (error) throw error;

      // Refresh posts
      await get().fetchPosts(get().category ?? undefined);

      return (data as any)?.id ?? null;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create post",
      });
      return null;
    }
  },

  // Fetch replies for a post
  fetchReplies: async (postId, userId) => {
    try {
      set({ isLoadingReplies: true, error: null });

      const { data: replies, error: repliesError } = await supabase
        .from("post_replies")
        .select(`
          *,
          author:profiles(id, username, display_name, avatar_url)
        `)
        .eq("post_id", postId)
        .order("upvotes", { ascending: false });

      if (repliesError) throw repliesError;

      // Get user votes if logged in
      let userVotes: Record<string, "up" | "down"> = {};
      if (userId) {
        const { data: votes } = await supabase
          .from("votes")
          .select("reply_id, vote_type")
          .eq("user_id", userId);

        if (votes) {
          userVotes = (votes as any[]).reduce((acc: Record<string, "up" | "down">, v: any) => {
            acc[v.reply_id] = v.vote_type as "up" | "down";
            return acc;
          }, {} as Record<string, "up" | "down">);
        }
      }

      const repliesWithVotes = ((replies ?? []) as any[]).map((reply: any) => ({
        ...reply,
        userVote: userVotes[reply.id] ?? null,
      })) as ReplyWithAuthor[];

      // Sort by score (upvotes - downvotes) descending
      const sortedReplies = repliesWithVotes.sort((a, b) => {
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        return scoreB - scoreA;
      });

      set({
        replies: sortedReplies,
        isLoadingReplies: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load replies",
        isLoadingReplies: false,
      });
    }
  },

  // Create reply
  createReply: async (postId, content) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("post_replies")
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
        } as any);

      if (error) throw error;

      // Note: replies_count will be updated via RLS trigger or manually

      // Refresh replies
      await get().fetchReplies(postId, user.id);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create reply",
      });
    }
  },

  // Vote on reply
  voteReply: async (replyId, voteType) => {
    // Prevent concurrent votes
    if ((get() as any)._isVoting) {
      console.log("[CommunityStore] Vote already in progress, skipping...");
      return;
    }
    (set as any)({ _isVoting: true });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { replies } = get();
      const reply = replies.find((r) => r.id === replyId);
      if (!reply) return;

      const currentVote = reply.userVote;

      if (currentVote === voteType) {
        // Remove vote
        await supabase
          .from("votes")
          .delete()
          .eq("user_id", user.id)
          .eq("reply_id", replyId);

        // Update counts
        if (voteType === "up") {
          await supabase
            .from("post_replies")
            .update({ upvotes: reply.upvotes - 1 } as any as never)
            .eq("id", replyId);
        } else {
          await supabase
            .from("post_replies")
            .update({ downvotes: reply.downvotes - 1 } as any as never)
            .eq("id", replyId);
        }
      } else {
        // Upsert vote
        await supabase
          .from("votes")
          .upsert({
            user_id: user.id,
            reply_id: replyId,
            vote_type: voteType,
          } as any);

        // Update counts
        if (currentVote) {
          // Switch vote
          if (voteType === "up") {
            await supabase
              .from("post_replies")
              .update({
                upvotes: reply.upvotes + 1,
                downvotes: reply.downvotes - 1,
              } as any as never)
              .eq("id", replyId);
          } else {
            await supabase
              .from("post_replies")
              .update({
                upvotes: reply.upvotes - 1,
                downvotes: reply.downvotes + 1,
              } as any as never)
              .eq("id", replyId);
          }
        } else {
          // New vote
          if (voteType === "up") {
            await supabase
              .from("post_replies")
              .update({ upvotes: reply.upvotes + 1 } as any as never)
              .eq("id", replyId);
          } else {
            await supabase
              .from("post_replies")
              .update({ downvotes: reply.downvotes + 1 } as any as never)
              .eq("id", replyId);
          }
        }
      }

      // Update local state
      set({
        replies: replies.map((r) =>
          r.id === replyId
            ? {
                ...r,
                userVote: currentVote === voteType ? null : voteType,
                upvotes:
                  voteType === "up"
                    ? currentVote === "up"
                      ? r.upvotes - 1
                      : r.upvotes + 1
                    : currentVote === "up"
                    ? r.upvotes - 1
                    : r.upvotes,
                downvotes:
                  voteType === "down"
                    ? currentVote === "down"
                      ? r.downvotes - 1
                      : r.downvotes + 1
                    : currentVote === "down"
                    ? r.downvotes - 1
                    : r.downvotes,
              }
            : r
        ),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to vote",
      });
    } finally {
      (set as any)({ _isVoting: false });
    }
  },

  // Like a post (toggle)
  likePost: async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { posts, selectedPost } = get();
      const post = posts.find((p) => p.id === postId) || selectedPost;
      if (!post) return;

      const isCurrentlyLiked = post.userLiked === true;

      if (isCurrentlyLiked) {
        // Unlike: Remove the like
        await supabase
          .from("post_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);

        // Decrement likes_count
        await supabase
          .from("posts")
          .update({ likes_count: (post.likes_count || 1) - 1 } as any)
          .eq("id", postId);
      } else {
        // Like: Insert a new like
        await supabase
          .from("post_likes")
          .upsert({
            user_id: user.id,
            post_id: postId,
          } as any);

        // Increment likes_count
        await supabase
          .from("posts")
          .update({ likes_count: (post.likes_count || 0) + 1 } as any)
          .eq("id", postId);
      }

      // Update local state
      const newLikeState = !isCurrentlyLiked;
      const newLikesCount = isCurrentlyLiked
        ? (post.likes_count || 1) - 1
        : (post.likes_count || 0) + 1;

      set({
        posts: posts.map((p) =>
          p.id === postId
            ? { ...p, userLiked: newLikeState, likes_count: newLikesCount }
            : p
        ),
        selectedPost:
          selectedPost?.id === postId
            ? { ...selectedPost, userLiked: newLikeState, likes_count: newLikesCount }
            : selectedPost,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to like post",
      });
    }
  },

  // Set category filter
  setCategory: (category) => {
    set({ category });
    get().fetchPosts(category ?? undefined);
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

// Selectors
export const usePosts = () => useCommunityStore((s) => s.posts);
export const useSelectedPost = () => useCommunityStore((s) => s.selectedPost);
export const useReplies = () => useCommunityStore((s) => s.replies);
