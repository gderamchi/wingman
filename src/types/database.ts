/**
 * Database types for Supabase
 * Generated from schema - update when migrations change
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          language: string;
          onboarding_completed: boolean;
          main_goal: string | null;
          communication_style: string | null;
          xp_points: number;
          level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          language?: string;
          onboarding_completed?: boolean;
          main_goal?: string | null;
          communication_style?: string | null;
          xp_points?: number;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          language?: string;
          onboarding_completed?: boolean;
          main_goal?: string | null;
          communication_style?: string | null;
          xp_points?: number;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          screenshot_url: string;
          blurred_url: string | null;
          extracted_text: string | null;
          context: Json | null;
          ai_analysis: Json | null;
          suggested_replies: Json | null;
          chosen_reply: string | null;
          outcome: string | null;
          outcome_result: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          screenshot_url: string;
          blurred_url?: string | null;
          extracted_text?: string | null;
          context?: Json | null;
          ai_analysis?: Json | null;
          suggested_replies?: Json | null;
          chosen_reply?: string | null;
          outcome?: string | null;
          outcome_result?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          screenshot_url?: string;
          blurred_url?: string | null;
          extracted_text?: string | null;
          context?: Json | null;
          ai_analysis?: Json | null;
          suggested_replies?: Json | null;
          chosen_reply?: string | null;
          outcome?: string | null;
          outcome_result?: string | null;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          analysis_id: string | null;
          content: string;
          screenshot_url: string | null;
          category: string | null;
          is_anonymous: boolean;
          likes_count: number;
          replies_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          analysis_id?: string | null;
          content: string;
          screenshot_url?: string | null;
          category?: string | null;
          is_anonymous?: boolean;
          likes_count?: number;
          replies_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          analysis_id?: string | null;
          content?: string;
          screenshot_url?: string | null;
          category?: string | null;
          is_anonymous?: boolean;
          likes_count?: number;
          replies_count?: number;
          created_at?: string;
        };
      };
      post_replies: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          upvotes: number;
          downvotes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          upvotes?: number;
          downvotes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          content?: string;
          upvotes?: number;
          downvotes?: number;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          reply_id: string;
          vote_type: "up" | "down";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reply_id: string;
          vote_type: "up" | "down";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reply_id?: string;
          vote_type?: "up" | "down";
          created_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          xp_reward: number;
          start_date: string | null;
          end_date: string | null;
          active: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category?: string | null;
          xp_reward?: number;
          start_date?: string | null;
          end_date?: string | null;
          active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          xp_reward?: number;
          start_date?: string | null;
          end_date?: string | null;
          active?: boolean;
        };
      };
      user_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          completed?: boolean;
          completed_at?: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: string | null;
          plan: string | null;
          trial_end: string | null;
          current_period_end: string | null;
          revenuecat_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string | null;
          plan?: string | null;
          trial_end?: string | null;
          current_period_end?: string | null;
          revenuecat_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string | null;
          plan?: string | null;
          trial_end?: string | null;
          current_period_end?: string | null;
          revenuecat_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Analysis = Database["public"]["Tables"]["analyses"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostReply = Database["public"]["Tables"]["post_replies"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];
export type Challenge = Database["public"]["Tables"]["challenges"]["Row"];
export type UserChallenge = Database["public"]["Tables"]["user_challenges"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
