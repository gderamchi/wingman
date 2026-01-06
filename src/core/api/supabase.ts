import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { Database } from "@/src/types/database";

// Custom storage adapter for Expo
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Environment variables - should be set in app.config.js or .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Validate Supabase configuration
export const validateSupabaseConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!supabaseUrl || supabaseUrl.trim() === "") {
    errors.push("EXPO_PUBLIC_SUPABASE_URL is missing or empty");
  } else if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
    errors.push("EXPO_PUBLIC_SUPABASE_URL must be a valid URL (starting with http:// or https://)");
  }

  if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
    errors.push("EXPO_PUBLIC_SUPABASE_ANON_KEY is missing or empty");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate on module load
const configValidation = validateSupabaseConfig();
if (!configValidation.isValid) {
  const errorMessage = `[Supabase Configuration Error] ${configValidation.errors.join(", ")}. ` +
    `Please set these environment variables in your .env file or app.config.js. ` +
    `For local development, check supabase/config.toml for your local Supabase URL.`;
  
  console.error(errorMessage);
  
  // In development, throw error to prevent silent failures
  if (__DEV__) {
    console.error(
      "\n" +
      "═══════════════════════════════════════════════════════════════\n" +
      "  SUPABASE CONFIGURATION ERROR\n" +
      "═══════════════════════════════════════════════════════════════\n" +
      errorMessage + "\n" +
      "═══════════════════════════════════════════════════════════════\n"
    );
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

// Storage helpers
export const uploadScreenshot = async (
  userId: string,
  fileName: string,
  file: Blob
): Promise<string> => {
  const path = `screenshots/${userId}/${fileName}`;
  const { data, error } = await supabase.storage
    .from("screenshots")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("screenshots").getPublicUrl(data.path);

  return publicUrl;
};

export const deleteScreenshot = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from("screenshots").remove([path]);
  if (error) throw error;
};
