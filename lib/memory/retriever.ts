import type { Memory } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Retrieve user memories relevant to the current conversation context
 */
export async function getRelevantMemories(
  supabase: SupabaseClient,
  userId: string,
  currentQuery: string,
  limit = 5
): Promise<Memory[]> {
  try {
    const { data: allMemories, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .order("importance", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error || !allMemories || allMemories.length === 0) {
      return [];
    }

    const queryTokens = currentQuery.toLowerCase().split(/\W+/).filter((t) => t.length > 2);

    // Score memories by keyword overlap & importance
    const scored = (allMemories as Memory[]).map((mem) => {
      const memTokens = mem.memory.toLowerCase().split(/\W+/);
      let matchCount = 0;

      for (const qt of queryTokens) {
        if (memTokens.includes(qt)) {
          matchCount++;
        }
      }

      const relevanceScore = matchCount * 10 + (mem.importance || 3);
      return { mem, score: relevanceScore };
    });

    // Sort by score descending and return top matches
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.mem);
  } catch (err) {
    console.warn("Error fetching relevant memories:", err);
    return [];
  }
}

/**
 * Format retrieved user memories into system context instructions
 */
export function formatMemoriesForPrompt(memories: Memory[]): string {
  if (!memories || memories.length === 0) return "";

  const formattedItems = memories
    .map((m) => `- [${m.category.toUpperCase()}] ${m.memory}`)
    .join("\n");

  return `[USER_LONG_TERM_MEMORIES]\nThe following are persistent facts, preferences, and background knowledge about the user:\n${formattedItems}\nIncorporate this user context naturally and seamlessly when relevant, without awkwardly stating that you are looking up a memory database.`;
}
