import { z } from "zod";

/**
 * Schema for client-exposed environment variables.
 * Must be prefixed with NEXT_PUBLIC_
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
    .default("https://placeholder-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
    .default("placeholder-anon-key"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
});

/**
 * Schema for server-only environment variables.
 * Never expose these to the browser!
 */
const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default("gpt-4o-mini"),
  AI_BASE_URL: z.string().default("https://api.openai.com/v1"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

/**
 * Validate and safely export parsed environment variables.
 */
function getEnv() {
  const isServer = typeof window === "undefined";

  const rawEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env["NEXT_PUBLIC_SUPABASE_URL"],
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
    SUPABASE_SERVICE_ROLE_KEY: process.env["SUPABASE_SERVICE_ROLE_KEY"],
    AI_API_KEY: process.env["AI_API_KEY"] || process.env["OPENAI_API_KEY"] || process.env["GROQ_API_KEY"],
    OPENAI_API_KEY: process.env["OPENAI_API_KEY"],
    GROQ_API_KEY: process.env["GROQ_API_KEY"],
    AI_MODEL: process.env["AI_MODEL"] || (process.env["GROQ_API_KEY"] && !process.env["OPENAI_API_KEY"] ? "openai/gpt-oss-120b" : "gpt-4o-mini"),
    AI_BASE_URL: process.env["AI_BASE_URL"] || (process.env["GROQ_API_KEY"] && !process.env["OPENAI_API_KEY"] ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1"),
    NODE_ENV: process.env["NODE_ENV"],
  };

  if (isServer) {
    const parsed = serverEnvSchema.safeParse(rawEnv);
    if (!parsed.success) {
      console.error(
        "❌ Invalid server environment variables:",
        parsed.error.flatten().fieldErrors
      );
      return rawEnv as unknown as z.infer<typeof serverEnvSchema>;
    }
    return parsed.data;
  } else {
    const parsed = clientEnvSchema.safeParse(rawEnv);
    if (!parsed.success) {
      console.error(
        "❌ Invalid client environment variables:",
        parsed.error.flatten().fieldErrors
      );
      return rawEnv as unknown as z.infer<typeof clientEnvSchema>;
    }
    return parsed.data;
  }
}

export const env = getEnv();

/**
 * Helper to check if Supabase is properly configured with real credentials
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const key = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  return (
    Boolean(url) &&
    Boolean(key) &&
    !url?.includes("placeholder-project") &&
    key !== "placeholder-anon-key"
  );
}

/**
 * Helper to check if AI provider API key is present on server
 */
export function getAIKey(): string | undefined {
  return process.env["AI_API_KEY"] || process.env["OPENAI_API_KEY"] || process.env["GROQ_API_KEY"];
}
