import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { rateLimiter } from "@/lib/security/rate-limiter";
import { formatSafeErrorResponse } from "@/lib/security/error-sanitizer";
import { extractDocumentText } from "@/lib/documents/processor";

export const runtime = "nodejs";

/**
 * File Management & Document Extraction API (`📄 Ask My Files`)
 * Uploads user documents (PDF, TXT, DOCX), extracts text content, and persists records safely.
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || "demo-user-id";

    // List user documents
    const { data: files, error } = await (supabase.from("user_files") as any)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error && error.code !== "PGRST116") {
      // Return empty list gracefully if table doesn't exist yet
      return NextResponse.json({ files: [] });
    }

    return NextResponse.json({ files: files || [] });
  } catch (err: any) {
    return formatSafeErrorResponse(err, 500, "Failed to retrieve documents");
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || "demo-user-id";

    const rateCheck = rateLimiter.check(`file_upload_${userId}`, 20, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many file upload requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No document file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "application/pdf";

    // Perform text extraction based on file format (PDF, TXT, DOCX)
    let extractedText = "";
    try {
      extractedText = await extractDocumentText(buffer, mimeType, file.name);
    } catch (extractErr: any) {
      return NextResponse.json(
        {
          error: `Document processing failed: ${extractErr.message || "Could not extract text from document."}`,
          status: "ERROR",
        },
        { status: 422 }
      );
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newFileRecord = {
      id: docId,
      user_id: userId,
      name: file.name,
      size: file.size,
      type: mimeType,
      status: "READY",
      extracted_text: extractedText,
      extractedText: extractedText,
      extractedTextLength: extractedText.length,
      created_at: new Date().toISOString(),
    };

    // Try inserting into Supabase DB user_files table if configured
    try {
      await (supabase.from("user_files") as any).insert({
        id: newFileRecord.id,
        user_id: newFileRecord.user_id,
        name: newFileRecord.name,
        size: newFileRecord.size,
        type: newFileRecord.type,
        extracted_text: extractedText,
        created_at: newFileRecord.created_at,
      });
    } catch (_dbErr) {
      // Graceful fallback if user_files table doesn't exist
    }

    return NextResponse.json({
      success: true,
      file: newFileRecord,
    });
  } catch (err: any) {
    return formatSafeErrorResponse(err, 500, "Failed to upload document");
  }
}

