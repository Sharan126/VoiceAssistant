/**
 * Intelligent rule-based conversation title generator.
 * Produces clean, concise titles from the user's first prompt without making extra LLM API calls.
 */
export function generateConversationTitle(prompt: string): string {
  if (!prompt || !prompt.trim()) return "New Conversation";

  // Pre-clean input and strip trailing punctuation
  let text = prompt.trim().replace(/[.?!]+$/, "").trim();

  // 1. Common pattern replacements
  const patterns: [RegExp, string | ((match: string, p1: string) => string)][] = [
    // "Help me prepare for GATE" -> "GATE Preparation"
    [
      /^(?:help me prepare for|prepare for|preparing for)\s+([a-zA-Z0-9\s]+)/i,
      (_, topic) => `${capitalizeWords(topic.trim())} Preparation`,
    ],
    // "What is the weather in Tokyo" -> "Tokyo Weather"
    [
      /^(?:what is the weather in|what is today's weather in|what's the weather in|weather in|weather for|today's weather in)\s+([a-zA-Z\s]+)/i,
      (_, loc) => `${capitalizeWords(loc.trim())} Weather`,
    ],
    // "Explain quantum computing" -> "Quantum Computing"
    [
      /^(?:explain|what is|what are|tell me about|how does|how do)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:to me|in simple terms|work|mean))?$/i,
      (_, topic) => capitalizeWords(topic.trim()),
    ],
    // "Write a function to debounce audio streams" -> "Debounce Audio Streams"
    [
      /^(?:write a function to|write code to|how to write|help me code|code for)\s+([a-zA-Z0-9\s]+)/i,
      (_, task) => capitalizeWords(task.trim()),
    ],
    // "Remind me to study algorithms" -> "Reminder: Study Algorithms"
    [
      /^(?:remind me to|create a reminder to|set a reminder to)\s+([a-zA-Z0-9\s]+)/i,
      (_, task) => `Reminder: ${capitalizeWords(task.trim())}`,
    ],
  ];

  for (const [regex, replacement] of patterns) {
    if (regex.test(text)) {
      if (typeof replacement === "string") {
        text = text.replace(regex, replacement);
      } else {
        text = text.replace(regex, replacement as any);
      }
      return truncateTitle(text.replace(/[.?!]+$/, "").trim());
    }
  }

  // 2. Fallback: Strip common leading filler phrases
  text = text
    .replace(/^(can you|could you|please|help me|i want to|i need to|tell me|explain)\s+/i, "")
    .replace(/[.?!]+$/, "")
    .trim();

  return truncateTitle(capitalizeWords(text));
}

function capitalizeWords(str: string): string {
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      // Keep acronyms like GATE, AWS, DSA, ISRO uppercase
      if (word === word.toUpperCase() && word.length > 1) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function truncateTitle(str: string, maxLength = 36): string {
  const cleaned = str.trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 3).trim()}...`;
}
