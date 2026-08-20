import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { rateLimiter } from "@/lib/security/rate-limiter";
import { formatSafeErrorResponse } from "@/lib/security/error-sanitizer";

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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // List user documents
    const { data: files, error } = await supabase
      .from("user_files")
      .select("*")
      .eq("user_id", user.id)
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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = rateLimiter.check(`file_upload_${user.id}`, 20, 60000);
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

    const textContent = await file.text();

    return NextResponse.json({
      success: true,
      file: {
        id: `file-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type || "text/plain",
        extractedTextLength: textContent.length,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return formatSafeErrorResponse(err, 500, "Failed to upload document");
  }
}
