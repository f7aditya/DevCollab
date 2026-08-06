"use client";

import { useState, useCallback } from "react";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import { uploadFile } from "@/features/files/api/filesApi";

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ onUploadSuccess, accept = "image/*,application/pdf", maxSizeMB = 5 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const validateAndUpload = async (file: File) => {
    setError(null);
    
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Max size is ${maxSizeMB}MB.`);
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadFile(file);
      setUploadedFile(file);
      // Ensure absolute URL if backend returns relative path
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api/v1', '');
      const fullUrl = res.file.url.startsWith('http') 
        ? res.file.url 
        : `${baseUrl}${res.file.url}`;
        
      onUploadSuccess(fullUrl);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const reset = () => {
    setUploadedFile(null);
    setError(null);
  };

  if (uploadedFile && !isUploading) {
    return (
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <FileIcon className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">{uploadedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button onClick={reset} className="text-muted-foreground hover:text-danger p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
        isDragging 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50 hover:bg-surface-hover/50"
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
        disabled={isUploading}
      />
      
      <div className="flex flex-col items-center justify-center gap-2">
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-medium">Uploading securely...</p>
          </>
        ) : (
          <>
            <div className="bg-surface p-3 rounded-full mb-2 shadow-sm">
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
              <span className="text-primary hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Images or PDFs up to {maxSizeMB}MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-2 bg-danger/10 text-danger text-xs rounded border border-danger/20">
          {error}
        </div>
      )}
    </div>
  );
}
