/**
 * AI Voice Assistant - Comprehensive Automated Test Harness
 * Tests core services, tools, memory extraction, i18n, rate limiting, and security bounds.
 */

import { calculatorTool } from "../lib/tools/calculator";
import { weatherTool } from "../lib/tools/weather";
import { webSearchTool } from "../lib/tools/web-search";
import { remindersSchema } from "../lib/tools/reminders";
import { notesSchema } from "../lib/tools/notes";
import { extractMemoryFromText } from "../lib/memory/extractor";
import { formatMemoriesForPrompt } from "../lib/memory/retriever";
import { rateLimiter } from "../lib/security/rate-limiter";
import { chatRequestSchema, sanitizeInputText } from "../lib/security/input-validator";
import { getTranslations, getLanguageConfig, LANGUAGE_LIST } from "../lib/i18n";
import { generateConversationTitle } from "../utils/title-generator";
import { groupConversationsByDate } from "../utils/date-grouping";
import type { Conversation, Memory } from "../types/database.types";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("🚀 Starting Comprehensive Application Test Suite");
  console.log("=======================================================\n");

  // -------------------------------------------------------------
  // 1. TOOLS: Calculator Test
  // -------------------------------------------------------------
  console.log("🔹 [Domain 1]: Calculator Tool & AST Evaluator");
  try {
    const calc1 = await calculatorTool.execute({ expression: "245 * 87" }, { userId: "test" });
    assert(calc1.result === 21315, "Multiplication: 245 * 87 = 21315");

    const calc2 = await calculatorTool.execute({ expression: "sqrt(144) + 12" }, { userId: "test" });
    assert(calc2.result === 24, "Square Root & Addition: sqrt(144) + 12 = 24");

    const calc3 = await calculatorTool.execute({ expression: "2^8" }, { userId: "test" });
    assert(calc3.result === 256, "Power: 2^8 = 256");

    const calc4 = await calculatorTool.execute({ expression: "(150 * 0.2) + 50" }, { userId: "test" });
    assert(calc4.result === 80, "Precedence: (150 * 0.2) + 50 = 80");
  } catch (err: any) {
    assert(false, `Calculator exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 2. TOOLS: Weather & Search Tools
  // -------------------------------------------------------------
  console.log("\n🔹 [Domain 2]: Weather & Web Search Tools");
  try {
    const weatherRes = await weatherTool.execute({ location: "Tokyo" }, { userId: "test" });
    assert(Boolean(weatherRes.location) && typeof weatherRes.temperature_c === "number", "Weather execution returns temperature and location");

    const searchRes = await webSearchTool.execute({ query: "ISRO latest news" }, { userId: "test" });
    assert(Boolean(searchRes.query) && Array.isArray(searchRes.results), "Web Search execution returns structured results");
  } catch (err: any) {
    assert(false, `Weather/Search exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // 3. TOOLS: Reminders & Notes Schemas
  // -------------------------------------------------------------
  console.log("\n🔹 [Domain 3]: Reminders & Notes Zod Schemas");
  const reminderValid = remindersSchema.safeParse({ action: "create", title: "Study algorithms" });
  assert(reminderValid.success, "Reminders schema validates 'create' action with title");

  const notesValid = notesSchema.safeParse({ action: "save", note: "Project deadline is Sep 15", category: "work" });
  assert(notesValid.success, "Notes schema validates 'save' action with category");

  // -------------------------------------------------------------
  // 4. MEMORY: Heuristic Extractor & Prompt Formatter
  // -------------------------------------------------------------
  console.log("\n🔹 [Domain 4]: Long-Term Memory Extraction & Context Formatting");
  const mem1 = extractMemoryFromText("I am learning C++");
  assert(mem1 !== null && mem1.category === "learning_goal" && mem1.memory.includes("C++"), "Extracts learning goal: 'I am learning C++'");

  const mem2 = extractMemoryFromText("I work as a software engineer");
  assert(mem2 !== null && mem2.category === "work", "Extracts work role: 'I work as a software engineer'");

  const memNoise = extractMemoryFromText("hey hello how are you");
  assert(memNoise === null, "Filters conversational filler noise");

  const sampleMemories: Memory[] = [
    {
      id: "1",
      user_id: "u1",
      memory: "User is learning C++",
      category: "learning_goal",
      importance: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  const promptOutput = formatMemoriesForPrompt(sampleMemories);
  assert(promptOutput.includes("[USER_LONG_TERM_MEMORIES]") && promptOutput.includes("C++"), "Formats memory context into system prompt");

  // -------------------------------------------------------------
  // 5. SECURITY: Rate Limiter & Input Bounds Sanitizer
  // -------------------------------------------------------------
  console.log("\n🔹 [Domain 5]: Sliding-Window Rate Limiter & Input Validation");
  const rateKey = "test-rate-limit-key-" + Date.now();
  for (let i = 0; i < 3; i++) {
    const res = rateLimiter.check(rateKey, 3, 10000);
    assert(res.success, `Rate limit request ${i + 1}/3 permitted`);
  }
  const blockedRes = rateLimiter.check(rateKey, 3, 10000);
  assert(!blockedRes.success && blockedRes.retryAfter > 0, "4th request within window is correctly rate-limited (HTTP 429 threshold)");

  const sanitized = sanitizeInputText("Hello\x00\x08World\nTest\t");
  assert(sanitized === "HelloWorld\nTest\t", "Sanitizes dangerous control characters while preserving newlines and tabs");

  const oversizedMsg = "a".repeat(4500);
  const invalidPayload = chatRequestSchema.safeParse({
    messages: [{ role: "user", content: oversizedMsg }],
  });
  assert(!invalidPayload.success, "Rejects message exceeding 4,000 character upper bound");

  // -------------------------------------------------------------
  // 6. MULTILINGUAL & i18n DICTIONARY
  // -------------------------------------------------------------
  console.log("\n🔹 [Domain 6]: Multilingual i18n Architecture");
  assert(LANGUAGE_LIST.length === 6, "Supports all 6 core languages (en, kn, hi, te, ta, mr)");

  const kannada = getTranslations("kn");
  assert(kannada.greetings.morning === "ಶುಭೋದಯ", "Kannada greeting translation verified");

  const hindi = getTranslations("hi");
  assert(hindi.greetings.evening === "शुभ संध्या", "Hindi greeting translation verified");

  const marathiConfig = getLanguageConfig("mr");
  assert(marathiConfig.speechCode === "mr-IN", "Marathi BCP-47 speech code is mr-IN");

  // -------------------------------------------------------------
  // 7. CONVERSATION MANAGEMENT: Titles & Date Grouping
  // -------------------------------------------------------------
  console.log("\n🔹 [Domain 7]: Title Generation & Date Grouping");
  const title1 = generateConversationTitle("Help me prepare for GATE.");
  assert(title1 === "GATE Preparation", "Title generator: 'Help me prepare for GATE.' -> 'GATE Preparation'");

  const title2 = generateConversationTitle("What is the weather in Tokyo?");
  assert(title2 === "Tokyo Weather", "Title generator: 'What is the weather in Tokyo?' -> 'Tokyo Weather'");

  const now = new Date();
  const testConvs: Conversation[] = [
    {
      id: "c1",
      user_id: "u1",
      title: "Today Chat",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: "c2",
      user_id: "u1",
      title: "Yesterday Chat",
      created_at: new Date(now.getTime() - 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 86400000).toISOString(),
    },
  ];

  const grouped = groupConversationsByDate(testConvs);
  assert(grouped.today.length === 1 && grouped.yesterday.length === 1, "Groups conversations chronologically into Today and Yesterday");

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`📊 Test Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
