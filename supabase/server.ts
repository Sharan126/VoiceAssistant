import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database.types";

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * Uses Next.js cookies() API to read and mutate cookies.
 */
export async function createClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "placeholder-anon-key";

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Can happen in Server Components where cookies are read-only.
            // The middleware takes care of session refresh in that case.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Can happen in Server Components where cookies are read-only.
          }
        },
      },
    }
  );
}
