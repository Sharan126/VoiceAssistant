import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { AssistantStage } from "@/components/voice/assistant-stage";
import type { Profile } from "@/types/database.types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Assistant",
  description: "Next-generation AI voice assistant interface.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route-level fallback safeguard
  if (!user) {
    redirect("/login?redirectedFrom=/app");
  }

  // Fetch user profile from database
  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = rawProfile as Profile | null;

  return <AssistantStage user={user} profile={profile} />;
}
