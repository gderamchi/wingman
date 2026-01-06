import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";
// import * as AppleAuthentication from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { supabase } from "@/src/core/api/supabase";
import type { Profile } from "@/src/types/database";

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  // signInWithApple: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Initialize auth state from Supabase
      initialize: async () => {
        try {
          set({ isLoading: true });

          // Get current session
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            set({
              user: session.user,
              session,
              profile,
              isLoading: false,
              isInitialized: true,
            });
          } else {
            set({
              user: null,
              session: null,
              profile: null,
              isLoading: false,
              isInitialized: true,
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

              set({ user: session.user, session, profile });
            } else if (event === "SIGNED_OUT") {
              set({ user: null, session: null, profile: null });
            }
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Initialization failed",
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      // Sign in with email/password
      signIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Fetch profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          set({
            user: data.user,
            session: data.session,
            profile,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Sign in failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Sign in with Google
      signInWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });

          const redirectUri = makeRedirectUri({
            scheme: "wingman",
            path: "auth/callback",
          });
          console.log("🔵 Google OAuth Redirect URI:", redirectUri);

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: redirectUri,
              skipBrowserRedirect: true,
            },
          });

          if (error) throw error;

          if (data.url) {
            const result = await WebBrowser.openAuthSessionAsync(
              data.url,
              redirectUri
            );

            if (result.type === "success" && result.url) {
              const url = new URL(result.url);
              const accessToken = url.searchParams.get("access_token") || url.hash.match(/access_token=([^&]*)/)?.[1];
              const refreshToken = url.searchParams.get("refresh_token") || url.hash.match(/refresh_token=([^&]*)/)?.[1];

              if (!accessToken || !refreshToken) {
                 // Sometimes Supabase returns the session via URL params if implicit flow?
                 // Actually, with PKCE (default in v2), we exchange code.
                 // But supabase-js handles exchange if we let it?
                 // If we use signInWithOAuth, it just gives us the URL to start.
                 // The redirect holds the tokens (implicit) or code (PKCE).
                 // For now, assume implicit flow or handle the hash fragment.
                 // Let's rely on supabase.auth.getSession() picking it up if we link back?
                 // No, safer to extract.
                 // If tokens are missing, we might have just closed the browser.
                 // Let's try to set session if we see tokens.
                 throw new Error("No tokens found in redirect URL");
              }

              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) throw sessionError;

              // Profile fetch logic (duplicated, could be refactored)
              if (sessionData.user) {
                 const { data: profile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", sessionData.user.id)
                  .single();

                  if (!profile) {
                    // Create profile if missing (first social login)
                    await supabase.from("profiles").insert({
                        id: sessionData.user.id,
                        language: "fr",
                        onboarding_completed: false,
                    } as any);
                     // Refetch
                    const { data: newProfile } = await supabase
                      .from("profiles")
                      .select("*")
                      .eq("id", sessionData.user.id)
                      .single();

                     set({
                        user: sessionData.user,
                        session: sessionData.session,
                        profile: newProfile,
                        isLoading: false,
                     });
                  } else {
                     set({
                        user: sessionData.user,
                        session: sessionData.session,
                        profile,
                        isLoading: false,
                     });
                  }
              }
            } else {
               set({ isLoading: false }); // Cancelled
            }
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Google sign in failed",
            isLoading: false,
          });
          // Don't re-throw to avoid crashing UI, just store error
        }
      },

      // Sign in with Apple
      /*
      signInWithApple: async () => {
        try {
          if (Platform.OS !== "ios") {
             throw new Error("Apple Sign In is only available on iOS");
          }

          set({ isLoading: true, error: null });

          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });

          if (credential.identityToken) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "apple",
              token: credential.identityToken,
            });

            if (error) throw error;

            if (data.user) {
              // Profile check/create logic
               const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", data.user.id)
                .single();

                if (!profile) {
                  await supabase.from("profiles").insert({
                      id: data.user.id,
                      language: "fr",
                      onboarding_completed: false,
                  } as any);
                   const { data: newProfile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", data.user.id)
                    .single();

                   set({
                      user: data.user,
                      session: data.session,
                      profile: newProfile,
                      isLoading: false,
                   });
                } else {
                   set({
                      user: data.user,
                      session: data.session,
                      profile,
                      isLoading: false,
                   });
                }
            }
          }
        } catch (error: any) {
           if (error.code === 'ERR_CANCELED') {
              set({ isLoading: false });
           } else {
              set({
                error: error instanceof Error ? error.message : "Apple sign in failed",
                isLoading: false,
              });
           }
        }
      },
      */

      // Sign up with email/password
      signUp: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

            if (data.user) {
              // 1. Try to fetch profile (should be created by DB trigger)
              let { data: profile, error: fetchError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", data.user.id)
                .single();

              // 2. If missing, manually create it (fallback)
              if (!profile) {
                const { error: insertError } = await supabase.from("profiles").insert({
                  id: data.user.id,
                  language: "fr",
                  onboarding_completed: false,
                } as any);

                if (insertError) {
                  // If insert fails (e.g. race condition), try fetching again
                   const { data: retryProfile, error: retryError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", data.user.id)
                    .single();

                    if (retryError) throw insertError; // Real error
                    profile = retryProfile;
                } else {
                   // Insert success, fetch it
                   const { data: newProfile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", data.user.id)
                    .single();
                    profile = newProfile;
                }
              }

              set({
                user: data.user,
                session: data.session,
                profile,
                isLoading: false,
              });
            }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Sign up failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Sign out failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Update profile
      updateProfile: async (updates) => {
        try {
          const { user } = get();
          if (!user) throw new Error("No user logged in");

          set({ isLoading: true, error: null });

          const { error } = await supabase
            .from("profiles")
            .update({ ...updates, updated_at: new Date().toISOString() } as any as never)
            .eq("id", user.id);

          if (error) throw error;

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          set({ profile, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Profile update failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "wingman-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);

// Selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.session);
export const useIsOnboardingComplete = () =>
  useAuthStore((state) => state.profile?.onboarding_completed ?? false);
