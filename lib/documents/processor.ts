/* eslint-disable */
const pdfParse = require("pdf-parse");

export type DocumentProcessingStatus = "UPLOADING" | "PROCESSING" | "READY" | "ERROR";

export interface DocumentProcessingResult {
  id: string;
  name: string;
  size: number;
  type: string;
  status: DocumentProcessingStatus;
  extractedText: string;
  extractedTextLength: number;
  errorMessage?: string;
  created_at: string;
}

/**
 * Extracts plain text content from PDF, TXT, or DOCX file buffer
 */
export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  const lowerName = filename.toLowerCase();

  // 1. PDF File Extraction via pdf-parse
  if (mimeType.includes("pdf") || lowerName.endsWith(".pdf")) {
    try {
      const pdfData = await pdfParse(buffer);
      const cleaned = (pdfData.text || "")
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      if (!cleaned) {
        throw new Error("Extracted PDF content is empty or unreadable text.");
      }
      return cleaned;
    } catch (err: any) {
      throw new Error(`PDF text extraction failed: ${err.message || "Unknown error"}`);
    }
  }

  // 2. Plain Text / Code / Markdown Extraction
  if (
    mimeType.includes("text") ||
    mimeType.includes("json") ||
    mimeType.includes("csv") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".csv") ||
    lowerName.endsWith(".json")
  ) {
    const text = buffer.toString("utf-8").trim();
    if (!text) {
      throw new Error("Document text file is empty.");
    }
    return text;
  }

  // 3. DOCX Word Document Extraction (Extracting XML text nodes <w:t>)
  if (
    mimeType.includes("wordprocessingml") ||
    mimeType.includes("msword") ||
    lowerName.endsWith(".docx") ||
    lowerName.endsWith(".doc")
  ) {
    try {
      const rawContent = buffer.toString("utf-8");
      // Match text tags inside docx XML format <w:t ...>Text</w:t>
      const matches = rawContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (matches && matches.length > 0) {
        const text = matches
          .map((tag) => tag.replace(/<[^>]+>/g, ""))
          .join(" ")
          .replace(/\s{2,}/g, " ")
          .trim();

        if (text.length > 0) {
          return text;
        }
      }

      // Fallback: strip binary noise and collect printable ASCII / Unicode text strings
      const printable = rawContent
        .replace(/[^\x20-\x7E\n\t]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

      if (printable.length > 50) {
        return printable;
      }
    } catch (_e) {
      // Ignore fallback errors
    }

    throw new Error("Could not extract readable text from Word document format.");
  }

  // Fallback default text decoding
  const fallbackText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\t]/g, " ").trim();
  if (fallbackText.length > 20) {
    return fallbackText;
  }

  throw new Error(`Unsupported file type '${mimeType}' for text extraction.`);
}
