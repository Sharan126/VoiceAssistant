"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/supabase/client";
import { userService } from "@/services/user-service";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database.types";
import type { AuthState } from "@/types/auth.types";

export function useUser(): AuthState & { refreshProfile: () => Promise<void> } {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await userService.getProfile(userId);
    if (data) {
      setProfile(data);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session & user
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error("Error initializing auth state:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: Boolean(user),
    refreshProfile,
  };
}
