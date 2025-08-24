"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface FileDropzoneProps {
  onUploadStart: (file: File) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (fileId: string) => void;
  onError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSize?: number;
}

export function FileDropzone({
  onUploadStart,
  onProgress,
  onComplete,
  onError,
  acceptedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  maxSize = 10 * 1024 * 1024, // 10MB
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: Array<{ errors: Array<{ code: string }> }>) => {
      setError(null);
      
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e) => e.code === "file-too-large")) {
          setError("File is too large. Maximum size is 10MB.");
        } else if (rejection.errors.some((e) => e.code === "file-invalid-type")) {
          setError("Invalid file type. Please upload a PDF or DOCX file.");
        } else {
          setError("File upload failed. Please try again.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        try {
          onUploadStart(file);
        } catch (err) {
          setError("Failed to process file. Please try again.");
          onError?.("Failed to process file");
        }
      }
    },
    [onUploadStart, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize,
    multiple: false,
  });

  const getAcceptedTypesText = () => {
    return acceptedTypes
      .map(type => {
        if (type === "application/pdf") return "PDF";
        if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
        return type;
      })
      .join(", ");
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-accent/5",
          isDragActive && "border-primary bg-accent/10",
          dragActive && "border-primary bg-accent/10",
          error && "border-destructive bg-destructive/5"
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            input?.click();
          }
        }}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
            {error ? (
              <AlertCircle className="w-8 h-8 text-destructive" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {error ? "Upload Failed" : "Upload Syllabus"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {error || `Drag and drop your ${getAcceptedTypesText()} file here, or click to browse`}
            </p>
            {!error && (
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10MB
              </p>
            )}
          </div>
          
          {!error && (
            <Button variant="outline" size="sm">
              Choose File
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center space-x-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
