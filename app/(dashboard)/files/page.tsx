"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Upload, Trash2, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface UserFile {
  id: string;
  name: string;
  size: number;
  type: string;
  created_at: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch("/api/files")
      .then((res) => res.json())
      .then((data) => {
        if (data.files) setFiles(data.files);
      })
      .catch(() => {});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.file) {
        setFiles((prev) => [data.file, ...prev]);
        toast.success(`Uploaded ${file.name} successfully`);
      } else {
        toast.error(data.error || "Failed to upload file");
      }
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success(`Deleted ${name}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/app">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-indigo-400" />
              <span>Ask My Files — Document Knowledge</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Upload PDF, TXT, or DOCX documents to query them using Aura Voice
            </p>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="p-8 rounded-2xl border-2 border-dashed border-border/80 bg-card/60 backdrop-blur-md text-center space-y-3 hover:border-indigo-500/50 transition-colors">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
          <Upload className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Upload Document</h3>
          <p className="text-xs text-muted-foreground">Supports PDF, TXT, DOCX files up to 25MB</p>
        </div>

        <label className="inline-block">
          <input
            type="file"
            accept=".pdf,.txt,.docx,.doc"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            type="button"
            disabled={isUploading}
            className="h-9 px-4 text-xs gap-2 font-medium bg-primary text-primary-foreground pointer-events-none"
          >
            {isUploading ? "Processing Document..." : "Select File"}
          </Button>
        </label>
      </div>

      {/* File List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Uploaded Documents ({files.length})
        </h2>

        {files.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm rounded-xl border border-border/40 bg-card/30">
            No files uploaded yet. Upload a document to start asking questions.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-xl border border-border/70 bg-card/80 flex items-center justify-between shadow-sm backdrop-blur-md"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-semibold truncate text-foreground">{file.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(file.id, file.name)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                  aria-label="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
