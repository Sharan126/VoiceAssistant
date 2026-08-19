import { createClient } from "@/supabase/client";
import { getErrorMessage } from "@/utils/errors";
import type { LoginInput, SignupInput, AuthResponse } from "@/types/auth.types";
import type { User, Session, Provider } from "@supabase/supabase-js";

/**
 * Service handling client-side authentication interactions with Supabase.
 */
export const authService = {
  /**
   * Log in user with email & password
   */
  async signInWithPassword({ email, password }: LoginInput): Promise<AuthResponse<{ user: User; session: Session }>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: "Failed to establish session. Please try again.",
        };
      }

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err),
      };
    }
  },

  /**
   * Register new user with email & password
   */
  async signUpWithPassword({
    email,
    password,
    fullName,
  }: SignupInput): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            full_name: fullName ?? "",
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err),
      };
    }
  },

  /**
   * OAuth Sign-in (Google / GitHub)
   */
  async signInWithOAuth(provider: Provider): Promise<AuthResponse<{ url: string | null }>> {
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: {
          url: data.url,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err),
      };
    }
  },

  /**
   * Sign out the active user
   */
  async signOut(): Promise<AuthResponse<void>> {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err),
      };
    }
  },

  /**
   * Get current validated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Get current active session
   */
  async getSession(): Promise<Session | null> {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch {
      return null;
    }
  },
};
