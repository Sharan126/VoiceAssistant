export interface ExtractedMemory {
  memory: string;
  category: "preference" | "learning_goal" | "work" | "personal" | "general";
  importance: number; // 1 to 5
}

/**
 * Intelligent heuristic extractor for meaningful persistent user facts.
 * Filters out trivial greetings and conversational filler.
 */
export function extractMemoryFromText(text: string): ExtractedMemory | null {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Skip short or trivial conversational phrases
  if (
    trimmed.length < 8 ||
    /^(hi|hello|hey|ok|okay|thanks|thank you|yes|no|cool|bye|goodbye|what's up)\b/i.test(trimmed)
  ) {
    return null;
  }

  // 1. Explicit user commands: "Remember that...", "Remember I...", "Keep in mind that..."
  const explicitMatch = trimmed.match(/(?:remember that|remember I|remember|keep in mind that|note that|please note that)\s+(.*)/i);
  if (explicitMatch && explicitMatch[1] && explicitMatch[1].length > 4) {
    const memory = explicitMatch[1].replace(/[.!]+$/, "").trim();
    return {
      memory: memory.charAt(0).toUpperCase() + memory.slice(1),
      category: lower.includes("work") || lower.includes("deadline") ? "work" : "general",
      importance: 4,
    };
  }

  // 2. Learning Goals: "I am learning C++", "I'm studying algorithms", "I want to learn..."
  const learningMatch = trimmed.match(/(?:i am learning|i'm learning|i am studying|i'm studying|i want to learn|currently learning)\s+([a-zA-Z0-9#+.\s]+)/i);
  if (learningMatch && learningMatch[1]) {
    const topic = learningMatch[1].replace(/[.!?]+$/, "").trim();
    return {
      memory: `User is learning ${topic}`,
      category: "learning_goal",
      importance: 4,
    };
  }

  // 3. Work & Professional Context: "I work as a software engineer", "I am a frontend developer"
  const jobMatch = trimmed.match(/(?:i work as an?|i work in|i am an?|i'm an?)\s+([a-zA-Z\s]+(?:engineer|developer|designer|manager|student|researcher|doctor|analyst|creator|architect))/i);
  if (jobMatch && jobMatch[1]) {
    const role = jobMatch[1].replace(/[.!?]+$/, "").trim();
    return {
      memory: `User works as a ${role}`,
      category: "work",
      importance: 4,
    };
  }

  // 4. Preferences: "My favorite language is Python", "I prefer dark mode", "I love Next.js"
  const prefMatch = trimmed.match(/(?:my favorite|i prefer|i like using|i love using)\s+([a-zA-Z0-9#+.\s]+)/i);
  if (prefMatch && prefMatch[1]) {
    const pref = prefMatch[1].replace(/[.!?]+$/, "").trim();
    return {
      memory: `User preference: prefers ${pref}`,
      category: "preference",
      importance: 3,
    };
  }

  // 5. Personal facts / dates: "My project deadline is September 15", "My dog's name is..."
  const factMatch = trimmed.match(/(?:my [a-zA-Z\s]+ is|my [a-zA-Z\s]+ are)\s+([a-zA-Z0-9\s,]+)/i);
  if (factMatch && trimmed.toLowerCase().includes("deadline") || trimmed.toLowerCase().includes("birthday")) {
    return {
      memory: trimmed.replace(/[.!?]+$/, "").trim(),
      category: "personal",
      importance: 5,
    };
  }

  return null;
}
