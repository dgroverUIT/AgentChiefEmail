import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      // Check current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      set({ user: session?.user || null, loading: false });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user || null });
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ error: "Failed to initialize auth", loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If user doesn't exist, create one
        if (error.message.includes("Invalid login credentials")) {
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email,
              password,
            });

          if (signUpError) throw signUpError;
          set({ user: signUpData.user, loading: false });
          return;
        }
        throw error;
      }

      set({ user: data.user, loading: false });
    } catch (error) {
      console.error("Error signing in:", error);
      set({ error: "Failed to sign in", loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null, loading: false });
    } catch (error) {
      console.error("Error signing out:", error);
      set({ error: "Failed to sign out", loading: false });
    }
  },
}));

// Initialize auth when the hook is first used
useAuth.getState().initialize();
