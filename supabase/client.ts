import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";

/**
 * Creates a Supabase client for use in Client Components (Browser).
 * Automatically reads and synchronizes session state via cookies.
 */
export function createClient() {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "placeholder-anon-key";

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
