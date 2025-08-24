"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  progress: number;
  status: string;
  className?: string;
}

export function UploadProgress({ progress, status, className }: UploadProgressProps) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{status}</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Upload progress"
        />
      </div>
    </div>
  );
}
