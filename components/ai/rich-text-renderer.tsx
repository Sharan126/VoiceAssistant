"use client";

import React, { useMemo } from "react";
import { CodeBlock } from "./code-block";
import { ExternalLink, Lightbulb, AlertTriangle, Info, CheckCircle2, CheckSquare, Square } from "lucide-react";

interface RichTextRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

/**
 * Universal Clean Response Renderer for Aura Voice.
 * Transforms Markdown and structured text into a clean, modern UI
 * without exposing raw Markdown formatting syntax.
 */
export function RichTextRenderer({
  content = "",
  isStreaming = false,
  className = "",
}: RichTextRendererProps) {
  const renderedElements = useMemo(() => {
    let text = content || "";
    if (!text.trim()) return null;

    // Clean streaming artifacts if streaming is active
    if (isStreaming) {
      // Balance unclosed code blocks temporarily
      const codeFenceCount = (text.match(/```/g) || []).length;
      if (codeFenceCount % 2 !== 0) {
        text += "\n```";
      }
    }

    const blocks = parseBlocks(text);
    return blocks.map((block, index) => renderBlock(block, index));
  }, [content, isStreaming]);

  return (
    <div className={`space-y-3.5 text-sm sm:text-base leading-relaxed text-foreground ${className}`}>
      {renderedElements}
    </div>
  );
}

interface BlockNode {
  type: "heading" | "code" | "table" | "callout" | "list" | "paragraph" | "hr";
  level?: number;
  language?: string;
  code?: string;
  headers?: string[];
  rows?: string[][];
  calloutType?: "tip" | "important" | "warning" | "result" | "quote";
  listType?: "unordered" | "ordered" | "checklist";
  items?: { text: string; checked?: boolean }[];
  text?: string;
}

/**
 * Parse input string into structured block nodes
 */
function parseBlocks(rawText: string): BlockNode[] {
  const lines = rawText.split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    // 1. Fenced Code Block: ```lang
    if (line.trim().startsWith("```")) {
      const langMatch = line.trim().match(/^```([a-zA-Z0-9_+#-]*)/);
      const language = langMatch?.[1] || "code";
      const codeLines: string[] = [];
      i++;

      while (i < lines.length && !lines[i]?.trim().startsWith("```")) {
        codeLines.push(lines[i] ?? "");
        i++;
      }
      i++; // Skip closing ```

      blocks.push({
        type: "code",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    // 2. Horizontal Rule: --- or ***
    if (/^(?:---|\*\*\*|___)\s*$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 3. Headings: # Heading, ## Heading, ### Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1]?.length || 1;
      const text = headingMatch[2]?.trim() || "";
      blocks.push({
        type: "heading",
        level,
        text,
      });
      i++;
      continue;
    }

    // 4. Blockquote / Callout: > text
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]?.trim().startsWith(">")) {
        quoteLines.push((lines[i] ?? "").replace(/^>\s?/, ""));
        i++;
      }
      const fullQuote = quoteLines.join("\n").trim();
      let calloutType: BlockNode["calloutType"] = "quote";

      if (/^(?:tip|💡)/i.test(fullQuote)) calloutType = "tip";
      else if (/^(?:important|note|📌)/i.test(fullQuote)) calloutType = "important";
      else if (/^(?:warning|caution|⚠️)/i.test(fullQuote)) calloutType = "warning";
      else if (/^(?:result|success|✅)/i.test(fullQuote)) calloutType = "result";

      blocks.push({
        type: "callout",
        calloutType,
        text: fullQuote.replace(/^(?:tip|important|note|warning|caution|result|success|💡|📌|⚠️|✅)[:\s]*/i, ""),
      });
      continue;
    }

    // 5. Tables: | Header | Header |
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i]?.trim().startsWith("|") && lines[i]?.trim().endsWith("|")) {
        tableLines.push(lines[i]?.trim() ?? "");
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (r: string) =>
          r
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.trim());

        const headers = parseRow(tableLines[0] || "");
        const contentRows = tableLines.slice(1).filter((r) => !/^\|[\s:|-]+\|$/.test(r));
        const rows = contentRows.map(parseRow);

        blocks.push({
          type: "table",
          headers,
          rows,
        });
        continue;
      }
    }

    // 6. Lists (Unordered, Ordered, Checklist)
    const isUnordered = /^\s*[-*+]\s+/.test(line);
    const isOrdered = /^\s*\d+\.\s+/.test(line);
    const isChecklist = /^\s*[-*+]\s+\[[ xX]\]\s+/.test(line);

    if (isUnordered || isOrdered || isChecklist) {
      let listType: BlockNode["listType"] = isChecklist
        ? "checklist"
        : isOrdered
        ? "ordered"
        : "unordered";

      const items: { text: string; checked?: boolean }[] = [];

      while (i < lines.length) {
        const curLine = lines[i] ?? "";
        const curCheck = curLine.match(/^\s*[-*+]\s+\[([ xX])\]\s+(.+)$/);
        const curUnordered = curLine.match(/^\s*[-*+]\s+(.+)$/);
        const curOrdered = curLine.match(/^\s*\d+\.\s+(.+)$/);

        if (curCheck) {
          items.push({
            text: curCheck[2]?.trim() || "",
            checked: curCheck[1]?.toLowerCase() === "x",
          });
          i++;
        } else if (curUnordered && listType !== "ordered") {
          items.push({ text: curUnordered[1]?.trim() || "" });
          i++;
        } else if (curOrdered && listType === "ordered") {
          items.push({ text: curOrdered[1]?.trim() || "" });
          i++;
        } else {
          break;
        }
      }

      blocks.push({
        type: "list",
        listType,
        items,
      });
      continue;
    }

    // 7. Paragraph
    if (line.trim()) {
      const paragraphLines: string[] = [];
      while (
        i < lines.length &&
        lines[i]?.trim() &&
        !lines[i]?.trim().startsWith("```") &&
        !lines[i]?.trim().startsWith("#") &&
        !lines[i]?.trim().startsWith(">") &&
        !lines[i]?.trim().startsWith("|") &&
        !/^\s*[-*+]\s+/.test(lines[i] ?? "") &&
        !/^\s*\d+\.\s+/.test(lines[i] ?? "")
      ) {
        paragraphLines.push(lines[i]?.trim() ?? "");
        i++;
      }

      blocks.push({
        type: "paragraph",
        text: paragraphLines.join(" "),
      });
      continue;
    }

    i++;
  }

  return blocks;
}

/**
 * Render individual block node to clean React UI element
 */
function renderBlock(block: BlockNode, key: number) {
  switch (block.type) {
    case "code":
      return <CodeBlock key={key} language={block.language} code={block.code || ""} />;

    case "hr":
      return <hr key={key} className="my-4 border-border/60" />;

    case "heading": {
      const content = renderInlineFormatting(block.text || "");
      if (block.level === 1) {
        return (
          <h1 key={key} className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-5 mb-2">
            {content}
          </h1>
        );
      }
      if (block.level === 2) {
        return (
          <h2 key={key} className="text-lg sm:text-xl font-bold tracking-tight text-foreground mt-4 mb-2">
            {content}
          </h2>
        );
      }
      return (
        <h3 key={key} className="text-base sm:text-lg font-semibold text-foreground mt-3 mb-1">
          {content}
        </h3>
      );
    }

    case "callout": {
      const type = block.calloutType || "quote";
      const config = {
        tip: {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
          icon: <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />,
          label: "Tip",
        },
        important: {
          bg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
          icon: <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />,
          label: "Important",
        },
        warning: {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-300",
          icon: <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />,
          label: "Warning",
        },
        result: {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />,
          label: "Result",
        },
        quote: {
          bg: "bg-card/70 border-primary/30 text-muted-foreground",
          icon: null,
          label: null,
        },
      }[type];

      return (
        <div
          key={key}
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 my-3 shadow-sm ${config.bg}`}
        >
          {config.icon}
          <div className="flex-1 text-sm leading-relaxed">
            {config.label && <span className="font-semibold mr-1.5">{config.label}:</span>}
            {renderInlineFormatting(block.text || "")}
          </div>
        </div>
      );
    }

    case "table": {
      return (
        <div key={key} className="overflow-x-auto my-4 rounded-xl border border-border/80 bg-card/60 shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            {block.headers && block.headers.length > 0 && (
              <thead className="bg-muted/80 border-b border-border/80 text-foreground font-semibold">
                <tr>
                  {block.headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-4 py-2.5 whitespace-nowrap">
                      {renderInlineFormatting(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows?.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors"
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5">
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "list": {
      if (block.listType === "checklist") {
        return (
          <div key={key} className="space-y-2 my-2.5 pl-1">
            {block.items?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-foreground/90">
                {item.checked ? (
                  <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <span className={item.checked ? "line-through text-muted-foreground" : ""}>
                  {renderInlineFormatting(item.text)}
                </span>
              </div>
            ))}
          </div>
        );
      }

      if (block.listType === "ordered") {
        return (
          <ol key={key} className="list-decimal list-inside space-y-1.5 my-2.5 pl-2 text-foreground/90">
            {block.items?.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="ml-1">{renderInlineFormatting(item.text)}</span>
              </li>
            ))}
          </ol>
        );
      }

      return (
        <ul key={key} className="list-disc list-inside space-y-1.5 my-2.5 pl-2 text-foreground/90">
          {block.items?.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              <span className="ml-1">{renderInlineFormatting(item.text)}</span>
            </li>
          ))}
        </ul>
      );
    }

    case "paragraph":
    default:
      return (
        <p key={key} className="leading-relaxed text-foreground/90 my-1.5">
          {renderInlineFormatting(block.text || "")}
        </p>
      );
  }
}

/**
 * Render inline formatting (bold, italic, inline code, links) safely
 */
function renderInlineFormatting(inlineText: string): React.ReactNode {
  if (!inlineText) return null;

  // Regex tokenizer for inline code, links, bold, italic
  const parts: React.ReactNode[] = [];
  let keyIdx = 0;

  // Pattern matches:
  // 1. Inline code: `code`
  // 2. Markdown link: [label](url)
  // 3. Raw URL: https://... or http://...
  // 4. Bold: **text** or __text__
  // 5. Italic: *text* or _text_
  const inlineRegex =
    /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(https?:\/\/[^\s<]+)|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*]+\*|_[^_]+_)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(inlineText)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      parts.push(inlineText.substring(lastIndex, match.index));
    }

    const matchedStr = match[0];

    // 1. Inline Code `code`
    if (matchedStr.startsWith("`") && matchedStr.endsWith("`")) {
      const codeVal = matchedStr.slice(1, -1);
      parts.push(
        <code
          key={keyIdx++}
          className="px-1.5 py-0.5 rounded-md bg-muted/80 font-mono text-xs text-indigo-400 font-medium border border-indigo-500/20"
        >
          {codeVal}
        </code>
      );
    }
    // 2. Markdown Link [label](url)
    else if (matchedStr.startsWith("[") && matchedStr.includes("](")) {
      const linkMatch = matchedStr.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const label = linkMatch[1];
        const url = linkMatch[2];
        parts.push(
          <a
            key={keyIdx++}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-0.5 font-medium transition-colors"
          >
            <span>{label}</span>
            <ExternalLink className="h-3 w-3 inline" />
          </a>
        );
      } else {
        parts.push(matchedStr);
      }
    }
    // 3. Raw URL
    else if (matchedStr.startsWith("http://") || matchedStr.startsWith("https://")) {
      parts.push(
        <a
          key={keyIdx++}
          href={matchedStr}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-0.5 font-medium transition-colors break-all"
        >
          <span>{matchedStr}</span>
          <ExternalLink className="h-3 w-3 inline" />
        </a>
      );
    }
    // 4. Bold **text** or __text__
    else if (
      (matchedStr.startsWith("**") && matchedStr.endsWith("**")) ||
      (matchedStr.startsWith("__") && matchedStr.endsWith("__"))
    ) {
      const boldVal = matchedStr.slice(2, -2);
      parts.push(
        <strong key={keyIdx++} className="font-semibold text-foreground">
          {boldVal}
        </strong>
      );
    }
    // 5. Italic *text* or _text_
    else if (
      (matchedStr.startsWith("*") && matchedStr.endsWith("*")) ||
      (matchedStr.startsWith("_") && matchedStr.endsWith("_"))
    ) {
      const italicVal = matchedStr.slice(1, -1);
      parts.push(
        <em key={keyIdx++} className="italic text-foreground/95">
          {italicVal}
        </em>
      );
    } else {
      parts.push(matchedStr);
    }

    lastIndex = match.index + matchedStr.length;
  }

  if (lastIndex < inlineText.length) {
    parts.push(inlineText.substring(lastIndex));
  }

  return parts.length > 0 ? parts : inlineText;
}
