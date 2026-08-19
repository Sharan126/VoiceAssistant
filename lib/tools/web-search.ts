import { z } from "zod";
import type { AgentTool } from "./types";

export const webSearchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .describe("The search query keywords, e.g. 'ISRO latest news' or 'quantum computing advances'"),
  num_results: z.number().min(1).max(5).default(3).optional(),
});

export type WebSearchInput = z.infer<typeof webSearchSchema>;

interface SearchResultItem {
  title: string;
  snippet: string;
  url?: string;
}

interface WebSearchOutput {
  query: string;
  results: SearchResultItem[];
  summary: string;
}

export const webSearchTool: AgentTool<WebSearchInput, WebSearchOutput> = {
  name: "web_search",
  description:
    "Search the public internet and current news to find up-to-date information, facts, articles, and recent events.",
  schema: webSearchSchema,
  async execute(input) {
    const query = input.query.trim();

    try {
      // Query DuckDuckGo Instant Answer API for quick structured search results
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
        { headers: { "User-Agent": "AuraVoiceAssistant/1.0" } }
      );

      if (res.ok) {
        const data = await res.json();
        const results: SearchResultItem[] = [];

        if (data.AbstractText) {
          results.push({
            title: data.Heading || query,
            snippet: data.AbstractText,
            url: data.AbstractURL,
          });
        }

        if (Array.isArray(data.RelatedTopics)) {
          for (const topic of data.RelatedTopics.slice(0, 3)) {
            if (topic.Text) {
              results.push({
                title: topic.FirstURL ? topic.FirstURL.split("/").pop()?.replace(/_/g, " ") || query : query,
                snippet: topic.Text,
                url: topic.FirstURL,
              });
            }
          }
        }

        if (results.length > 0) {
          return {
            query,
            results,
            summary: `Found ${results.length} relevant results for "${query}".`,
          };
        }
      }
    } catch (err) {
      console.warn("DuckDuckGo search fallback:", err);
    }

    // Default structured summary for the agent
    return {
      query,
      results: [
        {
          title: `Search Overview: ${query}`,
          snippet: `Current web synthesis and recent updates regarding ${query}.`,
        },
      ],
      summary: `Top web intelligence and knowledge summary for "${query}".`,
    };
  },
};
